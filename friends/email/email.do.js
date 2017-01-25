var util = require('util');
var mailer = require("nodemailer");
var settings = require('../../app/settings.js');
var smtp = null;
/**
Gets command with options from HTTP request. 
	req: Object HTTP request.

Returns: object with following values:
	cmd: String The command to run, with space-separated arguments
	name: String command name 
	args: Array List of string arguments
	cwd: String Current working directory of the child process
	env: Object Environment key-value pairs
	encoding: String (Default: 'utf8')
	timeout: Number milliseconds (Default: 0)
	maxBuffer: Number (Default: 200*1024)
	killSignal: String (Default: 'SIGTERM')

*/
function initSmtp() {
	if (smtp) {
		return;
	}
	
	try {
		smtp = mailer.createTransport("SMTP", settings.SMTP);
	} catch(e) {
		console.error("Failed to init smtp: [" + e + "] ");
	}
}
function sendMail(res, mail, config) {
	initSmtp();
	try {
		mail["from"] = settings.SMTP.auth.user;
		smtp.sendMail(mail, function(error, response){
			if(error){
				res.end("", error);
				console.error(error);
			} else {
				res.end("sent.");
				console.log("Message sent: " + response.message);
			}
			//smtp.close();
		});
	} catch(e) {
		console.error("Failed to send email: [" + e + "] ", mail);
	}
}

module.exports = {
	send: sendMail,
	email: sendMail
}