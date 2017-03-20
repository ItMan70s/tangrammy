var mongoose = require('mongoose');
var log = require('./log.js')('Z');
var util = require('util');
var fs = require('fs');
var settings = require('../../settings.js');
require('./components.js');

process.argv[2] && settings.setPort(process.argv[2]);
process.argv[3] && settings.setDB(process.argv[3]);

var DB = settings.db;
var dbStatus = {success: "", failed: ""};
/*

var Q = require('q');
var defer = Q.defer();

function getInitialPromise() {
  return defer.promise;
}

getInitialPromise().then(function(success){
    console.log(success);
},function(error){
    console.log(error);
},function(progress){
    console.log(progress);
});
defer.notify('in progress');//控制台打印in progress
defer.resolve('resolve');   //控制台打印resolve
defer.reject('reject');     //没有输出。promise的状态只能改变一次


https://github.com/JacksonTian/eventproxy#%E9%87%8D%E5%A4%8D%E5%BC%82%E6%AD%A5%E5%8D%8F%E4%BD%9C

EventProxy 仅仅是一个很轻量的工具，但是能够带来一种事件式编程的思维变化。有几个特点：

利用事件机制解耦复杂业务逻辑
移除被广为诟病的深度callback嵌套问题
将串行等待变成并行等待，提升多异步协作场景下的执行效率
友好的Error handling
无平台依赖，适合前后端，能用于浏览器和Node.js
兼容CMD，AMD以及CommonJS模块环境
现在的，无深度嵌套的，并行的

var ep = EventProxy.create("template", "data", "l10n", function (template, data, l10n) {
  _.template(template, data, l10n);
});

$.get("template", function (template) {
  // something
  ep.emit("template", template);
});
$.get("data", function (data) {
  // something
  ep.emit("data", data);
});
$.get("l10n", function (l10n) {
  // something
  ep.emit("l10n", l10n);
});


*/
function now() {
	return (new Date()).format("YYYY/MM/DD hh:mm:ss.S Z");
}
mongoose.connection.on('error', 
function callback (err) {
	dbStatus.failed = now();
	log.fatal("DB connection error: " + err);
	refresh();
});

mongoose.connection.on('connected', 
function callback () {
	dbStatus.success = now();
	log.info("DB connected.");
});
mongoose.connection.on('disconnected', 
function callback () {
	dbStatus.failed = now();
	log.fatal("DB disconnected!");
});
mongoose.connection.once('open', function callback () {
	log.info("Connected DB " + DB.host + ':' + DB.port + '/' + DB.name + " successfully.");
});


var oid = "";
var seed = 0;
function uuid() {
	var id = ((new Date().now() - 1400371200000) + "").toN32();
	if (id == oid) {
		seed++;
		id += "X" + (seed + "").toN32();
	} else {
		oid = id;
		seed = 0;
	}
	return id; 
}
// (new Buffer(now.toString(16))).toString('base64');

var Schema = mongoose.Schema;

// validate默认的有以下规则：
/**
	3. type: string,number,regexp,function,nan,email,url
	4. required: true/false 是否必填项
	5. exist: true/false 是否存在即验证
	6. trim: true/false 是否去除左右空白后验证
	7. length: 字符串（数值字符串化）长度
	8. minLength: 字符串（数值字符串化）最小长度
	9. maxLength: 字符串（数值字符串化）最大长度
	10. min: 数值最小值
	11. max: 数值最大值
	12. regExp: 正则
	13. callback: 回调
	14. this=Schema
	15. function(value, respond){
	16. respond(value === '123');
	17. }
  comments: [{ body: String, date: Date }],
  date: { type: Date, default: Date.now },
  hidden: Boolean,
  meta: {
    votes: Number,
    favs:  Number
  }
  
  error:
  { message: 'Validation failed',
  name: 'ValidationError',
  errors: 
   { password: 
      { message: 'Path `password` is required.',
        name: 'ValidatorError',
        path: 'password',
        type: 'required',
        value: undefined } } }
  
Mongoose has several built in validators.
	All SchemaTypes have the built in required validator.
	Numbers have min and max validators.
	Strings have enum and match validators.
*/

var oplogSchema = new Schema({date: Date, uid: String, op: String, tid: String, rid: String, detail: String});

