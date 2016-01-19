// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var config = require('./config'),
	express = require('express'),
	morgan = require('morgan'),
	compress = require('compression'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	flash = require('connect-flash'),
	passport = require('passport');

// Define the Express configuration method
module.exports = function() {
	// Create a new Express application instance
	var app = express();

	// Use the 'NDOE_ENV' variable to activate the 'morgan' logger or 'compress' middleware
	if (process.env.NODE_ENV === 'development') {
		app.use(morgan('dev'));
	} else if (process.env.NODE_ENV === 'production') {
		app.use(compress());
	}
	var port = process.env.PORT || 8080; // used to create, sign, and verify tokens

	// Use the 'body-parser' and 'method-override' middleware functions
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	/*
	// Configure the 'session' middleware
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret
	}));
	*/
	//set secret variable for token auth
	app.set('superSecret', config.secret); 
	// Set the application view engine and 'views' folder
	app.set('views', './app/views');
	app.set('view engine', 'ejs');

	// Configure the flash messages middleware
	app.use(flash());

	// Configure the Passport middleware
	app.use(passport.initialize());
	app.use(passport.session());

	//basic route
	app.get('/', function(req, res) {
    	res.send('Hello! The iCampusFood API is at http://localhost:' + port + '/api');
	});

	// Load the routing files
	require('../app/routes/users.server.routes.js')(app);

	require('../app/routes/foodloc.server.routes.js')(app);

	require('../app/routes/yelp.server.routes.js')(app);

	require('../app/routes/posts.server.routes.js')(app);

	// Configure static file serving
	//app.use(express.static('./public'));

	// Return the Express application instance
	return app;
};