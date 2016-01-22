// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var Post = require('mongoose').model('Post');
var Foodloc = require('mongoose').model('Foodloc');

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

//middleware that checks that user signed in is user of post in question
exports.hasAuthorization = function(req, res, next) {
	if(req.user.id !== req.post.user.id) {
		return next('User not authorized to this post');
	}
	next();
};


//inserts new foodloc into mongo based on json from req
exports.insertNewPost = function(req, res, next) {
	var rating = Number(req.body.rating);
	var comment = req.body.comment;
	var title = req.body.title;

	//create the new location object to be inserted
	var post = new Post({title: title, comment: comment, rating: rating});
	post.user = req.user;
	post.foodloc = req.foodloc;
	//try saving the new post
	post.save(function(err) {
	// If an error occurs, use flash messages to report the error
		if (err) {
			// Use the error handling method to get the error message
			//console.log('!!!!!!!!!!!!!!'+JSON.stringify(err));
			var message = getErrorMessage(err);

			res.status(400).json({error: message});
			return;
		}
		//update posts's foodloc's rating and no of posts
		Foodloc.findById(post.foodloc).populate('user').exec( function(err, foodloc) {
			if(err) return next(err);
			if(!foodloc) return next({message:"failed to find doc with id: "+id});
			var curavg = foodloc.avgFoodRating;
			var curtotal = curavg*foodloc.noPosts;
			var newavg = (curtotal+rating)/(foodloc.noPosts+1);
			//console.log('curtotal= '+curtotal+' noPosts='+foodloc.noPosts+' newavg= '+newavg);
			foodloc.avgFoodRating = newavg;
			foodloc.noPosts = foodloc.noPosts+1;
			//console.log('!!!!!!!!!!!!!'+JSON.stringify(foodloc));
			foodloc.save( function(err, doc) {
				if(err) {		
					return next(err);
				}
			});
		});
		console.log('new post from '+post.user.username+' saved successfully');
		res.json({ success: true,
			newpost: post
		});
	});
};

//obtain posts by the signed in user
exports.listByUser = function(req, res, next) {
	var user = req.user;
	//console.log('!!!!!!!!!!!'+JSON.stringify(user));
	Post.find({'user':user.id
	}).exec( function(err, posts) {
		if(err) {
			next(err);
		} 
		res.status(200).json(posts);
	});
};
//obtain posts by foodloc_id
exports.listByLoc = function(req, res, next) {
	Post.find({'foodloc':req.params.foodloc_id
	}).exec( function(err, posts) {
		if(err) {
			next(err);
		} 
		res.status(200).json(posts);
	});
};

exports.listByLocAndUser = function(req, res, next) {
	Post.find({"$and":[
			{'foodloc':req.params.foodloc_id},
			{'user': req.user.id}
		]}).exec( function(err, posts) {
		if(err) {
			next(err);
		} 
		res.status(200).json(posts);
	});	
};

//find a post by Id to be used by other middleware
exports.postByID = function(req, res, next, id) {
	Post.findById(id).populate('user', 'username').populate('foodloc', 'name avgFoodRating').exec( function(err, post) {
		if(err) return next(err);
		if(!post) return next({message:"failed to find doc with id: "+id});
		//console.log('foodloc: '+foodloc);
		req.post = post;
		next();
	});
};

//read a foodloc 
exports.read = function(req, res) {
	res.json(req.post);
};

//update a post
exports.update = function(req, res) {
	//update fields
	var post = req.post;
	if(req.body.rating !== undefined && !isNaN(req.body.rating))  post.rating = req.body.rating;
	if(req.body.comments !== undefined) post.comment = req.body.comments;
	if(req.body.title !== undefined) post.title = req.body.title;
	//try saving updated post
	post.save(function(err) {
		if(err) {
			return next(err);
		} else {
			res.json({success: true, 
					updatedPost: post
			});
		}
	});
};

//delete a post
exports.delete = function(req, res, next) {

	req.post.remove(function(err) {
		if(err) {
			return next(err);
		} else {

			res.json({success: true,
				deletedPost:
				req.post});
		}
	});
};

