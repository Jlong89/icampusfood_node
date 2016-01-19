// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var passport = require('passport'),
	url = require('url'),
	FacebookTokenStrategy = require('passport-facebook-token'),
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller');

// Create the Facebook strategy configuration method
module.exports = function() {
	// Use the Passport's Facebook strategy 
	passport.use(new FacebookTokenStrategy({
			clientID: config.facebook.clientID,
			clientSecret: config.facebook.clientSecret,
			callbackURL: config.facebook.callbackURL,
			profileFields: ['id', 'displayName', 'emails'],
			passReqToCallback: true
		},
		function(req, accessToken, refreshToken, profile, done) {
			// Set the user's provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;
			console.log(profile);
			// Create the user OAuth profile
			var providerUserProfile = {			
				email: profile.emails[0].value,
				username: profile.emails[0].value,
				password: '********',
				provider: 'facebook',
				providerId: profile.id,
				providerData: providerData
			};
			//console.log('!!!!!!!!!!!!!!'+JSON.stringify(providerUserProfile));

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
	));
};