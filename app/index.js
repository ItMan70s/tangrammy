process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// process.env.debug = "Z X Action DB";

var version = "0.2.0";
var log = require('./service/core/log.js')('Z');

var express = require('express');
//var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./service/routes.js');
var settings = require('./settings.js');

var server = express();
// view engine setup
var views = new Array();
server.set('views', __dirname);
server.set('view engine', 'ejs');

server.use(favicon(path.join(__dirname, 'web/img/favicon.ico')));
server.use(bodyParser.json({limit: '50mb'}));
server.use(bodyParser.urlencoded({limit: '1000mb', uploadDir: settings.files.uploadDir}));
server.use(cookieParser());
server.use(express.bodyParser({limit: '100gb', uploadDir: settings.files.uploadDir}));  
//server.use(express.bodyParser({limit: '1000mb', uploadDir: settings.files.uploadDir}));
//server.use(bodyParser({limit: '1000mb', uploadDir: settings.files.uploadDir})); 
//server.use(express.static(path.join(__dirname, 'web')));
server.use(server.router);
//server.enable('view cache');


server.use(routes.notfound);
server.use(routes.error);
routes.process(server);
// TODO temp port set. cli sample: node index 3000 z
var port = process.argv[2] || settings.port;
server.set('port', port);
server.listen(port, function() {
log.debug('Service started.\n' +
'*************************************************************************\n' +
'Version: Tangrammy ' + version + '\n' +
'Server listening on port http://localhost:' + port + '\n' +
'Service define at http://localhost:' + port + '/tangrammy\n' +
'*************************************************************************');}
);

module.exports = server;
