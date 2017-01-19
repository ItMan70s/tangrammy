
var callExe = require('child_process').exec;
var callScript = require('child_process').execFile;
var fs = require('fs');

var util = require('util');
var pathScripts = fs.realpathSync("scripts/");
var pathChar = pathScripts.charAt(0) == "/" ? "/" : "\\";
pathScripts += pathChar;
var path = process.env.PATH + (pathChar == "/" ? ":" : ";") + pathScripts;

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
function getCmdRequest(req) {
	var options = {encoding: 'utf8', timeout: 0, maxBuffer: 200*1024, killSignal: 'SIGTERM', cwd: null, env: process.env, cmd: null, name: null, args: []};
	options.env.PATH = path;

	options.cmd = req.url.replace(/(.*)(script|cmd)(.*?[^=]*=)(.*)/gi, "$4");
	options.cmd = decodeURIComponent(options.cmd);
	if (options.cmd.length < 2) {
		req.res.end("Hi~");
		return {};
	}
	
	//console.debug('command request url:' + req.url + '; command:' + options.cmd);
	req.res.write('accept request:' + options.cmd + '\n');
	// TODO
	return options;
}

/**
http://localhost:3000/cmd/?=dir%20/h
Processes script http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no
*/
function exec(req, res) {
  var cmdRequest = getCmdRequest(req);
  callExe(cmdRequest.cmd, cmdRequest, function (err, stdout, stderr) {
	doPost(res, err, stdout, stderr);
  });
}

/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no
*/
function run(req, res) {
  var cmdRequest = getCmdRequest(req);
  cmdRequest.cwd = pathScripts;
  cmdRequest.args = cmdRequest.cmd.split(" ").slice(1);
  cmdRequest.cmd = cmdRequest.cmd.split(" ")[0];
  fs.exists(cmdRequest.cwd + cmdRequest.cmd, function (exists) {
	if (!exists) {
	  res.end("Script[" + cmdRequest.cmd + "] not found.");
	} else {
	  callScript(cmdRequest.cmd, cmdRequest.args, cmdRequest, function (err, stdout, stderr) {
		doPost(res, err, stdout, stderr);
	  });
	}
  });
}
function doPost(res, err, stdout, stderr) {
	
	if (err) {
	  res.end(err.toString());
	}
	else {
	  res.end(stdout + '\n\n' + (stderr ? "Error: \n" + stderr: ""));
	}
}


module.exports = {
	exec: exec,
	start: run
}