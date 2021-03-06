// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var express     = require('express'),
	users = require('../../app/controllers/users.server.controller'),
	auth = require('../../app/controllers/auth.server.controller'),
	passport = require('passport');

// Define the routes module' method
module.exports = function(app) {

	var apiRoutes = express.Router();

	// Set up the 'signup' routes 
	apiRoutes.post('/signup', function(req ,res, next ){
		req.params.secret = app.get('superSecret'); //secret is used in users.authenticate, so store it in req to be available in next
		next();
	}, users.signup);

	// Set up the 'authenticate' routes 
	apiRoutes.post('/signin', function(req, res, next) {
			req.params.secret = app.get('superSecret'); //secret is used in users.authenticate, so store it in req to be available in next
			next();
		}, users.signin);

	//facebook signin routes
	apiRoutes.get('/signin/facebook', passport.authenticate('facebook', {
		scope: 'email',
		failureRedirect:'/rest/users/facebook/error'
	}));

	/*
	apiRoutes.get('/signin/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/rest/users/facebook/success',
		failureRedirect: '/rest/users/facebook/error'
		
	}));*/

	apiRoutes.get('/signin/facebook/callback', function(req, res, next) {
		passport.authenticate('facebook', function(err, user, info) {
		    if (err) { return next(err); }
		    if (!user) { return res.status(400).json('user not found'); }
		    //console.log('!!!!!!!!!!'+JSON.stringify(user));
		    return res.status(200).json({success: true, 
		    							user: {
		    								username: user.username,
		    								accessToken: user.providerData.accessToken
		    							}});
		  })(req, res, next);
	});
	
	// route middleware to verify a token... important!!! middleware mounted after this need to pass through this verification! everything before this
	// does does require token verification
	apiRoutes.use(function(req, res, next) {
		//req.params.secret = app.get('superSecret');
		//console.log('getting secret: '+app.get('superSecret'));
		auth.authenticate(req, res, next, app.get('superSecret'));
	});

	//get a user's information based on token provided in req
	apiRoutes.get('/user/info', function(req, res) {
		users.getUserInfo(req, res);
	});

	//mount the apiRoutes to the base url
	app.use('/rest/users', apiRoutes);

	//error handling
	app.use(function(err, req, res, next) {
		res.status(400).json({success:false, err});
	});
	
	
};