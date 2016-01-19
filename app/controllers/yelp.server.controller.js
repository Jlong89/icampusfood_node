// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
var Foodloc = require('mongoose').model('Foodloc'),
	yelp = require("node-yelp"),
	config = require("../../config/config.js");


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

var client = yelp.createClient({
  oauth: {
    "consumer_key": config.yelp.consumer_key,
    "consumer_secret": config.yelp.consumer_secret,
    "token": config.yelp.token,
    "token_secret": config.yelp.token_secret
  },
  
  // Optional settings: 
  httpClient: {
    maxSockets: 10  // ~> Default is 10 
  }
});


//makes query and gets food restaurants data from yelp and inserts a new foodloc for each location gotten from yelp
exports.getYelpBizz = function(req, res, next) {
	var foodType = req.query.type;
	if(foodType===undefined) return next('need to give a food type to search'); 
	if(req.query.zip === undefined || isNaN(req.query.zip)) return next('need to give a zipcode where to search');
	var zipcode = Number(req.query.zip);
	 
	var limit = Number(req.params.limit) || 10;
	console.log('searching for ' +limit + 'foodType: '+foodType + ' in zip: '+zipcode);
	//defined types for our database
	var types = {
		"italian": 'italian',
		"japanese": 'japanese',
		"chinese": 'chinese',
		"cafes": 'cafes',
		"fast_food": 'hotdogs',
		"desserts": 'desserts',
		"mexican":"mexican"
	}
	var yelpType = types[foodType];

	if(yelpType !== undefined) {

		console.log("fetching data from yelp...");
		client.search({
				terms: "food",
				location: zipcode,
				limit: limit,
				radius_filter: 3000, 
				actionLinks: true,
				category_filter: yelpType
			}).then(function (data) {

				var businesses = data.businesses;

				businesses.forEach(function (business) {
					var newLoc = {};
					if("name" in business) {
					  newLoc.name = business.name;

					}
					if("rating" in business) {
					  newLoc.avgFoodRating = business.rating;
					}
					var location = business.location;
					if("display_address" in location) {
					  newLoc.address = location.display_address;
					}
					newLoc.loc = [location.coordinate.longitude, location.coordinate.latitude ];
					if("review_count" in business) newLoc.noPosts = business.review_count;
					newLoc.foodType = foodType;

					var loc = new Foodloc(newLoc);
					//try saving the new location
					loc.save(function(err) {
						if (err) {
							// Use the error handling method to get the error message
							var message = getErrorMessage(err);
							console.log('error: ' + message);
						}
						console.log('new foodloc '+loc.name+' saved successfully');
					});
				});
				res.status(200).json({success: true, message:"inserted new locs successfully!!!"});
			});
	} else {
		res.status(400).json({error: "use a valid food type"});
	}
};




