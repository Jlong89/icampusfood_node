// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies

var	jwt = require('jsonwebtoken'),
	User = require('mongoose').model('User'),
	passport = require('passport'); // used to create, sign, and verify tokens;



exports.getToken = function(user, secret) {
	return jwt.sign(user, secret, {
	          expiresIn: 86400 // expires in 24 hours
	        });
};

exports.authenticate = function(req, res, next, secret) {
	//first acquire the auth method specified by client
	var auth_method = req.headers.auth_method;

	console.log('acquired auth method: '+ auth_method);


	if(auth_method === 'local') {
		 var token =  req.headers['access_token'] || req.body.access_token || req.query.access_token;

	  // decode token
	  if (token) {
	    // verifies secret and checks exp  
	    jwt.verify(token, secret, function(err, decoded) {      
	      if (err) {
	      	//console.log(err);
	        next(err);
	      } else {
	        // if everything is good, save user to request for use in other middleware
	        User.findOne({_id: decoded._doc._id}, '-password -salt', function(err, user) {
	        	if(err) {
	        		next(err);
	        	} else {
	        		req.user = user;
	        		next();
	        	}
	        });
	        /*
	        req.userid = decoded._doc._id;    
	        //console.log('decoded user:' +JSON.stringify(decoded));
	        next();*/
	      }
	    });

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(403).json({ 
	        success: false, 
	        message: 'Local auth: No token provided.' 
	    });
	    
	  }
	} else if (auth_method === 'facebook') {
		(function(req, res, next) {
			//call on passport's facebook-token to authenticate token
		    passport.authenticate('facebook-token', function(error, user, info) {
		    	if(error) {
		    		 next(error);
		    	} else {
		    		// if everything is good, save user to request for use in other middleware
	    			req.user = user;
	    			next();
	    		}
	    	})(req, res, next);
		})(req, res, next);
	} else {
		res.status(403).json({
			success: false,
		 	message: "No auth method provided, specify in body with key auth_method"});
	}
};

