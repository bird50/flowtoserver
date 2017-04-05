// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-example-passport
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';
console.log('Hello server');
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var cookieParser = require('cookie-parser');
var session = require('express-session');





// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

/*
 * body-parser is a piece of express middleware that
 *   reads a form's input and stores it as a javascript
 *   object accessible through `req.body`
 *
 */
var bodyParser = require('body-parser');

/**
 * Flash messages for passport
 *
 * Setting the failureFlash option to true instructs Passport to flash an
 * error message using the message given by the strategy's verify callback,
 * if any. This is often the best approach, because the verify callback
 * can make the most accurate determination of why authentication failed.
 */
var flash      = require('express-flash');

// attempt to build the providers/passport config
var config = {};
try {
  config = require('../providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}

// -- Add your pre-processing middleware here --

// Setup the view engine (nunjucks)
var path = require('path');
var consolidate = require('consolidate');

//var nj=require('nunjucks');
 app.engine('html', consolidate.nunjucks);
 app.set('view engine', 'html');
 app.set('views', path.join(__dirname, 'views'));

// boot scripts mount components like REST API
//boot(app, __dirname);
boot(app, __dirname, function(err) {
  if (err) throw err;
  
  // start the server if `$ node server.js`
  if (require.main === module){
	  
    var appModels = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role','Test3','Test','Test2','m04','myuser','RidOffice','RidAgency','flowto','flowtoUser','accessToken','userCredential','userIdentity'];

var ds = app.dataSources.db;

ds.isActual(appModels, function(err, actual) {
	//console.log('asdfasdfasdffd');
  //if (!actual) {
	
    ds.autoupdate(appModels, function(err) {
      if (err) throw (err);
    });
  //}
});
}
});

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));

app.middleware('session:before', cookieParser(app.get('cookieSecret')));
app.middleware('session', session({
  secret: 'kitty',
  saveUninitialized: true,
  resave: true,
}));
passportConfigurator.init();

// We need flash messages to see passport errors
app.use(flash());

passportConfigurator.setupModels({
  userModel: app.models.flowtoUser,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});
for (var s in config) {
  var c = config[s];
  c.session = c.session !== false;
  passportConfigurator.configureProvider(s, c);
}
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

app.get('/', function(req, res, next) {
  res.render('pages/index', {user:
    req.user,
    url: req.url,
  });
});

app.get('/auth/account', ensureLoggedIn('/login'), function(req, res, next) {
	console.log(req.user);
  res.render('loginfinish.html', {
    user: req.user,
    url: req.url,
  });
});

app.get('/local', function(req, res, next) {
  res.render('pages/local', {
    user: req.user,
    url: req.url,
  });
});

app.get('/signup', function(req, res, next) {
  res.render('pages/signup', {
    user: req.user,
    url: req.url,
  });
});

app.post('/signup', function(req, res, next) {
  var User = app.models.user;

  var newUser = {};
  newUser.email = req.body.email.toLowerCase();
  newUser.username = req.body.username.trim();
  newUser.password = req.body.password;

  User.create(newUser, function(err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    } else {
      // Passport exposes a login() function on req (also aliased as logIn())
      // that can be used to establish a login session. This function is
      // primarily used when users sign up, during which req.login() can
      // be invoked to log in the newly registered user.
      req.login(user, function(err) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        return res.redirect('/auth/account');
      });
    }
  });
});

app.get('/login', function(req, res, next) {
  res.render('pages/login', {
    user: req.user,
    url: req.url,
  });
});

app.get('/auth/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

app.get('/google', function(req, res, next) {
  res.render('google.html', {
    client_id: "750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com",
	
    scope: "https://www.googleapis.com/auth/userinfo.email",
	approval_prompt:"force",
	access_type:"offline",
	redirect_uri:"http://bid.rid.go.th:3001/gcb"
  });
});
app.get('/gcb', function(req, res, next) {
	console.log(req.query);
	var thecode=req.query.code;
var google = require('./lib/googleapis.js');
	var OAuth2Client = google.auth.OAuth2;
	var oauth2Client = new OAuth2Client("750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com","9bipSH6rHVHqRxR0aaET1Sz-" , "http://bid.rid.go.th:3001/gcb");
	oauth2Client.generateAuthUrl({
		    access_type: 'offline', 
	 scope:'https://www.googleapis.com/auth/userinfo.email' // 
			});
			oauth2Client.getToken(thecode,function(err,tokens){
		        if (err) {
					console.log(err);
		        }
				console.log(tokens);
			});
	/*
	function getAccessToken (oauth2Client, callback) {
	  // generate consent page url
	  var url = oauth2Client.generateAuthUrl({
	    access_type: 'offline', // will return a refresh token
	    scope: 'https://www.googleapis.com/auth/userinfo.email' // can be a space-delimited string or an array of scopes
		});
		oauth2Client.getToken(code, function (err, tokens) {
		      if (err) {
		        return callback(err);
		      }
		      // set tokens to the client
		      // TODO: tokens should be set by OAuth2 client.
		      oauth2Client.setCredentials(tokens);
		      callback();
		    });
	  });
    }
		*/

  res.render('gcb.html', {
    client_id: "750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com",
	client_secret:"9bipSH6rHVHqRxR0aaET1Sz-",
    scope: "https://www.googleapis.com/auth/userinfo.email",
	approval_prompt:"force",
	access_type:"offline",
	redirect_uri:"http://bid.rid.go.th:3001/gcb",
	code:thecode
  });
});

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
