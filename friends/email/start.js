var app = require('express')();
var path = require('path');
var email = require('./email.do.js');
var file = require('./file.do.js');
var url = require('url');
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = 3001;

function getEmailRequest(req) {
	var data = req.query || {};
	for (var i in req.body) {
		//if (!(i in data)) {
			data[i] = req.body[i];
		//}
	}
	console.log(data);
	var mail = {to: "", subject: "", text: "", html: ""};
	mail.to = data.to || "";
	mail.cc = data.cc || "";
	mail.subject = data.subject || data.title || "";
	mail.html = data.body || "";
	
	return mail;
}

app.all('*', function (req, res) {
	try {
		if (req.method == "GET") {
			if (req.url.match(/\/(js|css|font|img)\//gi) || req.url.match(/\.html/gi)) {
				return file.get(req, res);
			}
		}
		
		var mail = getEmailRequest(req);
		if (!mail.to) {
			res.end("no recipients defined");
		} else {
			email.send(res, mail);
		}
		
	} catch (e) {res.end(e.toString()); console.error(e);}
});

var server = app.listen(port, function () {
  var host = server.address().address;
  console.log(
	'*************************************************************************\n' +
	'Server listening on port http://localhost:' + port + '\n' +
	'sample email url: http://localhost:' + port + '/cmd/?to=itboy70s@gmail.com&title=test&body=haha\n' +
	'*************************************************************************');
});
