iCampusFood in Node and MongoDB
===============================
web services for icampusfood project in node
--------------------------------------------

This is a port of the backend and database from my other project iCampusFood, to node and mongodb. Refer to https://github.com/Jlong89/icampusfood
for a detailed look at the original backend in java and postgres.

Description
-----------

Node was used as backend platform and Express to create RESTful web services that can be consumed by the client-end of the iCampusFood iOS app.
MongoDB was used as database and its geospatial features with geoJSON were taken advantage to handle geospatial data and queries. 
It also features a token authentication method that allows users to be authenticated with local method or by facebook.

The following shows the most important modules used:

```
  "express": as web framework,
  "jsonwebtoken": for generating token used for authentication in local auth method
  "mongoose": mongodb schema modeling, business logic and validation,
  "node-yelp": client module for searching and getting data from yelp API 
  "passport": authentication, facebook-token strategy was used for facebook authentication with tokens
```
Take a look at the package.json to see the complete list of node modules used

Installation and Testing
------------------------

First, you will need node on your machine and an instance of mongodb running locally. 
Install the node modules by running 'npm install' in the proj directory. Also, you will need to setup a
development env config file as follows:

```
	// Invoke 'strict' JavaScript mode
	'use strict';

	// Set the 'development' environment configuration object
	module.exports = {
		db: 'mongodb://localhost/icampusfood',
		secret: 'your app secret',
		facebook: {
			clientID: 'facebook app client ID',
			clientSecret: 'facebook app client secret',
			callbackURL: 'http://localhost:3000/rest/users/signin/facebook/callback'
		},
		yelp: {
			consumer_key: "your yelp app consumer key",
	    	consumer_secret: "your yelp app consumer secret",
	    	token: "your yelp app token",
	    	token_secret: "your yelp app token secret"
		}
	};
```

Save this file as development.js under config/env. You will have to create the env directory under config.
In the instance of mongodb, the 'icampusfood' db will hold the collections used for this application. The collections
are named 'users', 'foodlocs', and 'posts'.

RESTful services description
----------------------------

Run the app server with 'node server.js' at the root folder. 

Grabbing data from Yelp and storing in DB
------------------------------------------
First grab some restaurant data from Yelp to store in the database for testing.

GET METHOD URL endpoint: ```http://localhost/rest/yelp?type=foodtype&zip=90089&limit=10```

Available foodtypes: 'italian', 'mexican', 'japanese', 'chinese', 'desserts', 'fast_food', 'cafe'

At a minimum, you need to specify foodtype and zip, if limit is not specified, it will defaul to 10.

Data Reponse:
```
	{
	  "success": true,
	  "message": "inserted new locs successfully!!!"
	}
```

You can take a look at the locations in mongo running db.foodlocs.find() at the mongo interface.

Local User Signup
-----------------
Sign up using the local-token auth method

HTTP POST METHOD URL endpoint: ```http://localhost/rest/users/signup```

Send urlenconded form key-values:
```
	username - required
	password - required
	email - optional
```

Data Repsonse:
```
	{
    "success": true,
    "message": "user signedup successfully",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiaW5zZXJ0aW5nIjp0cnVlLCJnZXR0ZXJzIjp7fSwid2FzUG9wdWxhdGVkIjpmYWxzZSwiYWN0aXZlUGF0aHMiOnsicGF0aHMiOnsiY3JlYXRlZCI6ImRlZmF1bHQiLCJfaWQiOiJkZWZhdWx0IiwicHJvdmlkZXIiOiJyZXF1aXJlIiwicGFzc3dvcmQiOiJyZXF1aXJlIiwidXNlcm5hbWUiOiJyZXF1aXJlIn0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7ImNyZWF0ZWQiOnRydWUsIl9pZCI6dHJ1ZX0sImluaXQiOnt9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7InByb3ZpZGVyIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWV9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX19LCJpc05ldyI6ZmFsc2UsIl9tYXhMaXN0ZW5lcnMiOjAsIl9kb2MiOnsiY3JlYXRlZCI6IjIwMTYtMDEtMjBUMDU6MjQ6NTYuNzE0WiIsIl9pZCI6IjU2OWYxYTI4NzhjZmJjMTE1NWNiMWM4MCIsInBhc3N3b3JkIjoiVDlKZXByTE1QOW81R3dTMnlHKzFvMWd0SUNSTWlSRjZndFhtdUxoRTVrTGtmMnY3Zk1jU2VDV3JZZHZDMVMxTFFOcEo3MEYzNlhRL3dROUxvUFRDU0E9PSIsInVzZXJuYW1lIjoidGVzdHVzZXIxIiwicHJvdmlkZXIiOiJsb2NhbCIsInNhbHQiOiLvv73vv71I77-977-9JWrvv73vv71HK1x1MDAxMVx1MDAxY1ZcdTAwMTTvv70iLCJfX3YiOjB9LCJfcHJlcyI6eyJzYXZlIjpbbnVsbCxudWxsLG51bGwsbnVsbF19LCJfcG9zdHMiOnsic2F2ZSI6W119LCJpYXQiOjE0NTMyNjc0OTYsImV4cCI6MTQ1MzM1Mzg5Nn0.X5urVfW7vMH_KGwtU-Pydd6Vbeozl4sMMa8U7OApti0",
    "newUser": "testuser1"
  }
```
An auth token is returned and can be used in subsequent rest request that require token authentication, token is set with an expiration time of 24 hrs.

