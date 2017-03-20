var cmd = require('./action/cmd.do.js');
var file = require('./action/file.do.js');
var user = require('./action/user.do.js');
var A = require('./action/app.do.js');
var admin = require('./admin/admin.js');
var log = require('./core/log.js')("Z");
var util = require('util');
var mongo = require('./core/mongo.db.js');
var settings = require('../settings.js');
var T = null;
var fs = require('fs');
var type = "service";

fs.exists('./admin/T.do.js', function (exists) {
	T = require('./admin/T.do.js');
});

/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no

*/
function fetchUData(req) {
	var data = req.query || {};
	if (req.method == "POST") {
		for (var i in req.body) {
			if (!(i in data)) {
				data[i] = req.body[i];
			}
		}
	} 
	data.json = (data["format"] == "json" || data["format"] == "JSON" );
	delete data["format"];
	return data;
}

/*
get following information from request:
   { host: '127.0.0.1:3000',
     connection: 'keep-alive',
     'cache-control': 'max-age=0',
     accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,* / *;q=0.8',
     'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
     'accept-encoding': 'gzip, deflate, sdch',
     'accept-language': 'zh-CN,zh;q=0.8',
     cookie: 'ctz=480',
     'if-none-match': '"115398568"',
     method: 'GET',
     url: '/mytodo/update?Rid=E8S8VF6',
     pathname: '/mytodo/update',
     remote: '127.0.0.1',
     at: 1422608163117,
     timestamp: 'Fri Jan 30 2015 16:56:03 GMT+0800 (中国标准时间)',
	 cost: ' 17ms ' },
     body: {} } 
*/
function getInformation() {
	if (!this.headers) {
		return {};
	}
	var info = this.headers;
	info.method = this.method;
	info.url = this.url;
	info.pathname = this._parsedUrl ? this._parsedUrl.pathname : "";
	info.remote = (this.headers['x-forwarded-for'] || this.connection.remoteAddress || this.socket.remoteAddress || this.connection.socket.remoteAddress) + "";
	info.at = this.connection._idleStart;
	info.timestamp = (new Date(info.at)).toLocaleString();
	info.cost = this.ms();
	info.body = this.body;
	
	return info;
}

/*
get client time zone information from request:
   { remote: '127.0.0.1',
     at: 1422608163117 } 
*/
function __tz() {
	var tz;
	try {
		var tzone = this.u.user;
		tzone.utz = tzone.tz;
		if (this.getCookie('ctz')) {
			tzone.ctz = new Number(this.getCookie('ctz')) - 0;
			tz = tzone.ctz - tzone.utz;
			if (tz == 60 || tz == 0) {
				tz = mongo.dst(tzone.utz, tz);
			} else {
				tz = tzone.ctz;
			}
		} else {
			tz = mongo.dst(tzone.utz, -1);
		}
		tzone.ctz = tz;
		tzone.sametz = (tz == -1 * (new Date()).getTimezoneOffset());
	} catch (e) {
		e.info = req.info();
		log.exception(e);
	}
}
/*
	get time cost for processing request in ms: 5ms. -0ms if error.
*/
function getTimeCost() {
	if (!this.connection) {
		return " -0ms ";
	}
	return " " + (new Date() - this._start) + "ms ";
}
function getCookie(key) {
	// TODO remove this 
	if (key == 'ctz') {
		return this.cookies[key];
	}
	return this.cookies[key + this.port];
}
function setCookie(name, value, options) {
	if (value === undefined) {
		return this.clearCookie(name + this.port);
	}
	return this.cookie(name + this.port, value, options);
}
function init(req, res) {
	if (!req.u) {
		req.u = {};
		req.u.user = {};
	}
	req._start = (new Date()).now();
	
	if (!req.port) {
		req.res.port = req.port = req.get('host').split(":")[1] || "80";
	}
	req.getCookie = getCookie;
	res.setCookie = setCookie;
	req.info = getInformation;
	req.ms = getTimeCost;
	req.refreshTimeZone = __tz;

	req.res.admin = req.admin = (type == "admin");
	log.info("req.admin " + req.admin + " req.port: " + req.port + " type: " + type);
	
	req.u.ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress) + "";
	req.u.ssid = req.getCookie('__sessionid') || req.u.ip.replace(/[\.\:]/g, "i");
	if (!req.getCookie('__sessionid')) {
		// check unsupported browser
	}
	var url = req._parsedUrl.pathname;
	if (url[0] == "/") {
		url = url.substr(1);
	}
	
	var tid = "";
	var vid = "V1";
	var tokens = url.split("/");
	req.u.op = "";
	switch(tokens[0].toLowerCase()) {
		case "":
			tid = "home";
			break;
		case "css":
		case "js":
		case "img":
		case "font":
		case "fonts":
		case "u":
			tid = "web";
			break;
		case "upload":
		case "tangrammy":
		case "home":
		case "admin":
		case "h":
		case "cmd":
		case "script":/*
		case "login":
		case "logout":
		case "reg":*/
			tid = tokens[0].toLowerCase();
			break;
		case "t":
			tid = tokens[0].toLowerCase();
			req.u.op = tokens[1] || "list";
			break;
		case "i":
			tid = "i";
			req.u.op = tokens[1] || "logout";
			break;
		case "op":
			tid = "Op";
			req.u.op = tokens[1] || "search";
			break;
		default:
			if (tokens[0].match(/.+\.htm[l]?$/gi)) {
				tid = "web";
			} else if (tokens[0].match(/^T[\dA-Z]{1,2}$/g) && (tokens[1] || "V1").match(/^V[\dA-Z]{1,2}$/g)) {
				tid = tokens[0];
				vid = tokens[1] || "V1";
				req.u.app = tid + "/" + vid;
				req.u.op =  tokens[2] || "list";
			} else {
				var tvids = mongo.url2id(tokens[0].toLowerCase());
				if (tvids) {
					tid = tvids["Tid"];
					vid = tvids["Vid"];
					req.u.app = tokens[0];
					req.u.op =  tokens[1] || "list";
				} else {
					tid = "404";
					req.u.app = "404";
				}
			}
			break;
	}
	
	req.u.Tid = tid;
	req.u.Vid = vid;
	req.u.op = req.u.op.toLowerCase();
	res.starttime = res.connection._idleStart;
}

