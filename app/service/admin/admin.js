var log = require('../core/log.js')('Z');
var util = require('util');
var cps = require('../core/components.js');
var mongo = require('../core/mongo.db.js');
var fs = require('fs');
require('../core/components.js');

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
var inBackup = false;
function __backup(Ts, callback) {
	if (!Ts | Ts.length < 1) {
		callback(200);
		return;
	}
	var tid = Ts.shift();
	mongo.list(tid, "V", null, {}, "", {}, function (recorder) {
		if (recorder.code != 200) {
			console.error(recorder.message);
			callback(recorder.code, recorder.message + util.inspect(recorder.error));
		} else {
			//console.error(util.inspect(recorder.data));
			fs.appendFile('./' + tid + '.json', tid + "\n" + util.inspect(recorder.data) + "\n", function(err){
				if (err) console.error(err);
				__backup(Ts, callback);
			});
		}
	});
}
function backup(req, res) {
	if (inBackup) {
		res.end("in backuping DB. ");
		return;
	}
	/*
	var spawn = require('child_process').spawn;

// ...
  collection.insert(docs, {safe:true}, function(err, result) {
    var args = ['--db', 'mydb', '--collection', 'test']
      , mongodump = spawn('/usr/local/bin/mongodump', args);
    mongodump.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });
    mongodump.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
    mongodump.on('exit', function (code) {
      console.log('mongodump exited with code ' + code);
    });
  });*/
  
	var uData = req.u.data;
	var def = ("defines" == uData["target"]);
	var data = ("data" == uData["target"]);
	if ("*" == uData["target"]) {
		def = data = true;
	}
	var Ts =  new Array();
	if (def) {
		Ts = new Array("T", "Reservation", "Settings");
	}
	if (data) {
		var ids = mongo.getIds();
		for (var i in ids) {
			if (!(i in Ts)) {
				Ts.push(i);
			}
		}
	}
	inBackup = true;
	__backup(Ts, function (code, err) {
		if (code == 200) {
			res.end("Success to backup DB. ");
		} else {
			res.end("Failed to backup DB. \n" + err);
		}
		inBackup = false;
	});
}

function __safe(source) {
	try {
		return (source);
	} catch(msg) {
		log.debug(msg);
	}
	return "";
}
/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no

*/
var num = 0;
var result = "";
function addCsv(req, res) {
	num = 0;
	result = "";
	var tid = req.u.data["Tid"];
	var vid = req.u.data["Vid"];
	var rows = cps.text2array(req.u.data["csv"], ",", "\"", "\n", true);
	var define = mongo.defines(tid, vid);
	var fields = (define["Fields"] || "").toJSON();
	var key = "";
	for (var j=1; j < rows.length; j++) {
		var data = {};
		for (var k=0; k < rows[j].length; k++) {
			key = rows[0][k];
			if (key in fields) {
				data[key] = rows[j][k];
			}
		}
		
		var fun = __safe(define["JSSave"] || "");
		if (fun.contains("return")) {
			data = Function("data", fun)(data);
		}
		for (var i in fields) {
			if ("id" == fields[i]["form"]) {
				data[i] = mongo.getIDNext(((fields[i]["key"]) ? fields[i]["key"] : tid));
			}
		}
		uData["Update"] = (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
		uData["UpdateR"] = "CsvAdministrator";
		mongo.newOne(tid, vid, null, data, function (recorder) {
			log.debug(util.inspect(recorder));
			result += util.inspect(recorder) + "\n";
			num++;
			if (num >= rows.length - 1) {
				result += num + "Finished.";
				res.end(result);
				log.debug(num + "Finished.");
			}
		});
	}
}
function process(req, res) {
	if (req.url.match(/.admin.backup*/g)) {
		return backup(req, res);
	}
	if (req.url.match(/.admin.addcsv*/g)) {
		return addCsv(req, res);
	}
}

module.exports = {
	process: process
}