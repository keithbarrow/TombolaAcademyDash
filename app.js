'use strict'
var express = require('express');
var app = module.exports.app = exports.app = express();

//app.use(logger('combined'));

//app.disable('etag');//prevent the http 304 (not modified) responses, less efficient but better for seeing what it going on.;

//Allow CORS
//app.all('*', function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', '*');
//    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
//    next();
//});

app.use(express.static('./.build'));


var server = app.listen('35005', function() {
    console.log('Express server listening on port ' + server.address().port);
});