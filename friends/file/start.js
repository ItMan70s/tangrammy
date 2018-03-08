var express = require('express');
var app = express();
var path = require('path');
var favicon = require('static-favicon');
var file = require('./file.do.js');
const fileUpload = require('express-fileupload');


var port = 3009;

//app.use(express.static('./'));
app.use(favicon(path.join(__dirname, 'public/favicon.ico')));
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
}));

app.all('*', function (req, res) {
	try {
		if (req.method == "POST" && req._parsedUrl.pathname.indexOf("/upload") > -1) {
			file.upload(req, res);
		} else {
			file.get(req, res);
		}
	} catch (e) {
		res.end(e.toString()); console.error(e);
	}
});




var server = app.listen(port, function () {
  var host = server.address().address;
  console.log(
	'*************************************************************************\n' +
	'Server listening on port http://localhost:' + port + '\n' +
	'sample upload url: http://localhost:' + port + '/upload \n' +
	'sample download url: http://localhost:' + port + '/files?fid=F5306X1ZSF221T8D \n' +
	'To get file list url: http://localhost:' + port + '/tree \n' +
	'*************************************************************************');
});