var ReservationSchema = new Schema({
  Rid: {type: String, required: true, index: true},
  tid: {type: String, required: true},
  sid: {type: String},
  fid: {type: String},
  t0: {type: Number, required: true},
  t1: {type: Number, required: true},
  hours: {type: Number},
  uid: {type: String},
  uname: {type: String},
  email: {type: String, required: true},
  memo: {type: String}
});
var TSchema = new Schema({
  Tid: {type: String, required: true, maxLength: 3},
  Vid: {type: String, required: true, maxLength: 3},
  Rid: {type: String, required: true, index: true, maxLength: 32},
  Name: {type: String, exist:true},
  Title: {type: String, required: true, exist:true},
  URL: {type: String, required: true, exist:true},
  Description: {type: String, required: true},
  Fields: {type: String, required: true},
  CheckFuncs: {type: String},
  Keys: {type: String},
  Condition: {type: String},
  AdvanceCondition: {type: String},
  NoAction: {type: String},
  New: {type: String},
  Copy: {type: String},
  Edit: {type: String},
  Show: {type: String},
  Remove: {type: String},
  JSNew: {type: String},
  JSEdit: {type: String},
  JSShow: {type: String},
  JSSave: {type: String},
  TitleLN: {type: String},
  ActionLN: {type: String},
  LayoutN: {type: String},
  FieldsLN: {type: String},
  TitleLE: {type: String},
  ActionLE: {type: String},
  LayoutE: {type: String},
  FieldsLE: {type: String},
  TitleLS: {type: String},
  ActionLS: {type: String},
  LayoutS: {type: String},
  FieldsLS: {type: String},
  TitleLL: {type: String},
  LayoutL: {type: String},
  FieldsLL: {type: String},
  LNew: {type: String},
  LEdit: {type: String},
  LShow: {type: String},
  LList: {type: String},
  Help: {type: String},
  Email: {From: String, To: String, Cc: String, Title: String},
  EmailTitle: {type: String},
  EmailFrom: {type: String},
  EmailTo: {type: String},
  EmailCc: {type: String},
  OrderBy: {type: String},
  Order: {type: String},
  Pagging: {type: String},
  Group: {type: String},
  Filter: {type: String},
  History: {type: String},
  Status: {type: String},
  Header: {type: String},
  Footer: {type: String},
  Active: {type: String},
  Update: { type: String},
  updater: {type: String},
  keys: {type: String},
});
/*
userSchema.path('update').validate(function (value) {
  return true; // /blue|green|white|red|orange|periwinkle/i.test(value);
}, 'Invalid update');
*/
var SettingSchema = new Schema({
  key: {type: String, required: true, index: true},
  val: {type: String, required: true},
  format: {type: String}
});
var OpSchema = new Schema({
  t: {type: String, required: true},
  v: {type: String, required: true},
  r: {type: String},
  u: {type: String},
  w: {type: String},
  o: {type: String, required: true},
  l: {type: String, required: true},
  f: {type: String},
  ts: {type: String, required: true}
});

var Ids = {};
var Tls = {};
var Urls = {};
var Schemas = {};
var TDefines = {};
var Roles = {};
var liApps = "";
var optApps = "";
var Reservations = {};
var Settings = {};

function refresh() {
	try {
		mongoose.close();
	} catch(e) {
		log.info(e);
	}
	mongoose.connect('mongodb://' + DB.host + ':' + DB.port + '/' + DB.name + '');
	Schemas = {"T": mongoose.model('T', TSchema), "Reservation": mongoose.model('Reservation', ReservationSchema), "Settings": mongoose.model('Settings', SettingSchema), "Op": mongoose.model("Op", OpSchema)};
	Settings = {"User": {}, "Role": {}, "IDDefines": {}, "ActiveUsers": {}};
	loadSettings();
	refreshstaticFilestat();
};

refresh();