function loadUserInfo(req, res) {
	if (!req.u.id && req.u.ssid && !req.u.ssid.contains("i")) {
		var user = mongo.activeUser("get", req.u.ssid);
		if (user) {
			req.u.id = user.get("Rid");
			if (!user.get("utz")) {
			//	user.get("utz") = -1 * (new Date()).getTimezoneOffset();
			}
			req.u.user = user;
			log.warn("ssid[" + req.u.ssid + "] " + "login from " + req.u.ip + " with cookie: " + user["name"] + " / " + user["email"] + "], client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
		} else {
			log.error("ssid[" + req.u.ssid + "] " + "login from " + req.u.ip + " with cookie: " + user["name"] + " / " + user["email"] + "], client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
		}
	}
	if (!req.u.user) {
		req.u.user = {};
	}
	req.u.data = fetchUData(req);
	req.u.data.Tid = req.u.data.Tid || req.u.Tid;
	req.u.data.Vid = req.u.data.Vid || req.u.Vid;
		
	req.refreshTimeZone();
}


function process(req, res) {
	try {
		res.setHeader("Access-Control-Allow-Origin", "*");
		init(req, res);
		if (req.u.Tid == "web") {
			return file.get(req,res);
		}
		loadUserInfo(req, res);
		
		if (req.u.Tid == "404" || ((req.u.Tid == "t" || req.u.Tid == "admin" || req.u.Tid == "tangrammy") && !req.admin)) {
			var warning = "<B>404 EVENT!</B><br/>Tangrammy was surprised by " + req.url + "  _(._.)_";
			return A.welcome(req, res, warning);
		}		
		
		var warning = user.permit(req,res);
		if (warning != "") {
			return A.welcome(req, res, warning);
		}
		
		switch(req.u.Tid.toLowerCase()) {
		case "admin":
			admin.process(req, res);
			break;
		case "upload":
			file.upload(req,res);
			break;
		case "h":
			A.welcome(req, res, "DB health: " + mongo.health(), true);
			break;
		case "home":
			if (settings.home && settings.home.link && settings.home.link != "/") {
				return res.redirect(settings.home.link);
			}
			return A.welcome(req, res);
			break;
		case "tangrammy":
			A.welcome(req, res, "", true);
			break;
		case "cmd":
			cmd.exec(req,res);
			break;
		case "script":
			cmd.start(req,res);
			break;
		case "i":
			user.process(req, res);
			break;/*
		case "logout":
			user.logout(req, res);
			break;
		case "reg":
			user.register(req, res);
			break;*/
		default:
			if (req.u.Tid == "t" && T) {
				T.process(req, res);
			} else {
				A.process(req, res);
			}
			break;
		}
	} catch (e) {
		e.info = req.info();
		log.exception(e);
		var warning = "Internal error. <br/>Close browser then try again. Or report error to Administrator.";
		A.welcome(req, res, warning);
	}
}

module.exports.admin = function() {
	type = "admin";
}
module.exports.process = function(server) {
	server.get('*', process);
	server.post('*', process);
};

// catch 404 and forwarding to error handler
module.exports.notfound = function(req, res, next) {
	var warning = "<B>404 EVENT!</B><br/>Tangrammy was surprised by " + req.url + "  _(._.)_";
	return A.welcome(req, res, warning);
}

// production error handler
module.exports.error = function(err, req, res, next) {
	try {
		err.net = req.info();
		log.exception(err);
		if (req.url.indexOf("format=json") > 0) {
			res.end('{code: 400, error: "' + err.message + '"}');
		} else {
			return A.welcome(req, res, err.message);
		}
	} catch(e) {};
}


