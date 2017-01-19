var app = require('express')();
var path = require('path');
var cmd = require('./cmd.do.js');


var port = 3009;

app.all('*', function (req, res) {
	try {
		if (req.url.indexOf("/cmd/") > -1) {
			cmd.exec(req, res);
		} else {
			cmd.start(req, res);
		}
	} catch (e) {res.end(e.toString()); console.error(e);}
});

var server = app.listen(port, function () {
  var host = server.address().address;
  console.log(
	'*************************************************************************\n' +
	'Server listening on port http://localhost:' + port + '\n' +
	'sample command url: http://localhost:' + port + '/cmd/?=dir /w \n' +
	'sample script url: http://localhost:' + port + '/scripts/?=show.cmd \n' +	
	'*************************************************************************');
});
