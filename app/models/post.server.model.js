// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Define schema for food locations foodloc
var PostSchema = new Schema({
	title: {
		type: String,
		required: 'Posts need a title!'
	},
	user: {
		type: Schema.ObjectId,
		ref:'User',
		required: 'A user is required or a post'
	},
	foodloc: {
		type: Schema.ObjectId,
		ref: 'Foodloc',
		required: 'A location is required for a post'
	},
	comments: {
		type: String
	},
	rating: {
		type: Number,
		required: 'A rating is required',
		validate: [
			function(rating) {
				return rating >= 0 && rating <=5;
			}, 'rating should be between 0 and 5'
		]
	},
	created: {
		type: Date,
		// Create a default 'created' value
		default: Date.now
	}

});



// Configure the 'UserSchema' to use getters and virtuals when transforming to JSON
PostSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('Post', PostSchema);