function loadSettings() {
	for (var i in Settings) {
		findOne("Settings", "V", null, {"key": i}, function (recorder) {
			if (recorder.code == 200) {
				var key = recorder.data["key"];
				Settings[key] = (recorder.data["val"] || "").toJSON();
			}
		});
	}
	initDB();
}
function saveSettings() {
	for (var i in Settings) {
		var val = util.inspect(Settings[i]);
		if (val.contains("error: [SyntaxError:")) {
			continue;
		}
		saveOrUpdate("Settings", "V", "key", {"key": i, "val": val, "format": "String"});
	}
}
function initDB() {
list("T", "V", null, {}, "", {sort: {Tid: 1, Vid: 1}}, function (recorder) {
	if (recorder.code != 200) {
		console.error(recorder.message);
		return;
	} 
	liApps = "";
	optApps = '{"caption": "All", "value": "*"}';
	for (var item in recorder.data) {
		var td = recorder.data[item]; 
		if (td["Visible"] == "on" && td["Enable"] == "on")  {
			liApps += "<li><a href='/" + td["URL"] + "/list'>" + td["Title"] + "</a></li>\n";
			optApps += ', {"caption": "' + td["Title"] + '", "value": "' + td["Tid"] + '/' + td["Vid"] + '"}';
		}
		var tmp = td["Tid"] + td["Vid"];
		Tls[tmp] = td;
		tmp = td["URL"];
		Urls[tmp.toLowerCase()] = {"Tid": td["Tid"], "Vid": td["Vid"]};
		tmp = td["Tid"];
		if (!(tmp in Ids)) {
			Ids[tmp] = new Array();
		} 
		Ids[tmp].push(td["Vid"]);
		
		var fields = {};
		try { 
			fields = (td["Fields"] || "").toJSON();
		} catch(msg) {
			log.error("Failed to parse JSON:" + msg + "\n Fields define:\n" + td["Fields"]);
		}
		if ((td["Fields"] || "").toLowerCase().contains('"form": "reservation"')) {
			Reservations[td["Tid"] + td["Vid"]] = true;
		}
		var tdid = td["Tid"] + td["Vid"];
		TDefines[tdid] = td;
		
		var tid = td["Tid"].contains("T") ? td["Tid"] : "T" + td["Tid"];
		if (tid in Schemas) {
			continue;
		}
		var skm = {};
		for (var i in fields) {
			skm[i] = fields[i]["type"];
		}
		if (!("Rid" in fields)) {
			skm["Rid"] = {type: String, index: true};
		}
		if (!("Update" in fields)) {
			skm["Update"] = { type: String};
		}
		if (!("UpdateR" in fields)) {
			skm["UpdateR"] = "String";
		}
		if (!("Create" in fields)) {
			skm["Create"] = { type: String};
		}
		if (!("CreateR" in fields)) {
			skm["CreateR"] = "String";
		}
		try {
			Schemas[tid] = mongoose.model(tid, new Schema(skm));
		} catch (e) {
			log.error("Failed to init Model for " + tdid + ": " + e);
		}
	}
	
	log.debug("Inital Schema...");
	if (!Settings["User"]["tid"]) {
		Settings["User"] = {"tid": "TF1", "vid": "V1", "name": "F0", "email": "F1", "password": "F2", "role": "F3", "enable": "F4", "tz": "F5", "url": "/TF1/V3"};
	}
	if (!Settings["Role"]["tid"]) {
		Settings["Role"] = {"tid": "TF0", "vid": "V1", "role": "F0", "apps": "F1", "enable": "F2", "default": "F3"};
	}
	list(Settings.Role.tid, Settings.Role.vid, null, {}, "", {}, function (recorder) {
		if (recorder.code != 200) {
			console.error(recorder.message);
			return;
		} 
		for (var item in recorder.data) {
			var role = recorder.data[item][Settings.Role.role];
			if (recorder.data[item][Settings.Role.enable] + "" != "1") {
				continue;
			}
			Roles[role] = recorder.data[item][Settings.Role.apps];
		}
	});
});
}
function getIDNext(def) {
	var num = previewID(def);
	var key = def["key"];
	Settings["IDDefines"][key]["val"] = eval(Settings["IDDefines"][key]["val"] + " + 1");
	saveSettings();
	return num;
}
function previewID(def) {
	var num = def["format"].replace(/([^0]*)(0+)([^0]*)/g, "$2");
	var n = def["val"] + "";
	if (num.length > n.length) {
		n = num.substr(0, num.length - n.length) + n;
	}
	return def["format"].replace(num, n);
}

function updateIDDefine(key, val, format) {
	var def = Settings["IDDefines"][key];
	if (!def) {
		// new one
		Settings["IDDefines"][key] = {"key": key, "val": val, "format": format};
		saveSettings();
	} else if (def["format"] == format && def["val"] >= val) {
		//no change
	} else {
		if (def["val"] < val) {
			def["val"] = val;
		}
		def["format"] = format;
		// update to db
		def["val"]--;
		getIDNext(def);
	}
}
function getTSchema(tid) {
	if (tid in Schemas) {
		return Schemas[tid];
	}
	return mongoose.model('NA', new Schema({}));
}

