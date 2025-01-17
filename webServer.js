/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var express = require('express');
var app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');
const { request } = require('express');


// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    /*if (request.session.login_name === undefined) {
        response.status(401).send();
        return;
    }*/
    let query = User.find();
    query.select("first_name last_name").exec(function (err, contents) {
        if (err) response.status(500).send(err.message);
        let obj = JSON.parse(JSON.stringify(contents));
        response.status(200).send(obj);
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (request.session.login_name === undefined) {
        response.status(401).send();
        return;
    }
    let id = request.params.id;
    let query = User.findOne({_id: id});
    let selectedFields = "first_name last_name location description occupation";
    query.select(selectedFields).exec(function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send(err.message);
            return;
        }
        let obj = JSON.parse(JSON.stringify(user));
        response.status(200).send(obj);
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (request.session.login_name === undefined) {
        response.status(401).send();
        return;
    }
    let id = request.params.id;
    let query = Photo.find({user_id: id});
    let photosQueryFields = "user_id comments file_name date_time likes";
    //queries database and fetches photos for a given user
    query.select(photosQueryFields).exec(function (photosErr, results) {
        if (photosErr) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send(photosErr.message);
            return;
        }
        //copies javascript object so it can be modified
        let photos = JSON.parse(JSON.stringify(results));
        //iterates through each photo in the photos collection
        async.each(photos, function (photo, photosCallback) {
            //iterates through each comment in the given photo
            async.each(photo.comments, function (comment, commentsCallback) {
                let userId = comment.user_id;
                let userQuery = User.findOne({_id: userId});
                let userQueryFields = "first_name last_name";
                //for the given comment, queries the database and fetches
                //the user object using the user_id associated with the given
                //comment
                userQuery.select(userQueryFields).exec(function (commentErr, user) {
                    if (commentErr) {
                        console.log("Error occured while fetching comments.");
                        commentsCallback(commentErr.message);
                    }
                    //copies javascript object so it can be modified
                    //removes the user_id associated with a comment and
                    //replaces it with the relevant user object
                    let userObj = JSON.parse(JSON.stringify(user));
                    comment.user = userObj;
                    delete comment.user_id;
                    commentsCallback();
                });
            }, (commentAsyncErr) => {
                if (commentAsyncErr) {
                    console.log("Asynchronous fetch of comments failed");
                    photosCallback(commentAsyncErr.message);
                }
                photosCallback();
            });
        }, (photosAsyncErr) => {
            if (photosAsyncErr) {
                console.log("Error occurred after fetching photos");
                response.status(400).send(photosAsyncErr.message);
            }
            response.status(200).send(photos);
        });
    });
});

/**
 * P8 additions
 */

/**
 * delete user
 */
app.post('/deleteAccount', function (request, response) {
    let userId = request.session.userObj._id;
    let query = Photo.find({});
    query.select().exec(function (photosErr, allPhotos) {
        async.each(allPhotos, function(photo, photoCallback) {
            let photoObj = JSON.parse(JSON.stringify(photo));
            let indices = [];
            for (let i = 0; i < photoObj.comments.length; i++) {
                if (photoObj.comments[i].user_id === userId) {
                    indices.push(i);
                }
            }
            for (let i = 0; i < indices.length; i++) {
                photo.comments.splice(indices[i] - i, 1);
                photo.save();
            }
            for (let i = 0; i < photoObj.likes.length; i++) {
                console.log(photoObj.likes[i].user_id);
                console.log(userId);
                if (photoObj.likes[i].user_id === userId) {
                    console.log("deleting like");
                    photo.likes.splice(i, 1);
                    photo.save();
                    break;
                }
            }
            console.log(photo.likes.length);
            photoCallback();
        }, (photosAsyncErr) => {
            if (photosAsyncErr) {
                response.status(400).send(photosAsyncErr.message);
            }
            //find and delete by id
            let userQuery = User.find({});
            userQuery.select().exec(function (usersErr, allUsers) {
                async.each(allUsers, function(user, userCallback) {
                    let userObj = JSON.parse(JSON.stringify(user));
                    for (let i = 0; i < userObj.favoritePhotos.length; i++) {
                        if (userObj.favoritePhotos[i].user_id === userId) {
                            user.favoritePhotos.splice(i, 1);
                            user.save();
                        }
                    }
                    userCallback();
                }, (usersAsyncErr) => {
                    if (usersAsyncErr) {
                        response.status(400).send(usersAsyncErr);
                    }
                    Photo.deleteMany({user_id: userId}, function(err) {
                        User.findOneAndDelete({_id: userId}, () => {
                            request.session.destroy();
                            response.status(200).send();
                        });
                    })
                })
            })
        })
    })
})

/**
 * delete comment
 */
