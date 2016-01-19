// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//Define schema for food locations foodloc
var FoodlocSchema = new Schema({
	name: {
		type: String,
		required: 'Name for foodloc is required',
		trim: true,
		index: true
	},
	foodType: {
		type: String,
		enum: [ 'italian', 'japanese', 'chinese', 'cafes', 'fast_food', 'desserts', 'mexican']
	},
	avgFoodRating: {
		type: Number,
		default: 2.5,
		validate: [
			function(avgFoodRating) {
				return avgFoodRating >= 0 && avgFoodRating <=5;
			}, 'rating should be between 0 and 5'
		]
	},
	hours: {
		open: {
			type: String,
			default: '0800'
		},
		close: {
			type: String,
			default: '1000'
		}
	},
	address: {
		type: [String]
	},
	date: { 
		type: Date, 
		default: Date.now 
	},
	loc : {
	    type: [Number],
	    required: 'location is required',
	    index: '2dsphere'
	},
	noPosts: {
		type: Number,
		default: 0
	},
	dist: {
		calculated: {
			type: Number
		}
	}

});
//give 2dsphere index to loc property
//FoodlocSchema.index({ loc: '2dsphere' });


// Configure the 'FoodlocSchema' to use getters and virtuals when transforming to JSON
FoodlocSchema.set('toJSON', {
	getters: true,
	virtuals: true
});

// Create the 'User' model out of the 'UserSchema'
mongoose.model('Foodloc', FoodlocSchema);