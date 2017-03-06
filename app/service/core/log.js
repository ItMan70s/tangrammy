var settings = require('../../settings.js');
var log4js = require('log4js'); 
var util = require('util');

process.argv[2] && settings.setPort(process.argv[2]);
process.argv[3] && settings.setDB(process.argv[3]);
var conf = settings.logs;

log4js.configure({
appenders: [  
	{ type: 'console' }, {  
		type: 'dateFile',  
		filename: conf.file, 
		pattern: "_yyyyMMdd",  
		maxLogSize: conf.maxLogSize,
		alwaysIncludePattern: false,  
		backups: 10,  
		category: 'Z'  
	}  
],  
replaceConsole: true  
});

module.exports = log;
function log(lname) {
	var logger = log4js.getLogger(lname);
	logger.setLevel(conf.level);
	this.trace = function(msg) {
		logger.trace(fillMsg(msg));
	}
	this.debug = function(msg) {
		logger.debug(fillMsg(msg));
	}
	this.info = function(msg) {
		logger.info(fillMsg(msg));
	}
	this.warn = function(msg) {
		logger.warn(fillMsg(msg));
	}
	this.error = function(msg) {
		logger.error(fillMsg(msg));
	}
	this.exception = function(error) {
		this.error(util.inspect(error));
	}
	this.fatal = function(msg) {
		logger.fatal(fillMsg(msg));
	}
	this.fillMsg = function(msg) {
        var line = "";
        try {
			var st = (new Error).stack.split('\n');
			if (st[3].indexOf("(") > -1) {
				line += st[3].replace(/(.*[\. ])([^ \.]+)([ ]?\(.*[\/\\\( ])([^:]+:[^:]+)(.+)/g, "$4::$2()");
			} else {
				line = st[3].replace(/(.*[\/\\])([^:]+:[^:]+)(.+)/g, "$2");
			}
			line += " by " + st[4].replace(/(.*[\/\\\( ])([^:]+:[^:]+)(.+)/g, "$2");
		} catch(e){};
		return "[" + line + "] " + msg;
	}	
	return this;
}