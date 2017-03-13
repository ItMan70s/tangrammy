var log = require('../core/log.js')('Z');
var util = require('util');
var cps = require('../core/components.js');
var mongo = require('../core/mongo.db.js');
var ltz = (new Date()).getTimezoneOffset();
var settings = require('../../settings.js');
require('../core/components.js');
var vpath = "./views/";

/**
 Codes:
 2xx成功
 200 OK
 201 Created
 202 Accepted
 204 No Content
 206 Partial Content
 
 3xx重定向
 301 Moved Permanently
 304 Not Modified
 
 4xx客户端错误
 400 Bad Request  由于包含语法错误，当前请求无法被服务器理解
 401 Unauthorized
 403 Forbidden
 404 Not Found
 405 Method Not Allowed
 406 Not Acceptable: 请求的资源的内容特性无法满足请求头中的条件，因而无法生成响应实体
 408 Request Timeout
 409 Conflict 由于和被请求的资源的当前状态之间存在冲突，请求无法完成
 410 Gone 被请求的资源在服务器上已经不再可用，而且没有任何已知的转发地址
 422 Unprocessable Entity 请求格式正确，但是由于含有语义错误，无法响应。（RFC 4918 WebDAV）
 423 Locked 当前资源被锁定
 426 Upgrade Required
 
 5xx服务器错误
 500 Internal Server Error
 501 Not Implemented
 503 Service Unavailable
 
 
*/

/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no

*/
function getDefault(json) {
	var data = {}
	for (var i in json) {
		data[i] = json[i]["default"] || "";
	}
	return data;
}

