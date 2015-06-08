var callExe = require('child_process').exec;
var callScript = require('child_process').execFile;

var log = require('../core/log.js')('Z');

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
	var options = {encoding: 'utf8', timeout: 0, maxBuffer: 200*1024, killSignal: 'SIGTERM', cmd: null, name: null, args: [], cwd: null, env: null};

	options.cmd = req.url.replace(/(.*)(script.|cmd.)(.*)/gi, "$3");
	log.debug('command request url:' + req.url);
	log.debug('command request:' + options.cmd);
	// TODO
	return options;
}

/**
Processes script http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no

*/
function exec(req, res) {
  var cmdRequest = getCmdRequest(req);
  callExe(cmdRequest.cmd, cmdRequest, function (err, stdout, stderr) {
	if (err) {
	  res.end(err.toString());
	}
	else {
	  res.end('stdout:\n' + stdout + '\n\nstderr:\n' + stderr);
	}
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
  callScript(cmdRequest.cmd, cmdRequest.args, cmdRequest, function (err, stdout, stderr) {
	if (err) {
	  res.end(err.toString());
	}
	else {
	  res.end('stdout:\n' + stdout + '\n\nstderr:\n' + stderr);
	}
  });
}


module.exports = {
	exec: exec,
	start: run
}