function hasSameProporty(names, obj1, obj2) {
	if (!names || names.length < 1 || !obj1 || !obj2) {
		return false;
	}
	for (var i = 0; i < names.length; i++) {
		if (obj1[names[i]] != obj2[names[i]]) {
			return false;
		}
	}
	return true;
}
/*
	private function
	
  error:
  { message: 'Validation failed',
  name: 'ValidationError',
  errors: 
   { password: 
      { message: 'Path `password` is required.',
        name: 'ValidatorError',
        path: 'password',
        type: 'required',
        value: undefined } } }
*/
function logOP(tid, vid, op, dataorg, datanew) {
	if (tid == "Settings") return "Settings";
	if (tid == "T") return "T";
	var data = {"t": tid, "v": vid, "w": "", "f": "", "o": op};
	
	try {
	data["r"] = datanew["Rid"];
	data["u"] = datanew["UpdateR"];
	data["ts"] = (new Date()).format("yyyy-MM-dd hh:mm:ss.S");

	var diff = {};
	var def = defines(tid, vid);
	def = (def && def["Fields"] || "").toJSON();
	for (var i in datanew) {
		if (i in {"Tid":"", "Vid":"", "user":"", "app":"", "format":"", "Update":"", "UpdateR":""} ) {
			continue;
		}
		if (!dataorg || dataorg[i] != datanew[i]) {
			var name = i;
			try {name = def[i]["label"]; } catch (e) {}
			diff["" + name] = datanew[i];
			data["f"] += "[" + name + "] ";
		}
	}
	
	if ("Reservation" in datanew) {
		data["f"] += datanew["Reservation"];
	}
	data["l"] = util.inspect(diff);
	var model = getTSchema("Op");
	model(data).save(function(err, recorder) {
		if (err) {
			log.debug("Failed to save op log: " + util.inspect(err));
		}
	});
	dbStatus.success = now();
	} catch (msg) {
		log.debug("Unexpected Oplog Error: " + msg);
	}
	return data["f"];
}
function __save(tid, vid, model, data, callback) {
	var item = {"code": 404, "message": "Not Found", "data": null};
	try{
		if (model) {
			model.save(function(err, recorder) {
				if (err) {
					log.debug("Failed to save data: " + util.inspect(err));
					item.code = 400;
					item.message = err.message;
					item.error = err;
				} else {
					item.code = 200;
					item.message = "OK";
					item.data = recorder;
					logOP(tid, vid, "i", null, recorder._doc);
				}
				callback(item);
				if (tid == "T") {initDB();}
			});
		} else {
			callback(item);
		}
	} catch (msg) {
		log.debug("Unexpected Error: " + msg);
	}
}
function  __now() {
	var dat = new Date();
	var now = Math.floor(dat.now() / 1000) + dat.getTimezoneOffset() * 60;
	return now;
}
function list(tid, vid, user, condition, fields, options, callback) {
	var con = condition;
	var fids = null;
	var opt = options; 
	if (typeof tid != 'string') log.debug("tid is missing for function findOne.");
	if (typeof callback != 'function') log.debug("callback function is missing for function findOne.");
	if (typeof condition == 'function') {callback = condition; con = {};}
	
	//if ((fields || "").constructor == Array) {
	
	if (typeof fields == 'string') {
		fids = fields;
	} else if (typeof fields == 'function') {
		callback = fields; 
		con = {}; 
		fids = null;
	} else {
		con = fields;
		fids = null;
	}
	// options = {skip: 0, limit: limit, sort: {create_at: 1}};
	/*tailable *
maxscan *
batchSize *
comment *
snapshot *
hint *
slaveOk *
lean *
safe
 sort allow:  asc, desc, ascending, descending, 1, and -1.
*/
	var model = getTSchema(tid);
	model.find(con, fids, opt, function (err, recorder) {
		var msg = "Tid: " + tid + " Vid: " + vid + " condition: " + util.inspect(con);
		if (!recorder && !err) {
			log.debug("Not found. " + msg);
			callback({"code": 404, "message": "Not Found", "data": {}});
		} else if (recorder) {
			if (Reservations[tid + vid] && recorder.length > 0) {
				var now = __now();
				var idx = recorder.length - 1;
				function __FillNext() {
					idx--;
					if (idx > -1) {	
						fillReservation(user, tid, recorder[idx], now, __FillNext)
					} else {
						callback({"code": 200, "message": "OK", "data": recorder});
					}
				}
				fillReservation(user, tid, recorder[idx], now, __FillNext);
			} else {
				callback({"code": 200, "message": "OK", "data": recorder});
			}
		} else {
			log.debug("Failed to find recorders. " + msg + " \nDetail: " + util.inspect(err));
			callback({"code": 400, "message": err.message, "error": err, "data": null});
		}
	});
}

