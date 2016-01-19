// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies

var	jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens;

exports.getToken = function(user, secret) {
	return jwt.sign(user, secret, {
	          expiresIn: 1440 // expires in 24 hours
	        });
};

exports.verifyToken = function(req, res, next, secret) {

	  // check header or url parameters or post parameters for token
	  var token = req.body.token || req.query.token || req.headers['x-access-token'];

	  // decode token
	  if (token) {

	    // verifies secret and checks exp
	    //var secret = req.params.secret;
	    //console.log('!!!!!!!!!'+secret);
	    jwt.verify(token, secret, function(err, decoded) {      
	      if (err) {
	      	console.log(err);
	        return res.json({ success: false, message: 'Failed to authenticate token.' });    
	      } else {
	        // if everything is good, save to request for use in other routes
	        req.decoded = decoded;    
	        next();
	      }
	    });

	  } else {

	    // if there is no token
	    // return an error
	    return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	    
	  }
	};