function add(req, res, uData, define, tid, vid) {
	var fields = (define["Fields"] || "").toJSON();
	if (req.method == "GET") {
		var recorder = {};
		recorder.data = getDefault(fields);
		recorder.title = "NEW Application";
		recorder.code = 200;
		for (var i in recorder.data) {
			if (i in uData) {
				recorder.data[i] = uData[i];
			}
		}
		if ("user" in uData) {
			recorder.data["user"] = uData["user"];
		}
		__new(res, recorder, tid, vid, define);
	} else {
		uData = __winnow(uData, define);
		var fun = __safe(define["JSSave"] || "");
		if (fun.contains("return")) {
			uData = Function("data", fun)(uData);
		}
		for (var i in fields) {
			if ("id" == fields[i]["form"]) {
				uData[i] = mongo.getIDNext(((fields[i]["key"]) ? fields[i]["key"] : tid));
			}
		}
		uData["Update"] = (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
		uData["UpdateR"] = uData["user"]["Rid"] + ":" + uData["user"]["email"];
		
		var msg = __verify(uData, define);
		if (msg.length > 0) {
			var recorder = {"code": 406, "message": msg, "error": msg, "data": {}};
			recorder.data = uData;
			recorder.warning = msg;
			if (uData.json) {
				res.json(recorder);// res.end(util.inspect(recorder) + "" );
			} else {
				__edit(res, recorder, tid, vid, define);
			}
			return;
		}
		
		mongo.newOne(tid, vid, null, uData, function (recorder) {
			if (uData.json) {
				recorder.data = __winnow(recorder.data, define);
				res.json(recorder);// res.end(util.inspect(recorder) + "" );
				return;
			}
			if (recorder.code != 200) {
				recorder.title = "NEW Application";
				__new(res, recorder, tid, vid, define);
			} else {
				__show(res, recorder, tid, vid, define);
			}
		});
	}
}

function __safe(source) {
	try {
		return (source);
	} catch(msg) {
		log.error(msg);
	}
	return "";
}
var maxAge = 10;
function __render(res, ejs, recorder) {
	log.debug("ssid[" + res.req.u.ssid + "] render to " + ejs);
	recorder.action = "";
	recorder.request = res.req;
	recorder.app = res.req.u.Tid + "/" + res.req.u.Vid;
	if (! recorder.message) {
		recorder.message = "";
	}
	if (! recorder.warning) {
		recorder.warning = "";
	}
	if (recorder.code != 200) {
		log.warn("ssid[" + res.req.u.ssid + "] code: " + recorder.code + " msg: " + ((recorder.message == recorder.warning) ? recorder.message : recorder.message + recorder.warning));
	} else {
		log.warn("ssid[" + res.req.u.ssid + "] processed successfully.");
	}
	var req = res.req;
	req.u.userurl = req.u.userurl || "/i/show?Rid=" + req.u.user["Rid"];

	
	//var expires = new Date();
	//expires.setTime(expires.getTime() + maxAge * 1000);
	//res.setHeader("Expires", expires.toUTCString());
	//res.setHeader("Cache-Control", "max-age=" + maxAge);
	res.render(vpath + ejs, recorder);
	log.info("ssid[" + res.req.u.ssid + "] " + res.req.method + " " + res.req.url + " " + res.statusCode + res.req.ms());
}

function __show(res, recorder, tid, vid, define) {
	recorder.title = "Application Details";
	recorder.data = __winnow(recorder.data, define);
	var fun = __safe(define["JSShow"] || "");
	if (fun.contains("return")) {
		try {
			recorder.data = Function("data", fun)(recorder.data);
		} catch (msg) {
			log.warn(msg);
		}
	}
	return __render(res, tid + "X" + vid + "show.ejs", recorder);
}
function __new(res, recorder, tid, vid, define) {
	recorder.data = __winnow(recorder.data, define);
	var fun = __safe(define["JSNew"] || "");
	if (fun.contains("return")) {
		recorder.data = Function("data", fun)(recorder.data);
	}
	
	var fields = (define["Fields"] || "").toJSON();
	for (var i in fields) {
		if ("id" == fields[i]["form"]) {
			recorder.data[i] = mongo.getIDPreview(((fields[i]["key"]) ? fields[i]["key"] : tid)) + " ?";
		}
	}
	return __render(res, tid + "X" + vid + "new.ejs", recorder);
}
function __edit(res, recorder, tid, vid, define) {
	recorder.title = "Edit Application";
	recorder.data = __winnow(recorder.data, define);
	var fun = __safe(define["JSEdit"] || "");
	if (fun.contains("return")) {
		recorder.data = Function("data", fun)(recorder.data);
	}
	return __render(res, tid + "X" + vid + "edit.ejs", recorder);
}
	
function __verify(data, define) {
	if (! "CheckFuncs" in define) {
		return "";
	}
	var error = ""
	var funcs = (define["CheckFuncs"] || "").toJSON();
	for (var i in data) {
		if (!(i in funcs)) {
			continue;
		}
        var err = Function("val", funcs[i].mid(1, funcs[i].length - 1))(data[i]);
		if (err.length > 0) {
			error += "\n" + err;
		}
	}
	return (error.length > 0) ? error.substr(1) : error;
}
function __winnow(data, define) {
	var fields = (define["Fields"] || "").toJSON();
	if (fields["error"]) {
		log.warn(util.inspect(fields));
		return data;
	}
	for (var i in data) {
		if (i.charAt(0) == "F" && !(i in fields)) {
			debug("Drop values[" + i + "] - not in defines.");
			delete data[i];
		}
		
		if (i in fields && "datetime" == fields[i]["form"] && data["user"] && data["user"]["ctz"] != ltz) {
			if (data[i] == "0") {
				var dval = Date.now() + data["user"]["ctz"] * 60000;
				data[i] = (new Date(dval)).format("YYYY/MM/DD hh:mm:ss.S Z");
			} else if (data[i].match(/^[\d]+$/g)) {
				var dval = eval(data[i] + (data["user"]["ctz"] > 0 ? " +" : " ") + data["user"]["ctz"]);
				dval = Date.parse(dval) - ltz * 60000;
				data[i] = (new Date(dval)).format("YYYY/MM/DD hh:mm:ss.S Z");
			} else {
				var dval = Date.parse(data[i]);
				data[i] = (new Date(dval)).format("YYYY/MM/DD hh:mm:ss.S Z");
			}
		}
		if (i in fields && fields[i]["form"] in {"radio":"", "checkbox":"", "select":""}) {
			var val = ",";
			var opts = fields[i]["options"];
			for (var k in opts) {
				val += opts[k]["value"] + ",";
			}
			var opts = (data[i] + "").split(",");
			for (var k in opts) {
				if (!val.contains(opts[k].trim())) {
					opts[k] = "";
				}
			}
			data[i] = opts.join(",");
		}
	}
	if ("__proto__" in data) {
		delete data["__proto__"];
	}
	
	return data;
}

function show(req, res, uData, define, tid, vid, cond) {
	var condition = {"Rid": uData["Rid"]};
	mongo.findOne(tid, vid, uData["user"], condition, function (recorder) {
		__show(res, recorder, tid, vid, define);
	});
}
function copy(req, res, uData, define, tid, vid) {
	var condition = {"Rid": uData["Rid"]};
	mongo.findOne(tid, vid, uData["user"], condition, function (recorder) {
		if (recorder.code != 200) {
			res.end(recorder.message + util.inspect(recorder.error));
		} else {
			recorder.title = "Copy Create Application";
			delete recorder.data["Rid"];
			delete recorder.data["Update"];
			
			for (var i in recorder.data) {
				if (i in uData) {
					recorder.data[i] = uData[i];
				}
			}
			__new(res, recorder, tid, vid, define);
		}
	});
}
function modify(req, res, uData, define, tid, vid) {
	var condition = {"Rid": uData["Rid"]};
	if (req.method == "GET") {
		mongo.findOne(tid, vid, uData["user"], condition, function (recorder) {
			if (recorder.code != 200) {
				recorder.data = __winnow(recorder.data, define);
				return __render(res, "error.ejs", recorder);
			} else {
				for (var i in recorder.data) {
					if (i in uData) {
						recorder.data[i] = uData[i];
					}
				}
				__edit(res, recorder, tid, vid, define);
			}
		});
	} else {
		uData = __winnow(uData, define);
		var fun = __safe(define["JSSave"] || "");
		if (fun.contains("return")) {
			uData = Function("data", fun)(uData);
		}
		var msg = __verify(uData, define);
		if (msg.length > 0) {
			var recorder = {"code": 406, "message": msg, "error": msg, "data": {}};
			recorder.data = uData;
			recorder.warning = msg;
			if (uData.json) {
				res.json(recorder);// res.end(util.inspect(recorder) + "" );
			} else {
				__edit(res, recorder, tid, vid, define);
			}
			return;
		}
		uData["Update"] = (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
		uData["UpdateR"] = uData["user"]["Rid"] + ":" + uData["user"]["email"];

		mongo.update(tid, vid, condition, uData, function (recorder) {
			recorder.data = uData;
			if (uData.json) {
				recorder.data = __winnow(recorder.data, define);
				res.json(recorder);// res.end(util.inspect(recorder) + "" );
				return;
			}

			if ((recorder.code) != 200 || recorder.num < 1) {
				log.debug(recorder.message);
				__edit(res, recorder, tid, vid, define);
			} else {
				mongo.findOne(tid, vid, uData["user"], condition, function (recorder) {
					recorder.title = "Edit Application Result";
					if (recorder.code != 200) {
						log.debug(recorder.message);
						res.end(recorder.message + util.inspect(recorder.error));
					} else {
						__show(res, recorder, tid, vid, define);
					}
				});
			}
		});
	}
}
function remove(req, res, uData) {
	var condition = {"Rid": uData["Rid"]};
	mongo.remove(req.u.Tid, req.u.Vid, condition, function (recorder) {
		res.json(recorder);// res.end(util.inspect(recorder) + "");
	});
}

function __list(res, define, tid, vid, user, cond, orignal) {
	var opt = {};
	try {
		if ("OrderBy" in define && "Order" in define) {
			var oby = define["OrderBy"].split(","); 
			var order = (define["Order"]).split(",");
			var sort = {};
			for (var i = 0; i < oby.length; i++) {
				if (oby[i].startsWith("F")) {
					var name = oby[i];
					sort[name] = order[i]
				}
			}
			opt["sort"] = sort;
		}
		// TODO coupled with the official “next“, “prev“, “first” and “last” link relation types.
		// size , page/pages
		// Object.assign({skip: 0, limit: 1000}, options);
		if (true && "page" in orignal) {
			opt["limit"] = define["size"] || 10;
			opt["skip"] = orignal["page"] * (define["size"] || 10);
		}
	} catch (msg) {
		log.debug(msg);
	}
	mongo.list(tid, vid, user, cond, "", opt, function (recorder) {
		if (recorder.code != 200) {
			recorder.warning = "Internal error!<br/>" + util.inspect(recorder.error);
		} else {
			var fun = __safe(define["JSShow"] || "");
			var data = [];
			for (var i in recorder.data) {
				recorder.data[i]._doc = __winnow(recorder.data[i]._doc, define);
				if (fun.contains("return")) { 
					try {
						recorder.data[i]._doc = Function("data", fun)(recorder.data[i]._doc);
					} catch (msg) {
						log.warn(msg);
					}
				}
				data.push(recorder.data[i]._doc);
			}
			recorder.data = data;
		}
		if (orignal.json) {
			res.json(recorder);
			return;
		}
		recorder.title = "Application List";
		return __render(res, tid + "X" + vid + "list.ejs", recorder);
	});
}
function list(req, res, uData, define, tid, vid) {
	var con = __safe((define["Condition"] || "").replace(".*ME.*", ".*" + uData["user"]["Rid"] + ":.*").toJSON());
	__list(res, define, tid, vid, uData["user"], con, uData);
}

function search(req, res, uData, define, tid, vid, cond) {
	uData["cond"] = (uData["cond"] || "");
	uData["cond"] = uData["cond"].replace(".*ME.*", ".*" + uData["user"]["Rid"] + ":.*");
	var con = {};
	if (uData["cond"].length < 3) {
		for (var i in uData) {
			if (i.match(/(UpdateR|CreateR)/gi)) {
				con[i] = new RegExp('.*' + uData[i] + '.*', 'gi')
			} else if (i.match(/(Rid|^F[\da-zA-Z][\da-zA-Z]?$)/gi)) {
				con[i] = uData[i];
			} else {
				
			}
		}
	} else {
		con = uData["cond"].toJSON()
	}
	
	if ("adcond" in uData) {
		con = (uData["adcond"] + "").toJSON();
		res.req.szone = uData["szone"];
		if ((define["Condition"] || "").toJSON()["overwrite"] != true) {
			var orgCon = __safe((define["Condition"] || "").toJSON());
			for (var i in orgCon) {
				con[i] = orgCon[i];
			}
		}
	} else {
		res.req.szone = "";
	}
	__list(res, define, tid, vid, uData["user"], con, uData);
}
function welcome(req, res, warning, tangram) {
	if (warning && warning.length > 0) {
		log.warn("ssid[" + req.u.ssid + "] " + warning);
	}
	if (req.u.data.json && warning && warning.length > 0) {
		log.warn("ssid[" + req.u.ssid + "] " + warning);
		var recorder = {"code": 406, "message": warning, "error": warning, "data": {}};
		delete req.u.data["user"];
		recorder.data = req.u.data;
		recorder.warning = warning;
		return res.end(util.inspect(recorder) + "");
	} 
	var recorder = {"code": 200, "message": "OK", "error": "", "data": {}};
	recorder.warning = (typeof warning == 'string') ?  warning : "";
	return __render(res, tangram ? "Tangram.ejs": "welcome.ejs", recorder);
}

function preProcess(req, res) {
	var warning = "<B>404 EVENT!</B><br/>Tangram made a lot of applications except " + tid + ". <br/>Google tangram then DIY one _(._.)_";
	var url = req._parsedUrl.pathname;
	var uData = req.u.data;
	var tid = req.u.Tid;
	var vid = req.u.Vid;
	uData.user = req.u.user;
	
	var define = mongo.defines(tid, vid) || {};
	switch(req.u.op) {
		case "list":
			return list(req, res, uData, define, tid, vid);
		break;
		case "search":
			return search(req, res, uData, define, tid, vid);
		break;
		case "new":
			return add(req, res, uData, define, tid, vid);
		break;
		case "copy":
			return copy(req, res, uData, define, tid, vid);
		break;
		case "show":
			return show(req, res, uData, define, tid, vid);
		break;
		case "update":
			return modify(req, res, uData, define, tid, vid);
		break;
		case "remove":
			return remove(req, res, uData, define, tid, vid);
		break;
		default:
			warning = "<B>404 EVENT!</B><br/>The operation[ " + req.u.op + " ] is not available for application[ " + (define["Title"] || req.u.app) + " ].";
			log.warn("ssid[" + req.u.ssid + "] no expected URL: " + req.url + ". Client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
		break
	}
	welcome(req, res, warning);
	log.warn("ssid[" + req.u.ssid + "] " + " access invalidated URL by " + req.info().replace(/[\r\n]+/g, " "));
}

module.exports = {
	welcome: welcome,
	process: preProcess,
};
