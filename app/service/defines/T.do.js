var util = require('util');
var field = require('./fields.js');
var cps = require('../core/components.js');
var settings = require('../../settings.js');
var fs = require('fs');
var mongo = require('../core/mongo.db.js');
var log = require('../core/log.js')('Z');
var mongo = require('../core/mongo.db.js');
var fnames = {"Title": "", "URL": "", "Fields": "", "New": "", "Copy": "", "Edit": "", "Remove": "", "Help": "", "Email": "", "OrderBy": "", "Order": "", "Group": "", "Filter": "", "History": "", "Visible": "", "Enable": "", "Header": "", "Footer": "", "Active": "", "update": "", "updater": ""};

var vpath = "./views/";
var tpath = "service/defines/";

var template = "";

/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no
*/
function getUData(req) {
/*	var udata = cps.getReqData(req);
	var ff = {"F1": {type: "String", form: "text", label: 'name', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 50, min: 0, max: 0, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: 'ERROR: user name is empty'},
		"F2": {type: "String", form: "text", label: 'email', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 0, min: 0, max: 0, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: ''},
		"F3": {type: "String", form: "text", label: 'age', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 0, min: 0, max: 150, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: ''}, };
*/
 return cps.getReqData(req);
}
function add(req, res) {
	var uData = getUData(req);
	if (!("Title" in uData)) {
		fs.readFile("./T.json", 'utf8', function (err, data) {
			var uData = {};
			try {
				uData = JSON.parse(data);
			} catch (msg) {
				log.error(msg);
			}
			
			var recorder = {};
			recorder.data = field.init(uData);
			recorder.data["Tid"] = "auto";
			recorder.data["Vid"] = "auto";
			recorder.data["Rid"] = "auto";
			recorder.title = "NEW Application";
			recorder.action = "/T/new";
			recorder.code = 200;
			return __new(res, recorder);
		});
	} else {
		var json = {"Fields":"", "New":"", "Copy":"", "Edit":"", "Remove":""};
		for (var i in json) {
			uData[i] = (uData[i] || "").replace(/'/g, "\"");
		}
//		uData.New = JSON.parse(uData.New);
		var ids = __getTVid(req.u.Tid, req.u.Vid);		
		uData["Tid"] = ids["Tid"];
		uData["Vid"] = ids["Vid"];
		uData['URL'] = (uData['URL'] || "").toLowerCase();
		var cond = {'$or' : [{'Title': uData['Title']}, {'URL': uData['URL']}]};
		
		uData = __fillDefault(uData);
		mongo.newOne("T", "V", cond, uData, function (recorder) {
			if (recorder.code != 200) {
				log.error(recorder.message);
				recorder.data = uData;
				recorder.title = "NEW Application";
				recorder.action = "/T/new";
				return __new(res, recorder);
			} else {
				svUpdateIDDefine(uData);				
				refreshAppList(req, res);
				__show(res, recorder);
			}
		});
	}
}

function __getTVid(tid, vid) {
	var ids = mongo.getIds();
	if (!(tid + "").match(/T[\dA-W]+/)) {
		org = (ids.length ? ids.length : 0) + 1;
		
		while (("T" + (org + "").toN32()) in ids) {
			org++;
		}
		tid = "T" + (org + "").toN32();
		vid = "V" + (1 + "").toN32();
	} else {
		if (!(vid + "").match(/V[\dA-W]+/)) {
			org = (ids && tid in ids)? ids[tid].length + 1 : 1;
			while (("V" + (org + "").toN32()) in (ids[tid] || {})) {
				org++;
			}
			vid = "V" + (org + "").toN32();
		}
	}
	return {"Tid": tid, "Vid": vid};
}

function __new(res, recorder) {
	if (!recorder.title) {
		recorder.title = "Edit Application";
	}
	if (!recorder.action) {
		recorder.action = "/T/update";
	}
	recorder.app = "/tangrammy";
	recorder.fields = __fields(recorder.data["Tid"]);
	recorder.request = res.req;
	recorder.request.u.userurl = res.req.u.userurl || "/i/show?Rid=" + res.req.u.user["Rid"];
	if (! recorder.message) {
		recorder.message = "";
	}
	if (! recorder.warning) {
		recorder.warning = "";
	}
	return res.render(tpath + "T_new.ejs", recorder);
}
function __show(res, recorder) {
	recorder.title = "Application Details";
	recorder.action = "";
	recorder.request = res.req;
	recorder.request.u.userurl = res.req.u.userurl || "/i/show?Rid=" + res.req.u.user["Rid"];
	recorder.app = "/tangrammy";
	if (! recorder.message) {
		recorder.message = "";
	}
	if (! recorder.warning) {
		recorder.warning = "";
	}
	recorder.fields = __fields(recorder.data["Tid"]);
	return res.render(tpath + "T_show.ejs", recorder);
}

function __getAppName(url) {
	if (url == "/") return "Home";
	if (!url) return "Unknown";
	
	var def = mongo.defines();
	for (var i in def) {
		if (url.contains("/" + def[i]["URL"] + "/") || url.contains("/" + def[i]["Tid"] + "/" + def[i]["Vid"] + "/")) {
			return def[i]["Title"];
		}
	}
	return "Unknown";
}
function __fields(tid) {
	var def = mongo.defines();
	var fds = {};
	if (tid + "V1" in def) {
		def = (def[tid + "V1"]["Fields"] + "").toJSON();
		for (var i in def) {
			fds[i] = def[i]["label"];
		}
	} else {
		for (var i=0; i < 10; i++) {
			fds["F" + i] = "F" + i;
		}
	}
	return fds;
}

function show(req, res, cond) {
	var uData = getUData(req);
	var condition = {};
	for (var i in fnames) {
		if (i in uData) {
			condition[i] = uData[i];
		}
	}
	mongo.findOne("T", "V", null, uData, function (recorder) {
		if (recorder.code != 200) {
			log.error(recorder.message);
			__show(res, recorder);
		} else {
			__show(res, recorder);
		}
	});
}
function copy(req, res) {
	var uData = getUData(req);
	var condition = {};
	condition["Rid"] = uData["Rid"];
	if ("Title" in uData) {
		var ids = __getTVid(req.u.Tid, "");
		uData["Vid"] = ids["Vid"];
		uData['URL'] = (uData['URL'] || "").toLowerCase();
		var cond = {'$or' : [{'Title': uData['Title']}, {'URL': uData['URL']}]};
		uData = __fillDefault(uData);
		mongo.newOne("T", "V", cond, uData, function (recorder) {
			if ((recorder.code) != 200 || recorder.num < 1) {
				log.error(recorder.message);
				recorder.data = uData;
				recorder.title = "Copy Create Views";
				recorder.action = "/T/copy";
				return __new(res, recorder);
			} else {
				svUpdateIDDefine(uData)
				log.error("Update" + recorder.num);
				recorder.title = "Copy Create Views Result";
				recorder.data = uData;				
				refreshAppList(req, res);
				__show(res, recorder);
			}
		});
	} else {
		mongo.findOne("T", "V", null, condition, function (recorder) {
			if (recorder.code != 200) {
				log.error(recorder.message);
				res.end(recorder.message + util.inspect(recorder.error));
			} else {
				recorder.title = "Copy Create Views";
				recorder.action = "/T/copy";
				recorder.data["Vid"] = "auto";
				recorder.data["Rid"] = "auto";
				return __new(res, recorder);
			}
		});
	}
}
function modify(req, res) {
	var uData = getUData(req);
	var condition = {};
	condition["Rid"] = uData["Rid"];
	if ("Title" in uData) {
		uData = __fillDefault(uData);
		mongo.update("T", "V", condition, uData, function (recorder) {
			if ((recorder.code) != 200 || recorder.num < 1) {
				log.error(recorder.message);
				recorder.data = uData;
				recorder.title = "Edit Application";
				recorder.action = "/T/update";
				return __new(res, recorder);
			} else {
				svUpdateIDDefine(uData)
				log.error("Update" + recorder.num);
				recorder.title = "Edit Application Result";
				recorder.data = uData;
				__show(res, recorder);
				refreshAppList(req, res);
			}
		});
	} else {
		mongo.findOne("T", "V", null, condition, function (recorder) {
			if (recorder.code != 200) {
				log.error(recorder.message);
				res.end(recorder.message + util.inspect(recorder.error));
			} else {
				recorder.title = "Edit Application";
				recorder.action = "/T/update";
				return __new(res, recorder);
			}
		});
	}
}
function remove(req, res) {
	var uData = getUData(req);
	var condition = {};
	for (var i in fnames) {
		if (i in uData) {
			condition[i] = uData[i];
		}
	}
	condition["Rid"] = uData["Rid"];
	mongo.remove("T", "V", condition, function (recorder) {
		if (recorder.code != 200) {
			log.error(recorder.message);
			res.end(recorder.message + util.inspect(recorder.error));
		} else {
			refreshAppList(req, res);
			// TODO backup db define, remove views.
			res.end('removed application!\n');
		}
	});
}
function search(req, res) {
	var uData = getUData(req);
	mongo.list("T", "V", null, {}, "Tid Vid Rid Title Description Visible Enable URL Help", {sort: {Tid: 1, Vid: 1}}, function (recorder) {
		if (recorder.code != 200) {
			log.error(recorder.message);
			res.end(recorder.message + util.inspect(recorder.error));
		} else {
			recorder.title = "Application List";
			recorder.request = res.req;
			return res.render(tpath + "T_list.ejs", recorder);
		}
	});
}

function svUpdateIDDefine(data) {
	var fdata = (data["Fields"] + "").toJSON();
	for(var i in fdata) {
		if (fdata[i].form == "id") {
			if (!fdata[i].key || fdata[i].key.length < 1) {
				fdata[i].key = data["Tid"];
			}
			mongo.updateIDDef(fdata[i].key, fdata[i].val, fdata[i].format);
		}
	}
}
function __fillDefault(uData) {
	var fdata = (uData["Fields"] + "").toJSON();
	if (!(uData["LList"] + "").contains("{")) {
		var defList = "";
		for(var i in fdata) {
			defList += '"' + i + '": {"Title": "' + fdata[i].label + '"}, ';
		}
		defList += '"Show": {"Title": "Detail", "label": "Detail", "icon": "", "type": "link"}, ';
		defList += '"Edit": {"Title": "Edit", "label": "", "icon": "edit.png", "type": "link"}, ';
		defList += '"Copy": {"Title": "Copy", "label": "", "icon": "copy.png", "type": "link"}, ';
		defList += '"Remove": {"Title": "Remove", "name": "remove", "label": "", "icon": "remove.png", "type": "link"}';
		uData["LList"] = defList;
	}
	if (!(uData["LShow"] + "").contains("{")) {
		var defList = '"Title": "Show ' + uData["Title"] + '", "Width": "col-md-12",';
		for(var i in fdata) {
			defList += '"' + i + '": {}, ';
		}
		defList += '"Section4": {"Width": "col-md-12", "List": {"label": "OK", "type": "button", "css": "btn btn-primary col-md-2"}, "Edit": {"label": "Edit", "icon": "edit.png", "type": "button", "css": "btn btn-default"}, "Copy": {"label": "Copy&Create", "icon": "copy.png", "type": "button", "css": "btn btn-default"}, "New": {"label": "Add new", "icon": "add.png", "type": "button", "css": "btn btn-default"}}';
		uData["LShow"] = defList;
	}
	if (!(uData["LEdit"] + "").contains("{")) {
		var defList = '"Title": "Modify ' + uData["Title"] + '", "Width": "col-md-12",';
		for(var i in fdata) {
			defList += '"' + i + '": {}, ';
		}
		defList += '"Section4": {"Width": "col-md-12", "Submit": {"label": "Save Changes", "icon": "", "type": "button", "css": "btn btn-primary"}, "List": {"label": "Cancel", "icon": "", "type": "link", "css": "small"}}';
		uData["LEdit"] = defList;
	}
	if (!(uData["LNew"] + "").contains("{")) {
		var defList = '"Title": "Add New ' + uData["Title"] + '", "Width": "col-md-12",';
		for(var i in fdata) {
			defList += '"' + i + '": {}, ';
		}
		defList += '"Section4": {"Width": "col-md-12", "Submit": {"label": "Save", "icon": "", "type": "button", "css": "btn btn-primary"}, "List": {"label": "Cancel", "icon": "", "type": "link", "css": "small"}}';
		uData["LNew"] = defList;
	}
	
	uData["CheckFuncs"] = "" + util.inspect(field.toCheckFuncs(uData["Fields"]));
	return uData;
}
function refreshAppList(req, res, lst) {
	try {
		if (template == "") {
			template = fs.readFileSync(settings.defines.template, {encoding: 'utf8'});
		}
	} catch(e) {
		log.error(err);
		res.end(err);
	}
	if (!lst) {
		mongo.list("T", "V", null, {}, "", {"sort": {"Title": -1}}, function (recorder) {
			__refreshAppList(recorder.data);
		});
	} else {
		__refreshAppList(lst);
	}
}
function __refreshAppList(lst) {
	var items = '<div class="col-md-12"><div class="row">\r\n';
	var defines = '<div class="col-md-12"><div class="row">\r\n';
	var cols = 0;
	for (var it = lst.length - 1; it > -1; it--) {
		if (lst[it]["Visible"] != "on" || lst[it]["Enable"] != "on") {
			continue; 
		}
		
		// items for Home page
		items += '<% if (!request.u.apps || request.u.apps.contains("*") || request.u.apps.contains("' + lst[it]["Tid"] + '/' + lst[it]["Vid"] + '")) { %>\r\n	<div class="col-md-3" style="border: 1px solid #ccc;">\r\n' + 
				'		<h2><a href="/' + lst[it]["URL"] + '/list">' + lst[it]["Title"] + '</a></h2>\r\n' + 
				'		<div style="height: 60px; overflow: hidden;"><p>' + lst[it]["Description"] + '</p></div>\r\n' + 
				'		<p class="text-right"><a href="/' + lst[it]["URL"] + '/list" role="button">Details »</a></p>\r\n' + 
				'	</div>\r\n<% } %>\r\n';
		if ((++cols) > 3) {
			cols = 0;
		}
	}
	items += '</div></div>\r\n';
	cols = 0;
	for (var it = lst.length - 1; it > -1; it--) {
		// items for Tangrammy page
		defines += '<% if (!request.u.apps || request.u.apps.contains("*") || request.u.apps.contains("' + lst[it]["Tid"] + '/' + lst[it]["Vid"] + '")) { %>\r\n	<div class="list-app">\r\n' + 						
'		<h3><small>' + (lst[it]["Enable"].contains("on") ? (lst[it]["Visible"].contains("on") ? "" : "[Hidden]") : "[Disabled]") + '</small>' + lst[it]["Title"] + ' <small>(' + lst[it]["Tid"] + '.' + lst[it]["Vid"] + ')</small> </h3>\r\n' + 
'		<small><a href="/' + lst[it]["URL"] + '/list">http://~/' + lst[it]["URL"] + '/list </a> </small> <br /> \r\n' + 
'		<p>' + lst[it]["Description"] + '</p>\r\n' + 
'		<div class="text-right">\r\n' + 
'			<a class="btn btn-xs" name="onemsg" href="javascript:;" url="/T/create?Rid=' + lst[it]["Rid"] + '" title="Rebuild application[' + lst[it]["Title"] + '] to active changes">Rebuild</a>\r\n' + 
'			<a href="/T/show?Rid=' + lst[it]["Rid"] + '" title="View define detail of application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/detail.png"></a>\r\n' + 
'			<a href="/T/update?Rid=' + lst[it]["Rid"] + '" title="Edit application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/edit.png"></a>\r\n' + 
'			<a href="/T/copy?Rid=' + lst[it]["Rid"] + '" title="Create a new one based on application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/copy.png"></a>\r\n' + 
(lst[it]["Tid"].match(/TF\d/gi) ? '' : '			<a name="remove" href="javascript:;" url="/T/remove?Rid=' + lst[it]["Rid"] + '" title="Remove application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/remove.png"></a>\r\n') + 
'		</div>\r\n	</div>\r\n<% } %>\r\n';

		if ((++cols) > 3) {
			cols = 0;
		}
	}

	defines += '	<div class="list-app">\r\n' + 	 						
'		<h3><small>Rebuild: </small><a name="onemsg" href="javascript:;" url="/T/create">All Applications</a></h3><br />\r\n' + 
'		<p class="text-center"><a href="/T/new" class="btn btn-lg btn-default" title="Add New Application"><img src="/img/add.png"> Application</a></p>\r\n' + 
'		<div class="text-right"><a href="https://github.com/ItMan70s/Tangrammy/">View TangramMy on GitHub</a></div>\r\n' + 
			'</div>\r\n';
	defines += '</div>\r\n';
var hed = '	<div class="well">\r\n' + 
'		<h1 class="text-center" style="font-size: 48px;">TangramMy</h1>\r\n' + 
'		<p>The tangrammy is a system enable DIY your own services. Its idea comes from <a target="_blank" href="http://en.wikipedia.org/wiki/Tangram"><img src="/img/favicon.ico">tangram</a>, and is implemented by NodeJS, Bootstrap, jQuery.\r\n ' + 
'		<ul><li>Builds service fast - it takes <0.5 hour to build a new service.</li>\r\n' + 
'		<li>Changes with needs - it is easy to make changes to achive new requirement.</li>\r\n' + 
'		<li>Gets start easily - all services are displayed in one view and simple.</li></ul></p>\r\n' + 
'</div>\r\n';
	
	var links = "";
	for (var i in settings.tops) {
		if (settings.tops[i].url && settings.tops[i].url.length > 0) {
			links += "			<li><a href='" + settings.tops[i].url + "' title='" + (settings.tops[i].title || "") + "'>" + (settings.tops[i].name || __getAppName(settings.tops[i].url)) + "</a></li>\r\n";
		}
	}
	fs.writeFile(vpath + 'Tangram.ejs', template.replace('navbar-header', 'navbar-header active').replace("TOP_LINKS", links).replace("FIELDS", hed + defines).replace("HEAD_TITLE - ", ""), function(err){ if (err) log.error(err); });
hed = '	<div class="jumbotron homepage">\r\n' + 
'		<h1>' + settings.home.welcome + '</h1>\r\n' + 
'		<p>' + settings.home.content + '</p>\r\n' + 
'</div>\r\n';
	fs.writeFile(vpath + 'welcome.ejs', template.replace("TOP_LINKS", links.replace("<li><a href='/'", "<li class='active'><a href='/'")).replace("FIELDS", hed + items).replace("HEAD_TITLE", settings.home.name), function(err){ if (err) log.error(err); });

	// T show
	var names = ["./service/defines/T_show.ejs", "./service/defines/T_new.ejs"];
	for (var i in names) {
		var contents = fs.readFileSync(names[i], {encoding: 'utf8'});
		if (contents && contents.contains("<!-- start -->")) {
			contents = "<!-- start -->" + contents.mid("<!-- start -->", "<!-- end -->") + "<!-- end -->";
			fs.writeFile(names[i], template.replace('navbar-header', 'navbar-header active').replace("TOP_LINKS", links).replace("FIELDS", contents).replace("HEAD_TITLE - ", ""), function(err){ if (err) log.error(err); });
		}
	}
}

function create(req, res) {
	try {
		template = fs.readFileSync(settings.defines.template, {encoding: 'utf8'});
	} catch(e) {
		log.error(err);
		res.end(err);
	}
	
	var uData = getUData(req);
	var condition = {};
	if ("Rid" in uData) {
		condition["Rid"] = uData["Rid"];
		createOne(req, res, condition);
	} else {
		mongo.list("T", "V", null, condition, "", {"sort": {"Title": -1}}, function (recorder) {
			var lst = recorder.data;
			for (var it = lst.length - 1; it > -1; it--) {
				if (lst[it]["Enable"] != "on") {
					continue; 
				}
				recorder.data = lst[it];
				createOneByRecorder(recorder);	
				
			}
			refreshAppList(req, res, lst);
			res.end("Rebuilt successfully. Restart service to confirm changes.");
		});
	}
}
function createOne(req, res, condition) {
	mongo.findOne("T", "V", null, condition, function (recorder) {
		if (recorder.code != 200) {
			log.error(recorder.message);
			res.end(recorder.message);
		} else {
			createOneByRecorder(recorder);
			res.end("Rebuilt successfully. Restart service to confirm changes.");
		}
	});
}
function createOneByRecorder(recorder) {
	if (recorder.code != 200) {
		log.error(recorder.message);
	} else {
		//var fields = JSON.parse((recorder.data["Fields"] || "").replace(/'/g, "\""));
		var fdata = {};
		fdata.data = (recorder.data["Fields"] + "").replace("'APP_OPTIONS'", mongo.getAppOptions()).toJSON();
		recorder.data = __fillDefault(recorder.data);
		recorder.data["CheckFuncs"] = "" + util.inspect(field.toCheckFuncs(recorder.data["Fields"]));

		fdata["CheckFuncs"] = (recorder.data["CheckFuncs"] + "").toJSON();
		
		fdata["LNew"] = (recorder.data["LEdit"] + "").toJSON();
		fdata["LEdit"] = (recorder.data["LNew"] + "").toJSON();
		fdata["LShow"] = (recorder.data["LShow"] + "").toJSON();
		fdata["LList"] = (recorder.data["LList"] + "").toJSON();
		fdata["New"] = (recorder.data["New"] + "").toJSON();
		fdata["Copy"] = (recorder.data["Copy"] + "").toJSON();
		fdata["Show"] = (recorder.data["Show"] + "").toJSON();
		fdata["Edit"] = (recorder.data["Edit"] + "").toJSON();
		fdata["Remove"] = (recorder.data["Remove"] + "").toJSON();
		fdata.raw = recorder.data;

		if ((recorder.data["URL"] || "").length < 1) {
			recorder.data["URL"] = recorder.data["Tid"] + '/' + recorder.data["Vid"]
		}
		
		var links = "";
		for (var i in settings.tops) {
			if (settings.tops[i].url && settings.tops[i].url.length > 0) {
				links += "			<li " + (settings.tops[i].url.contains("/" + recorder.data["URL"] + "/") ? "class='active'" : "") + "><a href='" + settings.tops[i].url + "' title='" + (settings.tops[i].title || "") + "'>" + (settings.tops[i].name || __getAppName(settings.tops[i].url)) + "</a></li>\r\n";
			}
		}
		if (!links.contains("/" + recorder.data["URL"] + "/")) {
			links += "			<li class='active backup'></li>\r\n";
		}
		var data = template.replace("TOP_LINKS", links).replace("HEAD_TITLE", recorder.data["Title"]);
		var name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'new.ejs';
		fdata.title = "NEW " + recorder.data["Title"];
		fdata.url = recorder.data["URL"];
		fdata.action = "/" + recorder.data["URL"] + "/new";
		fs.writeFile(name, data.replace("FIELDS", field.toEdit(fdata, 4)).replace('<%= data["Rid"] %>', ''), function(err){ if (err) log.error(err); });
		
		fdata["LEdit"] = fdata["LNew"];
		fdata.title = "Edit " + recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"] + "/update";
		name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'edit.ejs';
		fs.writeFile(name, data.replace("FIELDS", field.toEdit(fdata, 4)), function(err){ if (err) log.error(err); });
		
		fdata.title = "SHOW " + recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"];
		name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'show.ejs';
		fs.writeFile(name, data.replace("FIELDS", field.toShow(fdata, 4)), function(err){ if (err) log.error(err); });
		
		fdata.title = "List " + recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"];
		fdata["Group"] = recorder.data["Group"];
		fdata["OrderBy"] = recorder.data["OrderBy"];
		fdata["Order"] = recorder.data["Order"];
		name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'list.ejs';
		fs.writeFile(name, data.replace("FIELDS", field.toList(fdata, 4)).replace("HEAD_TITLE", recorder.data["Title"]), function(err){ if (err) log.error(err); });
		
		log.warn("Application[" + recorder.data["Title"] + "] is built.");
	}
}

function process(req, res) {
	/*
	var url = req._parsedUrl.pathname;
	var uData = req.u.data;
	uData.user = req.u.user;
	*/
	var tid = req.u.Tid;
	var vid = req.u.Vid;
	var define = mongo.defines(tid, vid) || {};
	switch(req.u.op) {
		case "create":
			return create(req, res);
		break;
		case "new":
			return add(req, res);
		break;
		case "copy":
			return copy(req, res);
		break;
		case "show":
			return show(req, res);
		break;
		case "update":
			return modify(req, res);
		break;
		case "remove":
			return remove(req, res);
		break;
		case "list":
		case "search":
			return search(req, res);
		break;
		default:
			log.warn("ssid[" + req.u.ssid + "] no expected URL: " + req.url + ". Client information: " + req.info());
			return search(req, res);
		break
	}
	var warning = "<B>404 EVENT!</B><br/>Tangram made a lot of applications except " + tid + ". <br/>Google tangram then DIY one _(._.)_";
	welcome(req, res, warning);
	log.warn("ssid[" + req.u.ssid + "] " + " access invalidated URL by " + req.info().replace(/[\r\n]+/g, " "));
}

module.exports = {
	process: process,
};