Local User Signin
-----------------

Sign in to the app using local method

HTTP POST METHOD URL endpoint: ```http://localhost/rest/signin```

Required urlenconded form key-values:

```
	username - required
	password - required
```

Data Reponse:
```
{
  "success": true,
  "message": "this is your login token!",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwiZ2V0dGVycyI6e30sIndhc1BvcHVsYXRlZCI6ZmFsc2UsImFjdGl2ZVBhdGhzIjp7InBhdGhzIjp7InByb3ZpZGVyIjoiaW5pdCIsInBhc3N3b3JkIjoiaW5pdCIsInVzZXJuYW1lIjoiaW5pdCIsImNyZWF0ZWQiOiJpbml0IiwiX192IjoiaW5pdCIsInNhbHQiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsiX192Ijp0cnVlLCJjcmVhdGVkIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwidXNlcm5hbWUiOnRydWUsInByb3ZpZGVyIjp0cnVlLCJzYWx0Ijp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19fSwiaXNOZXciOmZhbHNlLCJfbWF4TGlzdGVuZXJzIjowLCJfZG9jIjp7ImNyZWF0ZWQiOiIyMDE2LTAxLTIwVDAwOjIzOjU2LjkyOFoiLCJfX3YiOjAsInBhc3N3b3JkIjoiK3hBQXJJRllVUFdWYkVEUm9hN1Q3UU1xNmhjbEJYbGVTMmU2ZHBZQ2xOK3A5cGtkTHltcGtGakpMSnN0aCtMS0FtZ2d1TWxyZWFjbC9vSmtRRHJkOXc9PSIsInVzZXJuYW1lIjoiZHVkZSIsInByb3ZpZGVyIjoibG9jYWwiLCJzYWx0Ijoi77-9N28rWiPvv73Wou-_ve-_vT3vv73vv73vv71aIiwiX2lkIjoiNTY5ZWQzOWMyZDZiZTEwZDU0MzU1MzM1In0sIl9wcmVzIjp7InNhdmUiOltudWxsLG51bGwsbnVsbCxudWxsXX0sIl9wb3N0cyI6eyJzYXZlIjpbXX0sImlhdCI6MTQ1MzI2NzE4NSwiZXhwIjoxNDUzMzUzNTg1fQ.7V2pWudB1sfOJIGcFTJC-Cajlykx3xd8gBSXsyIF7Sk",
  "user": "dude"
}
```
An auth token is returned and can be used in subsequent rest request that require token authentication, token is set with an expiration time of 24 hrs.

Facebook User Signin
--------------------

Sign in through Facebook, return a facebook access token which is needed for authentication to other service endpoints.

HTTP GET METHOD URL endpoint: ```http://localhost/rest/signin/facebook```  Use the browser and navigate to the endpoint, it will redirect to facebook to signin, in the call back url, an access token will be provided if the user signed in successfully.

Data Response:
```
{
  success: true,
  user: {
  username: "jiaolong89@gmail.com",
  accessToken: "CAANPra9dfmYBADUyMZA2qepeiWHvfvVBCFWb9VXDjRIGs3AqzcWqJhaBgRBR5ipCl33c9n2ssaq2jQyGMDA8hxsv2loJYGA2OIa7SPMV41i87ZAtLTXqfdSpdKAHG5FhUTXYzfTvZAaBhLBOG90qq4Ery2JrZCKwQqZCxkuTA5LdfkuZAWvctPNjAiFPTF4zsZD"
  }
}
```

Token Authentication
--------------------

The Rest of the service endpoints all need authentication headers set in the request as the following, unless otherwise specified:

Required Headers for Authente requests:
```
  auth_method = 'local' or 'facebook'
  access_token = token returned by signup or signin, either locally or by facebook
```


Get User Info
-------------

Get user profile info.

HTTP GET METHOD URL endpoint: ```http://localhost/rest/users/user/info```

Data Response:
```
{
  "succcess": true,
  "user": {
    "_id": "569f1a2878cfbc1155cb1c80",
    "provider": "local",
    "username": "testuser1",
    "__v": 0,
    "created": "2016-01-20T05:24:56.714Z",
    "id": "569f1a2878cfbc1155cb1c80"
  }
}
```