function fillReservation(user, tid, recorder, now, callback) {
	var cond = {"tid": tid, "sid": recorder["Rid"], "t1": {$gte : now }};
	var model = getTSchema("Reservation");
	model.find(cond, null, {"sort": "t0"}, function (err, data) {
		if (data && data.length > 0) {
			var htm = "";
			var name = "";
			for (var i = 0; i < data.length; i++) {
				if (data[i]["uname"] && data[i]["uname"].length > 0) {
					name = data[i]["uname"];
				} else {
					name = data[i]["email"].mid(0, "@");
				}
				
				htm += "<div Rid='" + data[i]["Rid"] + "'>";
				if (data[i]["t0"] <= now) {
					htm += "<span class='red'>"
				} else {
					htm += "<span class='black'>"
				}
				htm += (new Date()).showDuration(data[i]["t0"] * 1000, data[i]["t1"] * 1000, user["ctz"]) + " </span>";
				htm += "<a href='mailto:" + data[i]["email"] + "' class='glyphicon glyphicon-envelope'>" + name + "</a>" + data[i]["memo"] + "</div>";
			}
			recorder["Reservation"] = htm;
			recorder._doc["Reservation"] = htm;
		}
		callback();
	});
}
function makeReservation(reqs, callback) {
	if (!reqs || reqs.length < 1) return;
	
	if (typeof callback != 'function') {
		callback = function() {
			makeReservation(reqs);
		};
	}
	var data = reqs.shift();
	log.debug("Reservation request: " + util.inspect(data));
	var model = getTSchema("Reservation");
	var now = __now();
	if ("remove" in data) {
		var cond = {"Rid": data["remove"]["Rid"]};
		delete data["remove"];
		model.find(cond, null, {"sort": "t0"}, function (err, items) {
			var deleted = false;
			for (var i = 0; i < items.length; i++) {
				var recorder = items[i];
				if (!recorder) {
					continue;
				}
				if (recorder["t0"] > now - 300) {
					// remove all reservation if passed time < 5 minutes
					remove("Reservation", "V", cond, callback);
					log.debug("Removed reservation Rid: " + cond["Rid"]);
					deleted = true;
				} else if (recorder["t0"] < now && recorder["t1"] > now) {
					var udata = {"Rid":"", "tid":"", "sid":"", "fid":"", "t0":"", "hours":"", "uid":"", "email":"", "memo":"", };
					for (var i in udata) {
						udata[i] = recorder[i] || "";
					}
					udata["t1"] = now - 1;
					__update("Reservation", "V", cond, udata, callback);
					log.debug("Updated reservation ending: " + udata["t1"]);
					deleted = true;
				} else {
				// do nothing
				}
			}
			if (!deleted) {
				callback();
			}
		});
		// one time one request 
		return;
	}
	data = data["add"];
	if (!data) {
		return callback();
	}
	if (data["t0"]) {
		if (data["t0"] < now){
			data["t0"] = now;
		} else {
			now = data["t0"];
		}
	}
	// ignore 5 minutes conflict
	var cond = {"tid": data["tid"], "sid": data["sid"], "t1": {$gte : (now + 300) }};
	model.find(cond, null, {"sort": "t0"}, function (err, items) {
		if (items && items.length > 0) {
			if (data["t0"]) {
				data["t1"] += data["t0"];
				for (var i = 0; i < items.length; i++) {
					if (items[i]["t0"] < data["t1"]) {
						// conflict
						log.debug("Add reservation conflict ending: " + items[i]["t1"] + " id: " + items[i]["_id"]);
						callback();
						return;
					}
				}
			} else {
				// Luck reservation
				data["t0"] = 0;
				var t0 = now;
				var t1 = data["t1"] + now;
				items.push({"t0": now, "t1": now});
				for (var k = items.length - 1; k > -1; k--) {
					t0 = items[k]["t1"];
					t1 = data["t1"] + t0;
					for (var i = 0; i < items.length; i++) {
						if ((items[i]["t0"] < t1 && t1 <= items[i]["t1"]) || (items[i]["t0"] <= t0 && t0 < items[i]["t1"])) {
							t0 = 0;
							// conflict 
							log.debug("Add reservation conflict ending: " + items[i]["t1"]);
							break;
						}
					}
					if (t0 > 0) {
						if (data["t0"] == 0 || data["t0"] > t0) {
							data["t0"] = t0;
						} 
					}
				}
				data["t1"] += data["t0"];
			}
		} else {
			if (!data["t0"]) {
				data["t0"] = now;
			}
			data["t1"] += data["t0"];
		}
		data["Rid"] = uuid();
		__save("Reservation", "V", model(data), data, callback);
		log.debug("Added reservation ending: " + data["t1"]);
	});
}


