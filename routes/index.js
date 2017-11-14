var express = require('express');
var request = require('request');
var router = express.Router();
var qs = require('qs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/helloworld', function(req, res) {
  res.render('helloworld', { title: 'Hello, World!' });
});

router.get('/spotify-login', function(req, res) {
  // res.render('spotify-login', { title: 'Spotify Log in' });
  var scopes = 'user-read-private user-read-email';

  res.redirect('https://accounts.spotify.com/authorize?' +
    qs.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scopes,
      redirect_uri: redirectUri,
    }));
});

router.get('/spotify-callback', function(req, res) {
  var code = req.query.code || null;
  console.log('CALLBACK WOO', code);
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var accessToken = body.access_token;
      var refreshToken = body.refresh_token;
      var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + accessToken },
        json: true
      };

      // use the access token to access the Spotify Web API
      request.get(options, function(error, response, body) {
        console.log(body);
      });

      // we can also pass the token to the browser to make requests from there
      res.redirect('/#' +
        qs.stringify({
          access_token: accessToken,
          refresh_token: refreshToken
        })
      );
    } else {
      res.redirect('/#' +
        qs.stringify({
          error: 'invalid_token'
        })
      );
    }
  });
});

module.exports = router;
