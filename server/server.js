'use strict';
var express = require('express');
var http = require('http');
var morgan = require('morgan');
var expressApp = express();
var server = http.createServer(expressApp);
var port = process.env.PORT || 8000;


var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};


expressApp.use(morgan('combined'));
expressApp.set('view engine', 'html');
expressApp.use(express.static(process.cwd() + '/app'));
expressApp.use(allowCrossDomain);
expressApp .listen(port, function(){
    console.log('Listening on port:' + port);
});