function exsit(tid, vid, condition, callback) {
	if (typeof tid != 'string') log.debug("tid is missing for function findOne.");
	if (typeof callback != 'function') log.debug("callback function is missing for function findOne.");
	
	var model = getTSchema(tid);
	model.findOne(condition, function (err, recorder) {
		if (err) {
			callback({"code": 400, "message": err.message, "error": err, "data": false});
		} else {
			callback({"code": 200, "message": "OK", "data": (recorder? true: false)});
		}
	});
}
function findOne(tid, vid, user, condition, callback) {
	if (typeof tid != 'string') log.debug("tid is missing for function findOne.");
	if (typeof callback != 'function') log.debug("callback function is missing for function findOne.");
	
	var model = getTSchema(tid);
	model.findOne(condition, function (err, recorder) {
		var msg = "Tid: " + tid + " Vid: " + vid + " condition: " + util.inspect(condition);
		if (!recorder && !err) {
			log.debug("Not found. " + msg);
			callback({"code": 404, "message": "Not Found", "data": {}});
		} else if (recorder) {
			if (Reservations[tid + vid]) {
				var now = __now();
				fillReservation(user, tid, recorder, now, function() {
					callback({"code": 200, "message": "OK", "data": recorder._doc});
				});
			} else {
				callback({"code": 200, "message": "OK", "data": recorder._doc});
			}
		} else {
			log.debug("Failed to find recorder. " + msg + " \nDetail: " + util.inspect(err));
			callback({"code": 400, "message": err.message, "error": err, "data": {}});
		}
	});
}

function __getUnique(fields, data) {
	if (typeof fields == "string") {
		fields = fields.toJSON();
	}
	var cond = {'$or' : []};
	for (var i in fields) {
		if (fields[i]["unique"] && (i in data)) {
			var base = data["Rid"] ? {'Rid' : {$ne: data["Rid"]}} : {};
			base[i] = data[i];
			cond['$or'].push(base);
		}
	}
	return cond;
}
function newOne(tid, vid, condition, data, callback) {
	var model = getTSchema(tid);
	if (typeof data == 'function') {callback = data; data = condition; condition = {};}
	data["Rid"] = uuid();
	data["Update"] = now();
	data["Create"] = data["Update"];
	data["CreateR"] = data["UpdateR"];
	var unique = (tid == "T") ? {'$or' : []} : __getUnique(defines(tid)["Fields"], data);
	if (condition && ('$or' in condition)) {
		unique['$or'] = unique['$or'].concat(condition['$or']);
	}
	
	if (unique['$or'].length < 1) {
		__save(tid, vid, model(data), data, callback);
		return;
	}
	model.findOne(unique, function (err, recorder) {
		if (!recorder && !err) {
			__save(tid, vid, model(data), data, callback);
		} else if (err) {
			var msg = "Tid: " + tid + " Vid: " + vid + " condition: " + util.inspect(unique);
			log.error("Internal error . " + msg + "  Detail: " + util.inspect(err));
			callback({"code": 400, "message": err.message, "error": err, "data": {}});
		} else {
			var msg = "Duplicated!\n Tid: " + tid + " Vid: " + vid + " condition: " + util.inspect(unique) + "\n Exsit Rid: " + recorder._doc["Rid"];
			log.warn(msg);
			callback({"code": 409, "message": "Conflict", "warning": msg, "data": recorder});
		}
	});
}

