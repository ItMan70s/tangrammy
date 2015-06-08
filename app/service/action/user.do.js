var log = require('../core/log.js')('Z');
var code = require('../core/code.js');
var mongo = require('../core/mongo.db.js');
var util = require('util');
var cps = require('../core/components.js');
var A = require('./app.do.js');
var cmd = require('./cmd.do.js');
var settings = require('../../settings.js');
require('../core/components.js');

var utid = ""
var uvid = ""
var uname = "";
var upasswd = "";
var umail = "";
var urole = "";
var uenable = "";
var utz = ""
var uurl = ""

function inituser() {
	if (!utid) {
		var UDef = mongo.getSetting("User");
		utid = UDef["tid"];
		uvid = UDef["vid"];
		uname = UDef["name"];
		upasswd = UDef["password"];
		umail = UDef["email"];
		urole = UDef["role"];
		uurl = UDef["url"];
		utz = UDef["tz"];
		
		var define = mongo.defines(utid, uvid);
		if (define && define["Title"]) {
			uurl = UDef["url"];
		}
	}
}
function __login(item, req, res) {
	if (!item) return;
	if (!item[utz]) {
		item[utz] = -1 * (new Date()).getTimezoneOffset();
	}
	req.u.userurl = "/i/show?Rid=" + item["Rid"];
	var text = {name: item[uname], passwd: item[upasswd], email: item[umail], Rid: item["Rid"], role: item[urole], tz: item[utz], userurl: req.u.userurl};
	text = mongo.activeUser("add", text);
	
	req.u.utz = item[utz];
	req.refreshTimeZone();
	
	res.cookie('userurl', req.u.userurl, {path: '/', expires: new Date(Date.now() + 60 * 1000)});
	res.cookie('__sessionid', text, {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	res.cookie('email', item[umail], {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	res.cookie('name', item[uname], {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	
	
	var usr = {name: item[uname], email: item[umail], Rid: item["Rid"], role: item[urole], tz: "" + item[utz], userurl: req.u.userurl};
	
	var encode = code.en(util.inspect(usr), text);
	res.cookie('encode', encode, {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	var decode = code.de(encode);
	res.cookie('decode_key', decode.key, {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	decode = eval("(" + decode.val.substring(1, decode.val.length - 1).replace(/'/g, '"') + ")");
	if (decode.val) {
		res.cookie('decode_val_name', decode.val[uname], {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
		res.cookie('decode_val_mail', decode.val[umail], {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
		res.cookie('decode_val_Rid', decode.val["Rid"], {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
		res.cookie('decode_val', util.inspect(decode.val), {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	} else {
		res.cookie('decode_val', "empty", {path: '/', expires: new Date(Date.now() + 7 * 24 * 6000 * 1000)});
	}
}

function login(req, res) {
	inituser();
	log.info("Login - client information: " + req.info());
	var uData = req.u.data;
	var condition = (uData["cond"] + "").toJSON();
	var con = {};
	if ("Email" in condition) {
		con[umail] = condition["Email"];
	}
	if ("UName" in condition) {
		con[uname] = condition["UName"];
	}
	
	var pass = condition["UPass"];
	if ("Rid" in condition) {
		con["Rid"] = condition["Rid"];
	}
	
	log.info("Try to login with name: " + con[uname] + " / email: " + con[umail] + " sessionid:" + req.u.ssid);
	if (upasswd in condition) {
		pass = con[upasswd] = condition[upasswd];
	}
	mongo.list(utid, uvid, null, con, "", {}, function (recorder) {
		if (recorder.code == 200) {
			if (!recorder.data[0]) {
				recorder.code = 404;
				recorder.message = "Not Found";
			} else{
				if (pass == undefined || recorder.data[0][upasswd] == pass) {
					recorder.code = 200;
					recorder.message = "OK.";
				} else {
					recorder.code = 401;
					recorder.message = "Wrong password";
				}
			}
		}
		__login(recorder.data[0], req, res);
		recorder.data = "";
		res.end(util.inspect(recorder) + "" );
		return;
	});
}

function register(req, res) {
	inituser();
	var uData = req.u.data;
	log.warn("Register by client: " + req.info());

	var con = {};
	if (uData["code"]) {
		uData["code"] = uData["code"].replace(/_/gi, "+").replace(/!/gi, "/").replace(/#/gi, "=");
		var uData = (new Buffer(uData["code"], 'base64')).toString().toJSON();
		if (uData["expired"] < new Date().now()) {
			A.welcome(req, res, "Request is expired!");
			return;
		}
		
		if (!(umail in uData) && "email" in uData) {
			uData[umail] = uData["email"];
		}
		if (!(upasswd in uData) && "pass" in uData) {
			uData[upasswd] = uData["pass"];
		}
		con[umail] = uData[umail];
		con[upasswd] = uData[upasswd];
		delete uData["email"];
		delete uData["pass"];
		delete uData["expired"];
		
		if (utz in uData) {
			mongo.list(utid, uvid, null, {umail: uData[umail]}, "", {}, function (recorder) {
				if (recorder.data.length < 1) {
					mongo.newOne(utid, uvid, null, uData, function (recorder) {
						log.debug("ssid[" + req.u.ssid + "] " + util.inspect(recorder));
						//res.redirect("" + uurl + "/update?Rid=" + recorder._doc["Rid"]);
					});
				}
			});
		} 
		setTimeout(function() {
			mongo.list(utid, uvid, null, con, "", {}, function (recorder) {
				__login(recorder.data[0], req, res);
				if (recorder.data[0] && recorder.data[0]["Rid"]) {
					res.redirect("/i/show?Rid=" + recorder.data[0]["Rid"]);
					log.info("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + ((new Date()).now() - res.starttime) + "ms ");
				} else {
					A.welcome(req, res, "User Not Found! Try to reset your password or register again.");
				}
			});
		}, 3);
		
		return;
	}
	var pass = "Tangram1.0";
	
	con[umail] = uData["email"];
	mongo.list(utid, uvid, null, con, "", {}, function (recorder) {
		var item = recorder.data[0];
		con[upasswd] = pass;
		
		/*
		sender - The e-mail address of the sender. All e-mail addresses can be plain sender@server.com or formatted Sender Name <sender@server.com>
		to - Comma separated list of recipients e-mail addresses that will appear on the To: field
		cc - Comma separated list of recipients e-mail addresses that will appear on the Cc: field
		bcc - Comma separated list of recipients e-mail addresses that will appear on the Bcc: field
		reply_to - An e-mail address that will appear on the Reply-To: field
		subject - The subject of the e-mail
		body - The plaintext version of the message
		html - The HTML version of the message
		attachments - An array of attachment objects. Attachment object consists of two properties - filename and contents. Property contents can either be a String or a Buffer (for binary data). filename is the name of the attachment.
		*/
		var mail = {
			from: uData["email"],
			to: uData["email"],
			subject: "[Booking] reset password",
			text: "" + con,
		}
		if (item) {
			// reset password
			con["Update"] = (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
			con["UpdateR"] = con[umail];
			var url = (new Buffer('{"email": "' + uData["email"] + '", "pass": "' + pass + '", "expired": ' + ((new Date().now()) + 288 * 3600 * 1000) + '}')).toString('base64'); // 7 * 24
			url = url.replace(/\+/gi, "_").replace(/\//gi, "!").replace(/\=/gi, "#");
			url = "http://" + req.headers.host + "/i/register?code=" + url;
			
			var htm = "Please click following link to change your password now: <br/>";
			htm += "<a href='" + url + "'>" + url + "</a><br/>";
			htm += "Email: <b>" + uData["email"] + "</b><br/>";
			htm += "User Password: <b>" + pass + "</b><br/>";
			mail.html = htm;
			mongo.update(utid, uvid, {"Rid": item["Rid"]}, con, function (recorder) {
				recorder.data = con;
				//if (uData["format"] == "json") {
					log.info("ssid[" + req.u.ssid + "] ");
					res.end(util.inspect(recorder) + "" );

					// Use Smtp Protocol to send Email
					cmd.sendMail(mail, req, res);
					return;
				//}
			});
		} else {
			// register
			var htm = "Email: <b>" + uData["email"] + "</b><br/>";
			htm += "User Password: <b>" + pass + "</b><br/>";
			
			var define = mongo.defines(utid, uvid);
			var fields = (define["Fields"] || "").replace(/'/g, "\"").toJSON();
			for (var i in fields) {
				if (i != umail && i != upasswd) {
					con[i] = fields[i]["default"] || "";
					if (i != utz) {
						htm += fields[i].label + ": <b>" + con[i] + "</b><br/>";
					}
				}
			}
			
			var ehtm = "";
			var tz = (req.cookies['ctz']) ? (new Number(req.cookies['ctz']) - 0) : con[utz];
			
			if (("" + tz).length > 0) {
				var opts = fields[utz].options;
				for (var k in opts) {
					if (opts[k].value == tz) {
						con[utz] = tz;
						ehtm = "TimeZone: <b>" + opts[k].caption + "</b><br/>";
						break;
					}
					// daylight save time?
					if (opts[k].value + 60 == tz) {
						ehtm = "TimeZone: <b>" + opts[k].caption + "</b><br/>";
						con[utz] = tz;
					}
				}
			}
			htm += ehtm;
			
			con["Update"] = (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
			con["UpdateR"] = con[umail];
			con["expired"] = ((new Date().now()) + 288 * 3600 * 1000);
			con[uname] = con[umail].mid(0, "@");
			
			var url = (new Buffer(util.inspect(con) + "")).toString('base64'); // 7 * 24
			url = url.replace(/\+/gi, "_").replace(/\//gi, "!").replace(/\=/gi, "#");
			url = "http://" + req.headers.host + "/i/register?code=" + url;
			
			htm += "Please click following link to active your account: <br/>";
			htm += "<a href='" + url + "'>" + url + "</a><br/>";
			
			
			mail.subject = "[Booking] register";
			mail.html = htm;

			// register
			mongo.newOne(utid, uvid, null, con, function (recorder) {
				recorder.data = con;
				res.end(util.inspect(recorder) + "" );
				
				// Use Smtp Protocol to send Email
				cmd.sendMail(mail, req, res);
			});
			return;
		}
	});
}

function logout(req, res) {
	log.info("ssid[" + req.u.ssid + "] " + "logout: " + req.u.user.name + " / " + req.u.user.email);
	mongo.activeUser("remove", req.cookies['__sessionid']);
	res.clearCookie('__sessionid', { path: '/'});
    res.redirect("/");
}

function show(req, res) {
	inituser();
	var recorder = {};
	var uData = req.u.data;
	if (uData["Rid"] != req.u.user["Rid"]) {
		log.warn("ssid[" + req.u.ssid + "] " + " try to show other user[" + req.u.data["Rid"] + "] information - " + req.u.user.name + " / " + req.u.user.email);
		req.u.data["Rid"] = req.u.user["Rid"];
	}
	
	req.u.Tid = utid;
	req.u.Vid = uvid;
	req.u.op = "show";
	A.process(req, res);
}

function changePwd(req, res) {
	inituser();
	var recorder = {};
	var uData = req.u.data;
	if (uData["Rid"] == req.u.user["Rid"]) {
		if (uData["passwd"] != req.u.user["passwd"]) {
			recorder.code = 401;
			recorder.message = "Wrong password";
		} else {
			recorder.code = 200;
			recorder.message = "OK.";
		}
	} else {
		recorder.code = 403;
		recorder.message = "Forbidden";
	}
	
	if (recorder.code == 200) {
		req.u.Tid = utid;
		req.u.Vid = uvid;
		req.u.op = "update";
		delete req.u.data["passwd"];
		A.process(req, res);
	} else {
		res.end(util.inspect(recorder) + "");
	}
}

function permit(req, res) {
	var result = {};
	
	if ("Op" == req.u.Tid) {
		var uData = req.u.data;
		var con = (uData["cond"]) ? (uData["cond"] + "").toJSON() : {};
		result = mongo.matchRole(req.u.user["role"], con["t"], con["v"]);
	} else {
		result = mongo.matchRole(req.u.user["role"], req.u.Tid, req.u.Vid);
	}
	var matched = result.matched;
	req.u.apps = result.apps;
	switch(req.u.Tid) {
		case "web":
		case "upload":
		case "tangram":
		case "tangrammy":
		case "home":
		case "i":/*
		case "login":
		case "logout":
		case "reg":*/
			matched = true;
			return "";
			break;
		default:
			break;
	}	
	

	if (req.u.Tid && req.u.Vid && (!req.u.user || !matched)) {
		if (!req.u.user || !req.u.user.name) {
	log.error("ssid[" + req.u.ssid + "] " + "login from " + req.u.ip + ", client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
			return "Current user [Guest] has NO permission to access <b>" + req.url + "</b>.<br/> Please <a data-dismiss=\"modal\" href=\"javascript:;\" name=\"login\">click here to login</a>.";
		} else {
			return "Current user [" + req.u.user.name + "] has NO permission to access <b>" + req.url + "</b><br/>Please contact Administrator for permission.";
		}
	}
	var define = mongo.defines(req.u.Tid, req.u.Vid) || {};
	if ((define["NoAction"] || "").contains(req.u.op)) {
		return "No permission to performance request " + req.url;
	}
	return "";
}

function preProcess(req, res) {
	var url = req._parsedUrl.pathname;
	var uData = req.u.data;
	var tid = req.u.Tid;
	var vid = req.u.Vid;
	uData.user = req.u.user;
	
	// var define = mongo.defines(tid, vid) || {};
	switch(req.u.op) {
		case "login":
			return login(req, res);
		break;
		case "logout":
			return logout(req, res);
		break;
		case "register":
			return register(req, res);
		break;
		case "chpwd":
			return changePwd(req, res);
		break;
		case "show":
			return show(req, res);
		break;
		default:
			log.warn("ssid[" + req.u.ssid + "] no expected URL: " + req.url + ". Client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
			return logout(req, res);
		break
	}
	log.warn("ssid[" + req.u.ssid + "] " + " access invalidated URL by " + req.info().replace(/[\r\n]+/g, " "));
}

module.exports = {
	permit: permit,
	process: preProcess,
};