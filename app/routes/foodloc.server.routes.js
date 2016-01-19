// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var express     = require('express'),
	foodlocs = require('../../app/controllers/foodloc.server.controller'),
	auth = require('../../app/controllers/auth.server.controller');

// Define the routes module' method
module.exports = function(app) {

	var apiRoutes = express.Router();

	
	//set authentication for every path in the routes
	apiRoutes.use(function(req, res, next) {
		//req.params.secret = app.get('superSecret');
		//console.log('getting secret: '+app.get('superSecret'));
		//send request to the authenticated with token before proceeding to other paths
		auth.authenticate(req, res, next, app.get('superSecret'));
	}); 
	
	//mount url for insert new food location
	apiRoutes.post('/insert', foodlocs.insertNewLoc);
	//read a foodloc
	apiRoutes.get('/foodloc/:foodlocId', foodlocs.read);
	//handle url params
	apiRoutes.param('foodlocId', foodlocs.foodlocByID);

	//mount middleware to handle looking for locs within ranges 
	apiRoutes.get('/nearby', foodlocs.nearby);

	//mount apiRoutes to base
	app.use('/rest/foodlocs', apiRoutes);

	//error handling
	app.use(function(err, req, res, next) {
		res.status(400).json({success:false, err});
	});

};