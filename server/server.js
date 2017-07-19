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
	  
    var appModels = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role','Test3','Test','Test2','m04','myuser','RidOffice','RidAgency','flowto','flowtoUser','accessToken','userCredential','userIdentity','assignment'];

var ds = app.dataSources.db;

ds.isActual(appModels, function(err, actual) {
	//console.log('asdfasdfasdffd');
  //if (!actual) {
	
    ds.autoupdate(appModels, function(err) {
		console.log('AutoUpdat modellllllllllllllllllll');
      if (err) throw (err);
    }); //ds
  //}
}); //isActual
} // if
}); //boot

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json({limit: '50mb'}));
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,limit: '50mb'
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

//app.use(loopback.bodyParser.json({limit: '50mb'}));
//app.use(loopback.bodyParser.urlencoded({limit: '50mb', extended: true}));

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
	var google = require('googleapis');  
	var OAuth2 = google.auth.OAuth2;

	var oauth2Client = new OAuth2("750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com", "9bipSH6rHVHqRxR0aaET1Sz-", "http://bid.rid.go.th:3001/gcb");

	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/drive',
	  'https://www.googleapis.com/auth/userinfo.email'
	];

	var url = oauth2Client.generateAuthUrl({  
	  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
	  scope: scopes // If you only need one scope you can pass it as string
	});
	console.log('url:'+url);
	res.redirect(url);
	
	/*
  res.render('google.html', {
    client_id: "750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com",
	
    scope: "https://www.googleapis.com/auth/userinfo.email",
	approval_prompt:"force",
	access_type:"offline",
	redirect_uri:"http://bid.rid.go.th:3001/gcb"
  });*/
});
	
app.get('/gcb', function(req, res, next) {
	console.log(req.query);
	//var thecode=req.query.code;
    var code = req.query.code;
	var google = require('googleapis');  
	var OAuth2 = google.auth.OAuth2;

	var oauth2Client = new OAuth2("750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com", "9bipSH6rHVHqRxR0aaET1Sz-", "http://bid.rid.go.th:3001/gcb");

	
     oauth2Client.getToken(code, function(error, tokens) {
		 console.log('oauth2Client.getToken:'+tokens);
       if (error) {res.send(error)};
       var accessToken = tokens.access_token;
	   console.log('Tok:'+accessToken);
	   //res.render('gcb.html',{
		 //  'access_token':accessToken
		   //});
		var request = require('request');
		var url="https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token="+accessToken;
		request(url, function (error, response, body){
		console.log('error:', error); // Print the error if one occurred 
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		console.log('body:', body); //
		var flowtoUser=app.models.flowtoUser;
		// 1. check ว่า ใน RID gmail มี mail นี้ไหม (ข้ามไปก่อน)
		flowtoUser.findOne({
			"filter":{
				"where":{"email":body.email}
			}
		},function(err,theUser){
			console.log('email search:'+body['email']);
			console.log('theUser:'+JSON.stringify(theUser));
		});
		//Account.find({where: {name: 'John'}, limit: 3}, function(err, accounts) { /* ... */ });
		
		// 2 check ว่า user ในระบบ มี gmail นี้หรือยัง ถ้ายัง สร้างใหม่
		// 3 login
			
		});//request
       //either save the token to a database, or send it back to the client to save.
       //CloudBalance sends it back to the client as a json web token, and the client saves the token into sessionStorage
});//app.get('/gcb')


/*

  res.render('gcb.html', {
    client_id: "750910688956-5g4vvfqe10g44l2nc7uk5pi9vp4qeg21.apps.googleusercontent.com",
	client_secret:"9bipSH6rHVHqRxR0aaET1Sz-",
    scope: "https://www.googleapis.com/auth/userinfo.email",
	approval_prompt:"force",
	access_type:"offline",
	redirect_uri:"http://bid.rid.go.th:3001/gcb",
	code:thecode
  });
	*/
});

////test multer 
var multer  =   require('multer');


app.post('/photo/:container',function(req,res,next){
	var storage =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, './uploads/'+req.params.container);
	  },
	  filename: function (req, file, callback) {
	    //callback(null, file.fieldname + '-' + Date.now());
		callback(null,file.originalname);
	  }
	});

	var upload = multer({ storage : storage}).single('file');
  upload(req,res,function(err) {
	// upload then resize with sharp
	  console.log('req//////////');
	  console.log(req.file);
	  console.log('res//////////');
	  console.log(res.file);
	  /*
	  var fs = require('fs');
var dir = './tmp';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
	  */
	  var fs = require('fs');
	  var dir=req.file.destination+'/mid';
	  if (!fs.existsSync(dir)){
		  console.log('create dir:'+dir);
	      fs.mkdirSync(dir);
	  }
	  var dir2=req.file.destination+'/thumb';
	  if (!fs.existsSync(dir2)){
		  console.log('create dir:'+dir2);
	      fs.mkdirSync(dir2);
	  }
	
	//import sharp from 'sharp';
	var sharp= require('sharp');
	sharp(req.file.path)
		.rotate()
		.resize(1477)
		.withMetadata()
	//	.toBuffer()
    .toFile(req.file.destination+'/mid/'+req.file.filename,
		function(err,info){
		if(err){console.log(err)};
		console.log('resize to '+req.file.path);
		console.log(info);
		}
	)
sharp(req.file.path)
	.rotate()
	.resize(400)
//	.toBuffer()
.toFile(req.file.destination+'/thumb/'+req.file.filename,
	function(err,info){
	if(err){console.log(err)};
	console.log('resize to '+req.file.path);
	console.log(info);
	}
)
   // .catch( err =>console.log('error'));
    if(err) {
      console.log(err)
      return res.end("Error uploading file."+err);
    }
	 
    res.end("File is uploaded");
  });
});

// for upload avatar of user 
app.post('/profile_upload',function(req,res,next){
	var storage =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, './profile_pics');
	  },
	  filename: function (req, file, callback) {
	    //callback(null, file.fieldname + '-' + Date.now());
		callback(null,file.originalname);
	  }
	});
	
	var upload = multer({ storage : storage}).single('file');
	upload(req,res,function(err) {
	// upload then resize with sharp
		console.log('req//////////');
		console.log(req.file);
		var sharp= require('sharp');
		sharp.cache(false);
		sharp(req.file.path)
		//.rotate()
		.resize(400)
	//	.toBuffer()
		.toFile(req.file.destination+'/thumb/'+req.file.filename,
			function(err,info){
				if(err){console.log(err)};
				console.log('resize to '+req.file.path);
				console.log(info);
			}
		);
	// .catch( err =>console.log('error'));
		if(err) {
			console.log(err);
			return res.end("Error uploading file."+err);
		}
	 
		res.end("File is uploaded");
	});
	  
});// post profile_upload

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