app.post('/deleteComment/:photo_id', function (request, response) {
    let photo_id = request.params.photo_id;
    let comment_id = request.body.comment_id;
    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (photo === null) {
            response.status(400).send();
            return;
        }
        let photoObj = JSON.parse(JSON.stringify(photo));
        for (let i = 0; i < photoObj.comments.length; i++) {
            if (photoObj.comments[i]._id === comment_id) {
                photo.comments.splice(i, 1);
                photo.save();
                response.status(200).send(request.session.userObj);
                return;
            }
        }
    });
});

/**
 * delete photo
 */
app.post('/deletePhoto/:photo_id', function (request, response) {
    let photo_id = request.params.photo_id;
    let query = User.find({});
    query.select().exec(function (usersErr, allUsers) {
        async.each(allUsers, function(user, userCallback) {
            let userObj = JSON.parse(JSON.stringify(user));
            for (let i = 0; i < userObj.favoritePhotos.length; i++) {
                if (userObj.favoritePhotos[i].photo_id === photo_id) {
                    user.favoritePhotos.splice(i, 1);
                    user.save();
                    break;
                };
            };
            userCallback();
        }, (usersAsyncErr) => {
            if (usersAsyncErr) {
                response.status(400).send(usersAsyncErr.message);
            }
            Photo.findOneAndDelete({_id: photo_id}, function(err, photo) {
                response.status(200).send(request.session.userObj);
            });
        })
    })
});

/**
 * post favorited photos
 */
 app.post('/favoritePhoto/:photo_id', function (request, response) {
    let photo_id = request.params.photo_id;
    let photoDate = request.body.date_time; //request body should include date and time (can put photo object in there if you wnat)
    let file_name = request.body.file_name;
    let userId = request.session.userObj._id;
    User.findOne({_id: userId}, function(err, user) {
        if (user === null) {
            console.log(`User with Id ${userId} not found`);
            response.status(400).send();
            return;
        }
        let userObj = JSON.parse(JSON.stringify(user));
        for (let i = 0; i < userObj.favoritePhotos.length; i++) {
            if (userObj.favoritePhotos[i].photo_id === photo_id) {
                if (request.body.remove) {
                    console.log("Photo removed from favorites");
                    user.favoritePhotos.splice(i, 1);
                    user.save();
                    response.status(200).send(JSON.parse(JSON.stringify(user)));
                    return;
                } else {
                    console.log("Photo has already been added to favorites.");
                    response.status(400).send();
                    return;
                }
            }
        }
        let favoritePhotoObj = {
            photo_id: photo_id,
            date_time: photoDate,
            file_name: file_name,
        }
        user.favoritePhotos.push(favoritePhotoObj);
        user.save();
        response.status(200).send(JSON.parse(JSON.stringify(user)));
    });
});

/**
 * post likes
 */
app.post('/likesOfPhoto/:photo_id', function (request, response) {
    let photo_id = request.params.photo_id;
    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (photo === null) {
            console.log(`Photo with Id ${photo_id} not found`);
            response.status(400).send();
            return;
        }
        let photoObj = JSON.parse(JSON.stringify(photo));
        for (let i = 0; i < photoObj.likes.length; i++) {
            if (photoObj.likes[i].user_id === request.session.userObj._id) {
                photo.likes.splice(i, 1);
                photo.save();
                response.status(200).send();
                return;
            }
        }
        let likeObj = {
            user_id: request.session.userObj._id,
            //can include date and time of like if necessary (other properties as well)
        }
        photo.likes.push(likeObj);
        photo.save();
        response.status(200).send();
    });
});

/**
 * P7 additions
 */
 app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    let id = request.params.photo_id;
    Photo.findOne({_id: id}, function (err, photo) {
        if (photo === null || request.body.comment.length === 0) {
            console.log("here");
            response.status(400).send();
            return;
        }
        let commentObj = {
            user_id: request.session.userObj._id,
            date_time : new Date(),
            comment : request.body.comment,
        };
        photo.comments.push(commentObj);
        photo.save();
        response.status(200).send();
    });
});

app.post('/admin/login', function (request, response) {
    let query = User.findOne({login_name: request.body.login_name});
    let selectedFields = "first_name last_name location description occupation login_name favoritePhotos";
    query.select(selectedFields).exec(function (err, loggedUser) {
        if (err || loggedUser === null) {
            console.log('User with login_name:' + request.body.loggedUser + ' not found.');
            response.status(400).send();
            return;
        }
        let obj = JSON.parse(JSON.stringify(loggedUser));
        request.session.login_name = request.body.login_name;
        request.session.userObj = obj;
        response.status(200).send(obj);
    });
});

app.post('/admin/logout', function (request, response) {
    if (Object.keys(request.body).length === 0) {
        request.session.destroy();
        response.status(200).send();
    } else {
        response.status(400).send();
    }
});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


