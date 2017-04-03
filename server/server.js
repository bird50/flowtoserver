'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var cookieParser = require('cookie-parser');
var app = module.exports = loopback();

var session =require('express-session');



// Setup the view engine (jade)
var path = require('path');
var consolidate = require('consolidate');

//var nj=require('nunjucks');
 app.engine('html', consolidate.nunjucks);
 app.set('view engine', 'html');
 app.set('views', path.join(__dirname, 'views'));

 // Bootstrap the application, configure models, datasources and middleware.
 // Sub-apps like REST API are mounted via boot scripts.
 boot(app, __dirname, function(err) {
   if (err) throw err;
  
   // start the server if `$ node server.js`
   if (require.main === module){
     var appModels = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role','Test3','Test','Test2','m04','myuser','RidOffice','RidAgency','flowto','flowtoUser','accessToken','userCredential','userIdentity'];

 var ds = app.dataSources.db;

// ds.isActual(appModels, function(err, actual) {
  // if (!actual) {
     ds.autoupdate(appModels, function(err) {
       if (err) throw (err);
 	});
//   }//if (!actual) {
// }); //ds.isActual
   }//if (require.main === module)
});//boot




app.get('/test', function(req, res, next) {
  res.render('_test.html', {
    user: req.user,
    url: req.url,
  });
});

// Passport configurators..
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);
//app.use(loopback.session({ secret: 'keyboard cat' }));

var config = {};
try {
 config = require('../providers.json');
} catch(err) {
 console.error('Please configure your passport strategy in `providers.json`.');
 console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
 process.exit(1);
}

// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
}));


// Initialize passport
passportConfigurator.init();


// Set up related models
passportConfigurator.setupModels({
  userModel: app.models.flowtoUser,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential
});
// Configure passport strategies for third party auth providers
for(var s in config) {
 var c = config[s];
 c.session = c.session !== false;
 passportConfigurator.configureProvider(s, c);
}


var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;


//app.get('/auth/account',ensureLoggedIn('/login'), function(req, res, next) {
app.get('/auth/account', function(req, res, next) {
	console.log(req.user);
	console.log(req.url);
  res.render('loginfinish.html', {
    user: req.user,
    url: req.url,
  });
});
app.get('/auth/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

app.get('/login', function(req, res, next) {
	console.log(req.user);
	console.log(req.url);
    res.render('loginfinish.html', {
      user: req.user,
      url: req.url,
    });
});
app.get('/login.html', function(req, res, next) {
	console.log(req.toJSON);
	//console.log(req.url);
    res.render('loginfinish.html', {
      user: req.user,
      url: req.url,
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



//flowtoUser.nestRemoting('RidAgency');
// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}