Insert New Food Location
------------------------

Insert new food location in database.

HTTP POST METHOD URL endpoint: ```http://localhost/rest/foodlocs/insert```

Required header:
```
  Content-type = application/json
```

Send JSON in POST request body:

```
{
    "name": "test location",     
    "foodType": "italian",
    "location": [-118, 34],           
    "hours": {                                 (optional)
        "open": "0900",
        "close": "2000"
    },
    "address":"1022 node st. mongo county",    (optional)
    "rating": 1.2                              (optional, defaults to 2.5)
} 
```

Data Response:
```
{
  "success": true,
  "newloc": {
    "__v": 0,
    "name": "test location",
    "foodType": "italian",
    "loc": [
      -118,
      34
    ],
    "_id": "569f25e3ee5db738555e7ddd",
    "noPosts": 0,
    "date": "2016-01-20T06:14:59.812Z",
    "address": [
      "1022 node st. mongo county"
    ],
    "hours": {
      "close": "2000",
      "open": "0900"
    },
    "avgFoodRating": 1.2,
    "id": "569f25e3ee5db738555e7ddd"
  }
}
```

Read Food Location
------------------

Get Food Location info

HTTP GET METHOD URL endpoint: ```http://localhost/rest/foodlocs/foodloc_id```

Data Response:
```
{
  "_id": "569dc9c2efd6b30952fe0102",
  "name": "Panda King",
  "loc": [
    -118.292504,
    34.0109949
  ],
  "foodType": "chinese",
  "__v": 0,
  "noPosts": 2,
  "date": "2016-01-19T05:29:38.406Z",
  "address": [
    "1027 W Martin Luther King Jr Blvd",
    "Exposition Park",
    "Los Angeles, CA 90037"
  ],
  "hours": {
    "close": "1000",
    "open": "0800"
  },
  "avgFoodRating": 4.5,
  "id": "569dc9c2efd6b30952fe0102"
}
```

Nearby Foodlocs
---------------

Get food locations nearby a location based on query criteria. The result objects will contain an extra field 'dis' to indicate the distance
from away from the query center in meters.

HTTP GET METHOD URL endpoint: ```http://localhost/rest/foodlocs/nearby?longitude=-118&latitude=34&radius=1000&type=japanese...```

Query Parameters:
```
  longitude = longitude coordinate of center   ex: -118.292504
  latitude = latitude coordinate of center     ex: 34.0109949
  radius = radius of search range in meters    (optional, defaults to 1000 meters)
  type = food type of locations to find     
  k = max number of locations to return        (optional, defaults to 10)
  sortbyrating = true or false                 if true, returns locs sorted by rating, otherwise returns locs sorted by distance
```

Data Response:
```
[
  {
    "_id": "569dc9b0efd6b30952fe00f4",
    "name": "Pasta Roma",
    "loc": [
      -118.2776066,
      34.0256979
    ],
    "foodType": "italian",
    "noPosts": 258,
    "date": "2016-01-19T05:29:20.970Z",
    "address": [
      "2827 S Figueroa St",
      "University Park",
      "Los Angeles, CA 90007"
    ],
    "hours": {
      "close": "1000",
      "open": "0800"
    },
    "avgFoodRating": 3.498062015503876,
    "__v": 0,
    "dis": 0
  },
  {
    "_id": "569dcae49d3b4c0d52ed7015",
    "name": "Soy Japanese Grill and Roll",
    "loc": [
      -118.277949838233,
      34.0258249462924
    ],
    "foodType": "japanese",
    "noPosts": 113,
    "date": "2016-01-19T05:34:28.090Z",
    "address": [
      "2813 S Figueroa St",
      "University Park",
      "Los Angeles, CA 90007"
    ],
    "hours": {
      "close": "1000",
      "open": "0800"
    },
    "avgFoodRating": 2.5,
    "__v": 0,
    "dis": 34.681590572411174
  }
]
```

Location Posts CRUD
-------------------

Insert new Post
---------------

Insert new post about a food location by food location id. When inserting a new post, the rating and no. of posts for the restaurant in question willl be
updated as well

HTTP POST METHOD URL endpoint: ```http://localhost/rest/posts/insert/foodloc_id```

Send urlenconded form key-values:
```
  title = "review title"
  rating = review rating
  comments = "comments about the food location" (optional)
```

Data Response:
```
  {
  "success": true,
  "newpost": {
    "__v": 0,
    "foodloc": "569dc9c2efd6b30952fe0102",
    "user": "569f1a2878cfbc1155cb1c80",
    "title": "awesome review",
    "rating": 4.3,
    "_id": "569f3101ee5db738555e7dde",
    "created": "2016-01-20T07:02:25.273Z",
    "id": "569f3101ee5db738555e7dde"
  }
}
```
Read Post
---------