function remove(tid, vid, condition, callback) {
	if (typeof tid != 'string') log.debug.error("tid is missing for function remove.");
	if (typeof callback != 'function') log.debug("callback function is missing for function remove.");
	if (typeof condition == 'function') {callback = condition; conidtion = {};}
	
	var model = getTSchema(tid);
	
	model.find(condition, function (err, recorder) {
		if (!err) {
			for (var i in recorder) {
				logOP(tid, vid, "r", null, recorder[i]._doc);
			}
		}
	});
	model.find(condition).remove(function (err, nums) {
		if (!err) {
			callback({"code": 200, "message": "OK", "data": nums});
		} else {
			callback({"code": 400, "message": (err ? err.message : "Unknown!"), "error": err, "data": 0});
		}
		if (tid == "T") {initDB();}
	});
}

function update(tid, vid, condition, udata, callback) {
	var model = getTSchema(tid);
	var unique = (tid == "T") ? {'$or' : []} : __getUnique(defines(tid, vid)["Fields"], udata);
	if (condition && ('$or' in condition)) {
		unique['$or'] = unique['$or'].concat(condition['$or']);
	}
	
	if (unique['$or'].length < 1) {
		__update(tid, vid, condition, udata, callback);
		return;
	}
	model.findOne(unique, function (err, recorder) {
		if (!recorder && !err) {
			__update(tid, vid, condition, udata, callback)
		} else if (err) {
			callback({"code": 400, "message": err.message, "error": err, "data": {}});
		} else {
			callback({"code": 404, "message": "Not Found", "data": condition});
		}
	});
}


function __update(tid, vid, condition, udata, callback) {
	var model = getTSchema(tid);
	model.findOne(condition, function (err, doc) {	
		if (!doc && !err) {
			callback({"code": 404, "message": "Not Found", "data": {}});
		} else if (doc) {
			udata["Update"] = now();
			if("Reservation" in udata && !udata["user"]) {
				log.debug("ignore current reservation no user.");
			}
			if ("Reservation" in udata && udata["user"]) {
				var resers = udata["Reservation"].split("},");
				udata["Reservation"] = "";
				for (var i in resers) {
					resers[i] = (resers[i] + ((i < resers.length - 1)? "}":"")).toJSON();
					if ("add" in resers[i]) {
						resers[i]["add"]["sid"] = udata["Rid"];
						resers[i]["add"]["tid"] = tid;
						resers[i]["add"]["uid"] = udata["user"]["Rid"];
						resers[i]["add"]["email"] = udata["user"]["email"];
						resers[i]["add"]["uname"] = udata["user"]["name"];
						if (resers[i]["add"]["t0"]) {
							resers[i]["add"]["t0"] = Math.floor(Date.parse(resers[i]["add"]["t0"]) / 1000 - udata["user"]["ctz"] * 60)
						}
						if (!udata["user"]["email"] || !udata["user"]["email"].contains("@") ) {
							log.debug("ignore current reservation no user email.");
							delete resers[i]["add"];	
						} else {
							var hours = resers[i]["add"]["t1"];
							if (resers[i]["add"]["t0"]) {
								hours -= resers[i]["add"]["t0"];
							}
							udata["Reservation"] += "\n" + udata["user"]["name"] + " made " + (hours / 3600) + " Hour(s) reservation.";
						}
					}
					if ("remove" in resers[i]) {
						udata["Reservation"] += "\nUser cancelled reservation - id: " + resers[i]["remove"]["Rid"] + ".";
					}
				}
				makeReservation(resers, function() { makeReservation(resers); });
			}
			
			var changedFields = logOP(tid, vid, "u", doc._doc, udata);
			if (changedFields.length < 1) {
				log.info("No data changed.");
				callback({"code": 200, "message": "", "num": 1});
				return;
			}
			
			model.update(condition, udata, function (err, num) {
				if (tid == "T") {initDB();}  
				callback({"code": ((err || "").length > 0 ? 400: 200), "message": err, "num": num}); 
			});
		} else {
			callback({"code": 400, "message": err.message, "error": err, "data": {}});
		}
	});
}

function defines(tid, vid) {
	if (!vid) vid = "V1"; 
	return (tid) ? TDefines[tid+vid] : TDefines;
}
function matchRole(role, tid, vid) {
	var apps = "";
	if (role) {
		var roles = role.split(",");
		for (var i in roles) {
			var k = roles[i].trim();
			apps += "," + Roles[k];
		}
	} else {
		apps = Roles["Default"];
	}
	return {"matched": (apps) ? (apps.contains("*") || apps.contains(tid + "/" + vid)) : false, "apps": apps};
}


