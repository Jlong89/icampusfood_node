// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var express     = require('express'),
	posts = require('../../app/controllers/post.server.controller'),
	foodlocs = require('../../app/controllers/foodloc.server.controller'),
	auth = require('../../app/controllers/auth.server.controller');

// Define the routes module' method
module.exports = function(app) {

	var apiRoutes = express.Router();

	//get posts by foodloc_id
	apiRoutes.get('/listbyfoodloc/:foodloc_id', posts.listByLoc);

	//mount authentication layer for all paths, all request to middleware after this need to be authorized
	apiRoutes.use(function(req, res, next) {
		//req.params.secret = app.get('superSecret');
		//console.log('getting secret: '+app.get('superSecret'));
		auth.authenticate(req, res, next, app.get('superSecret'));
	});

	//mount url for insert new food location
	apiRoutes.post('/insert/:foodloc_id', posts.insertNewPost);

	//handle rest of crud, for update and delete, need authorization
	apiRoutes.route('/post/:postid')
			.get(posts.read)
			.put(posts.hasAuthorization, posts.update)
			.delete(posts.hasAuthorization, posts.delete);

	//get posts by user
	apiRoutes.get('/listbyuser', posts.listByUser);

	//get posts by user and foodloc
	apiRoutes.get('/listbylocanduser/:foodloc_id', posts.listByLocAndUser);

	//handle url params
	apiRoutes.param('foodloc_id', foodlocs.foodlocByID);
	apiRoutes.param('postid', posts.postByID);

	//mount apiRoutes to base
	app.use('/rest/posts', apiRoutes);

	//error handling
	app.use(function(err, req, res, next) {
		res.status(400).json({success:false, err});
	});
};