HTTP GET METHOD URL endpoint: ``` http://localhost/rest/post_id ```

Data Response:
```
  {
  "_id": "569c6eacc9901e044e98656e",
  "foodloc": null,
  "user": null,
  "title": "post5",
  "comment": "adfaffafa",
  "rating": 1,
  "__v": 0,
  "created": "2016-01-18T04:48:44.954Z",
  "id": "569c6eacc9901e044e98656e"
}
```

Update Post
-----------

Update a previous post. Only the same user that made the post can update it, verified with the sent auth token

HTTP PUT METHOD URL endpoint: ```http"//localhost/rest/post_id```

Send urlencoded key-values:
```
  title: "new title for review" (optional)
  rating: new rating            (optional)
  comment: "new comment"        (optional)
```

Data Response:
```
{
  "success": true,
  "updatedPost": {
    "_id": "569fcb6e6ada3105571cc8cc",
    "foodloc": {
      "_id": "569dc9b0efd6b30952fe00f4",
      "name": "Pasta Roma",
      "avgFoodRating": 3.494140625,
      "id": "569dc9b0efd6b30952fe00f4"
    },
    "user": {
      "_id": "569f1a2878cfbc1155cb1c80",
      "username": "testuser1",
      "id": "569f1a2878cfbc1155cb1c80"
    },
    "title": "new title",
    "rating": 2,
    "__v": 0,
    "created": "2016-01-20T18:01:18.551Z",
    "id": "569fcb6e6ada3105571cc8cc"
  }
}
```

Delete Post
-----------

Remove a previous post. Only the same user that made the post can delete it, verified with the sent auth token

HTTP DELETE URL METHOD endpoint: ```http://localhost/rest/posts/post/post_id```

Data Reponse:
```
  {
  "success": true,
  "deletedPost": {
    "_id": "569fcb6e6ada3105571cc8cc",
    "foodloc": {
      "_id": "569dc9b0efd6b30952fe00f4",
      "name": "Pasta Roma",
      "avgFoodRating": 3.494140625,
      "id": "569dc9b0efd6b30952fe00f4"
    },
    "user": {
      "_id": "569f1a2878cfbc1155cb1c80",
      "username": "testuser1",
      "id": "569f1a2878cfbc1155cb1c80"
    },
    "title": "new title",
    "rating": 2,
    "__v": 0,
    "created": "2016-01-20T18:01:18.551Z",
    "id": "569fcb6e6ada3105571cc8cc"
  }
}
```

List Posts by User
------------------

List all the posts made by a user, specified by auth token

HTTP GET METHOD URL endpoint: ```http://localhost/rest/posts/listbyuser```

Data Response:
```
[
  {
    "_id": "569fd43d6ada3105571cc8d1",
    "foodloc": "569dc9b0efd6b30952fe00f4",
    "user": "569fcde36ada3105571cc8ce",
    "title": "super review",
    "rating": 4,
    "__v": 0,
    "created": "2016-01-20T18:38:53.842Z",
    "id": "569fd43d6ada3105571cc8d1"
  },
  {
    "_id": "569fd4636ada3105571cc8d2",
    "foodloc": "569dc9c2efd6b30952fe0103",
    "user": "569fcde36ada3105571cc8ce",
    "title": "another review",
    "rating": 3,
    "__v": 0,
    "created": "2016-01-20T18:39:31.189Z",
    "id": "569fd4636ada3105571cc8d2"
  }
]
```

List Posts by User for Location
-------------------------------

List post by user for a specific food location

GET HTTP METHOD URL endpoint: ```http://localhost/rest/posts//listbylocanduser/foodloc_id```

Data Response:
```
  [
  {
    "_id": "569fd4636ada3105571cc8d2",
    "foodloc": "569dc9c2efd6b30952fe0103",
    "user": "569fcde36ada3105571cc8ce",
    "title": "another review",
    "rating": 3,
    "__v": 0,
    "created": "2016-01-20T18:39:31.189Z",
    "id": "569fd4636ada3105571cc8d2"
  }
]
```

Error handling
--------------

A simple error handling is implemented to send back error messages to the user

Examples

Failed authenticating user
```
  {
    "success": false,
    "message": "Authentication failed. User not found."
  }
```
Expired token 
```
  {
    "success": false,
    "err": {
      "name": "TokenExpiredError",
      "message": "jwt expired",
      "expiredAt": "2016-01-19T01:57:15.000Z"
    }
  }
```
Location needs to be specified when inserting food locations
```
  {
    "success": false,
    "error": "location is required"
  }
```