// daylight save time
var DSTs = {};
function dst(timezone, minus) {
	var tz = (timezone || 0) + "";
	switch (minus) {
		case 60:
			DSTs[tz] = timezone + 60;
			tz = DSTs[tz];
		break;
		case 0:
			DSTs[tz] = timezone;
			tz = DSTs[tz];
		break;
		default:
			tz = (tz in DSTs) ? DSTs[tz] : timezone;
		break;
	}
	return tz;
}

function active(op, data) {
//	refreshstaticFilestat();
	if (op == "add") {
		var id = uuid();
		Settings["ActiveUsers"][id] = data;
		saveSettings();
		return id;
	}
	if (op == "remove") {
		var email = Settings["ActiveUsers"][data] ? Settings["ActiveUsers"][data]["email"] : "";
		for (var i in Settings["ActiveUsers"]) {
			if (Settings["ActiveUsers"][i] && email == Settings["ActiveUsers"][i]["email"]) {
				delete Settings["ActiveUsers"][i];
			}
		}
		saveSettings();
		return;
	}
	var usr = {};
	for (var i in Settings["ActiveUsers"][data]) {
		usr[i] = Settings["ActiveUsers"][data][i];
	}
	usr.get = function(key) {
		key = Settings["User"][key] || key;
		return this[key] || "";
	}
	usr.set = function(key, val) {
		key = Settings["User"][key] || key;
		this[key] = val;
	}
	return usr;
}

var staticFiles = {};
function refreshstaticFilestat() {
	walk("web");
}
function walk(path){  
    var dirList = fs.readdirSync(path);

    dirList.forEach(function(item){
        if(fs.statSync(path + '/' + item).isFile()){
			fs.stat(path + '/' + item, function (err, stat) {
				try { staticFiles[path + '/' + item] = stat.mtime.toUTCString(); } catch (error) {};
			});
        }
    });

    dirList.forEach(function(item){
        if(fs.statSync(path + '/' + item).isDirectory()){
            walk(path + '/' + item);
        }
    });
}

function saveOrUpdate(tid, vid, keys, udata, callback) {
	if (typeof callback != 'function') {
		callback = function(recorder) { log.debug(util.inspect(recorder));}
	}
	var ks = keys.split(",");
	var cond = {};
	for (var i in ks) {
		var k = ks[i].trim();
		cond[k] = udata[k];
	}
	var model = getTSchema(tid);
	model.findOne(cond, function (err, doc) {	
		if (!doc && !err) {
			// Save
			udata["Create"] = udata["Update"];
			udata["CreateR"] = udata["UpdateR"];
			__save(tid, vid, model(udata), udata, callback);
		} else if (doc) {
			// udpate
			if (tid != "T" && tid.startsWith("T")) {
				var changedFields = logOP(tid, vid, "u", doc._doc, udata);
				if (changedFields.length < 1) {
					log.info("No data changed.");
					callback({"code": 200, "message": "", "num": 1});
					return;
				}
			}
			model.update(cond, udata, function (err, num) {
			callback({"code": ((err || "").length > 0 ? 400: 200), "message": err, "num": num}); if (tid == "T") {initDB();}  });
		} else {
			// DB error
			callback({"code": 400, "message": err});
		}
	});
}

module.exports = {
	getOpLogModel: function() {return mongoose.model('oplogs', oplogSchema);},
	getAppModel: getTSchema,
	list: list,
	findOne: findOne,
	newOne: newOne,
	remove: remove,
	update: update,
	refresh: refresh,
	getIds: function() {return Ids;},
	url2id: function(url) {return Urls[url];},
	defines: defines,	
	updateIDDef: updateIDDefine,
	getIDPreview: function(key) { return (key in Settings["IDDefines"]) ? previewID(Settings["IDDefines"][key]) : "AUTO"; },
	getIDNext: function(key) {return (key in Settings["IDDefines"]) ? getIDNext(Settings["IDDefines"][key]) : "Unknown"; },
	matchRole: matchRole,
	activeUser: active,
	dst: dst,
	health: function() {return dbStatus.success > dbStatus.failed},
	getSetting: function(key) {return (key in Settings) ? Settings[key] : {};},
	getAppList: function() {return liApps;},
	getAppOptions: function() {return optApps;},
	lastModified: function(path) {return staticFiles[path];},
}