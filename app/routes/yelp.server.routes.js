// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var express     = require('express'),
	yelp = require('../../app/controllers/yelp.server.controller');

// Define the routes module' method
module.exports = function(app) {

	var apiRoutes = express.Router();


	//mount url for insert new food location
	apiRoutes.post('/', yelp.getYelpBizz);

	//mount apiRoutes to base
	app.use('/rest/yelp', apiRoutes);

};