// Invoke 'strict' JavaScript mode
'use strict';

// Load the module dependencies
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


//find a foodloc by Id to be used by other middleware
exports.foodlocByID = function(req, res, next, id) {
	Foodloc.findById(id).exec( function(err, foodloc) {
		if(err) return next(err);
		if(!foodloc) return next({message:"failed to find doc with id: "+id});
		//console.log('foodloc: '+foodloc);
		req.foodloc = foodloc;
		next();
	});
};

//read a foodloc 
exports.read = function(req, res) {
	res.json(req.foodloc);
};

//finds locations within radius of point specified with longitude and latitude and conditions specified in query
exports.nearby = function(req, res, next) {
	//TODO: query is still not matching all names given in url query
	var query = req.query;
	//console.log('!!!!!!!!!'+query.radius);

	//get params from url query
	var types ={
		"italian":'',"japanese":'',"chinese":'',"cafes":'',"fast_food":'',"desserts":'',"mexican":''
	};
	var radius = query.radius;
	if(radius !== undefined && isNaN(radius)) return next('need to specify a number radius in meters');
	var k = query.k;
	if(k !== undefined && isNaN(k)) return next('need to specify a number for k');
	var type = query.type;
	if(type !== undefined && !(type in types)) return next('please specify a valid food type');
	var longitude = query.longitude;
	if(longitude === undefined || isNaN(longitude) || longitude< -180 || longitude >180) return next('please specify a valid longitude value');
	var latitude = query.latitude;
	if(latitude === undefined || isNaN(latitude) || latitude< -90 || latitude >90) return next('please specify a valid latitude value');
	var loc_name = query.name;
	var sortbyrating = query.sortbyrating;

	//compose geonear query obj
	var geoNear = { 
		"$geoNear": {
		        "near": {
		          "type": "Point",
		          "coordinates": [ Number(longitude), Number(latitude) ]
		        },
		        "maxDistance": Number(radius) || 1000,
		        "spherical": true,
		        "distanceField": "dis"
		    }
		};

	var and = [];  //arr used in match query
	if(loc_name !== undefined) {
		and.push({"name": {"$regex": '^'+loc_name, "$options": 'i'}});
	}
	if(type !== undefined) {
		and.push({"foodType": type});
	}

	var match = {"$match" : {
					'$and': and}
				};

	//console.log('!!!!!!!!'+JSON.stringify(match));

	//define an array to hold aggregate query commands
	var aggArr = [geoNear, { "$skip": 0 }, { "$limit": Number(k) || 10 }];

	//if url query has a name param, then add match to aggregate
	if(loc_name !== undefined || type !== undefined) aggArr.splice(1, 0, match); //match should go right after geonear, before skip and limit

	//if sortbyrating param is set to true, sort by avgFoodRating, get sorted by dist, default for geonear
	if(sortbyrating !== undefined && sortbyrating === 'true'){
		Foodloc.aggregate(aggArr).sort('-avgFoodRating').exec( function(error, docs) {
			 		if(error) {
			 			next(error);
			 		}
			 		
			 		res.status(200).json(docs); 	
		});
	} else {
		Foodloc.aggregate(aggArr).exec( function(error, docs) {
				 		if(error) {
				 			next(error);
				 		}
				 		
				 		res.status(200).json(docs); 	
		    });
	}
};


//inserts new foodloc into mongo based on json from req
exports.insertNewLoc = function(req, res) {
	var reqBody = req.body;
	//create the new location object to be inserted
	var loc = new Foodloc({name: reqBody.name, foodType: reqBody.foodType, loc: reqBody.location, avgFoodRating: reqBody.avgFoodRating, 
		 hours: reqBody.hours, address: reqBody.address
	});

	//try saving the new location
	loc.save(function(err) {
	// If an error occurs, use flash messages to report the error
		if (err) {
			// Use the error handling method to get the error message
			var message = getErrorMessage(err);

			res.status(400).json({error: message});
			return;
		}
		console.log('new foodloc '+loc.name+' saved successfully');
		res.json({ success: true,
				newloc: loc
			 });
	});
};