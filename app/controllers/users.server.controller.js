// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var User = require('mongoose').model('User'),
	passport = require('passport'),
	auth = require('./auth.server.controller');
	//jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens;

//mongoose error handler
var getErrorMessage = function(err) {
  // If an internal MongoDB error occurs get the error message
  if (err.errors) {
  	for (var errName in err.errors) {
  		if(err.errors[errName].message) return err.errors[errName].message;
  	}
  } else {
  	return 'Unknown server error';
  }
};


// Create a new controller method that creates new 'local' users
exports.signup = function(req, res, next) {
	// If user is not connected, create and login a new user
	User.findOne({username: req.body.username}).exec(function(err, user){
		if (!user) {
			// Create a new 'User' model instance
			var user = new User(req.body);
			var message = null;

			// Set the user provider property to local
			user.provider = 'local';
			// Try saving the new user document
			user.save(function(err) {
				// If an error occurs, use flash messages to report the error
				if (err) {
					// Use the error handling method to get the error message
					var message = getErrorMessage(err);

					res.status(400).json({error: message});
					return;
				}
				console.log('User saved successfully');
				var newToken = auth.getToken(user, req.params.secret);
	    		res.status(200).json({ success: true,
	    				message: 'user signedup successfully',
	    				token: newToken,
	    				newUser: user
	    			 });
			});
		} else {
			var newToken = auth.getToken(user, req.params.secret);
			res.status(200).json({
				success: true,
				message: 'user already exists',
				token: newToken,
				user: user
			})
		}
	});	
};

//signin to obtain token in response
exports.signin = function(req, res) {
	User.findOne({
		username: req.body.username
	}).exec( function(err, user) {
		if (err) {
			// Use the error handling method to get the error message
			var message = getErrorMessage(err);

			// return with error in res
			res.status(502).json({error: message});
			return;
		}

		if (!user) {
	      res.json({ success: false, message: 'Authentication failed. User not found.' });
	      return;
	    } else if (user) {
	      // check if password matches... use authenticate in user model
	      if (!user.authenticate(req.body.password)) {
	        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	        return;
	      } else {
	        // if user is found and password is right
	        // create a token
	        var newToken = auth.getToken(user, req.params.secret);
	        //remove password and salt before returning user object in response
	        delete user.password; delete user.salt;
	        //console.log('!!!!!!!!!!!!!!! '+user);
	        // return the information including token as JSON
	        res.json({
	          success: true,
	          message: 'this is your login token!',
	          token: newToken,
	          user: user
	        });
	      }   
    	}
	});
};

//used to save user profile from facebook into our User Model
exports.saveOAuthUserProfile = function(req, profile, done) {
	// Try finding a user document that was registered using the current OAuth provider
	User.findOne({
		provider: profile.provider,
		providerId: profile.providerId
	}, function(err, user) {
		// If an error occurs continue to the next middleware
		if (err) {
			return done(err);
		} else {
			// If a user could not be found, create a new user, otherwise, continue to the next middleware
			if (!user) {
				
				// Create the user
				user = new User(profile);

				// Try saving the new user document
				user.save(function(err) {
					// Continue to the next middleware
					return done(err, user);
				});
			} else {
				// Continue to the next middleware
				return done(err, user);
			}
		}
	});
};


//return user info based on local auth token provided
exports.getUserInfo = function(req, res) {
	//console.log('getting data for '+JSON.stringify(req.userid));
	res.status(200).json({succcess: true, user: req.user});
}


// Create a new controller middleware that is used to authorize authenticated operations 
exports.requiresLogin = function(req, res, next) {
	// If a user is not authenticated send the appropriate error message
	if (!req.isAuthenticated()) {
		return res.status(401).send({
			message: 'User is not logged in'
		});
	}

	// Call the next middleware
	next();
};