var util = require('util');
var field = require('./fields.js');
var cps = require('../core/components.js');
var settings = require('../../settings.js');
var fs = require('fs');
var A = require('../action/app.do.js');
var mongo = require('../core/mongo.db.js');
var log = require('../core/log.js')('Z');
var fnames = {"Title": "", "URL": "", "Fields": "", "New": "", "Copy": "", "Edit": "", "Remove": "", "Help": "", "Email": "", "OrderBy": "", "Order": "", "Pagging": "", "Group": "", "Filter": "", "History": "", "Status": "", "Header": "", "Footer": "", "Active": "", "update": "", "updater": ""};

var vpath = "./views/";
var tpath = "service/admin/";

var template = "";

/**
Processes command http requests.
	req: Object HTTP request.
	res: Object HTTP response.
Returns: no
*/
var TTemplate = {"Title" : "New Applicaton Title", "URL" : "url", "Help" : "<a href='#'>Help </a>", "Description" : "Input description for this application so that people could understand what's application.", "Fields" : "{\r\n\"F0\": {\"type\": \"String\", \"form\": \"text\", \"label\": \"SampleText\", \"default\": \"0\", \"placeholder\": \" despcription\", \"attribute\": \",required,unique,\"},\r\n\"F1\": {\"type\": \"String\", \"form\": \"richtext\", \"label\": \"SampleRichText\", \"default\": \"0\", \"placeholder\": \" despcription\", \"attribute\": \",htm,\"},\r\n\"F2\": {\"type\": \"String\", \"form\": \"radio\", \"label\": \"SampleRadio\", \"options\": [{\"value\": \"0\", \"caption\": \"<font color='#0000ff'><img src=' /img/s/b1.png '> Inistial</font>\"},{\"value\": \"1\", \"caption\": \"<img src=' /img/s/b2.png '><font color='#008000'> In Progress</font>\"},{\"value\": \"2\", \"caption\": \"<font color='#ff9900'><img src=' /img/s/b3.png '> Waiting</font>\"},{\"value\": \"3\", \"caption\": \"<img src=' /img/s/b7.png '> Finished\"},], \"default\": \"0\", \"attribute\": \",\"},\r\n\"F3\": {\"type\": \"String\", \"form\": \"checkbox\", \"label\": \"Samplecheckbox\", \"options\": [{\"value\": \"0\", \"caption\": \"Low\"},{\"value\": \"1\", \"caption\": \"<img src='/img/s/f4.png'><span class='orange'>Medium</span>\"},{\"value\": \"2\", \"caption\": \"<img src='/img/s/f5.png'><span class='red'>High</span>\"},], \"default\": \"0\", \"attribute\": \",htm,\"},\r\n\"F4\": {\"type\": \"String\", \"form\": \"datetime\", \"label\": \"SampleDatetime\", \"format\": \"YYYY-MM-DD hh:mm:ss\", \"attribute\": \",\"},\r\n\"F5\": {\"type\": \"String\", \"form\": \"id\", \"label\": \"SampleID\", \"default\": \"0\", \"key\": \"V.sample\", \"val\": \"1\", \"format\": \"Do000\", \"attribute\": \",\"},\r\n}", "Keys" : "undefined", "NoAction" : "", "JSNew" : "", "JSEdit" : "", "JSShow" : "", "JSSave" : "", "LList" : "\"F0\": {\"Title\": \"SampleText\"}, \"F1\": {\"Title\": \"SampleRichText\"}, \"F2\": {\"Title\": \"SampleRadio\"}, \"F3\": {\"Title\": \"Samplecheckbox\"}, \"F4\": {\"Title\": \"SampleDatetime\"}, \"F5\": {\"Title\": \"SampleID\"}, \"Show\": {\"Title\": \"Detail\", \"label\": \"Detail\", \"icon\": \"\", \"type\": \"link\"}, \"Edit\": {\"Title\": \"Edit\", \"label\": \"\", \"icon\": \"edit.png\", \"type\": \"link\"}, \"Copy\": {\"Title\": \"Copy\", \"label\": \"\", \"icon\": \"copy.png\", \"type\": \"link\"}, \"Remove\": {\"Title\": \"Remove\", \"name\": \"remove\", \"label\": \"\", \"icon\": \"remove.png\", \"type\": \"link\"}", "LShow" : "\"Title\": \"Show undefined\", \"Width\": \"col-md-12\",\"F0\": {}, \"F1\": {}, \"F2\": {}, \"F3\": {}, \"F4\": {}, \"F5\": {}, \"Section4\": {\"Width\": \"col-md-12\", \"List\": {\"label\": \"OK\", \"type\": \"button\", \"css\": \"btn btn-primary col-md-2\"}, \"Edit\": {\"label\": \"Edit\", \"icon\": \"edit.png\", \"type\": \"button\", \"css\": \"btn btn-default\"}, \"Copy\": {\"label\": \"Copy&Create\", \"icon\": \"copy.png\", \"type\": \"button\", \"css\": \"btn btn-default\"}, \"New\": {\"label\": \"Add new\", \"icon\": \"add.png\", \"type\": \"button\", \"css\": \"btn btn-default\"}}", "LEdit" : "\"Title\": \"Modify undefined\", \"Width\": \"col-md-12\",\"F0\": {}, \"F1\": {}, \"F2\": {}, \"F3\": {}, \"F4\": {}, \"F5\": {}, \"Section4\": {\"Width\": \"col-md-12\", \"Submit\": {\"label\": \"Save Changes\", \"icon\": \"\", \"type\": \"button\", \"css\": \"btn btn-primary\"}, \"List\": {\"label\": \"Cancel\", \"icon\": \"\", \"type\": \"link\", \"css\": \"small\"}}", "LNew" : "\"Title\": \"Add New undefined\", \"Width\": \"col-md-12\",\"F0\": {}, \"F1\": {}, \"F2\": {}, \"F3\": {}, \"F4\": {}, \"F5\": {}, \"Section4\": {\"Width\": \"col-md-12\", \"Submit\": {\"label\": \"Save\", \"icon\": \"\", \"type\": \"button\", \"css\": \"btn btn-primary\"}, \"List\": {\"label\": \"Cancel\", \"icon\": \"\", \"type\": \"link\", \"css\": \"small\"}}", "CheckFuncs" : "{ F0: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for SampleText!\\';return \\'\\';\"',\n  F1: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for SampleRichText!\\';return \\'\\';\"',\n  F2: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for SampleRadio!\\';return \\'\\';\"',\n  F3: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for Samplecheckbox!\\';return \\'\\';\"',\n  F4: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for SampleDatetime!\\';return \\'\\';\"',\n  F5: '\"if (val == undefined) return \\'\\';if (val.length < 0) return \\'Please input value for SampleID!\\';return \\'\\';\"' }", "Update" : "2015/08/03 17:41:36.802 (UTC 8:00)", "__v" : 0, "Status" : "available", "Footer" : "", "Group" : "-1", "Pagging": 0, "Order" : "1,1,1", "OrderBy" : "F5,null,null", "Condition" : "{\"F2\": { $in : [0,1,2] }}", "LayoutL" : "<table class=‘table’><tr>\r\n<td  field='F0'>(F0)</td>\r\n<td  field='F1'>(F1)</td>\r\n<td  field='F2'>(F2)</td>\r\n<td  field='F3'>(F3)</td>\r\n<td  field='F4'>(F4)</td>\r\n<td  field='F5'>(F5)</td>\r\n<td field=\"show\" LSAction=\"show\"><LSAction class=\"btn-group-xs\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"show\" title=\"\">Detail</a></LSAction></td>\r\n<td field=\"edit\" LSAction=\"edit\"><LSAction class=\"btn-group-xs\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"edit\" title=\"\"><img src=\"/img/edit.png\"></a></LSAction></td>\r\n<td field=\"copy\" LSAction=\"copy\"><LSAction class=\"btn-group-xs\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"copy\" title=\"\"><img src=\"/img/copy.png\"></a></LSAction></td>\r\n<td field=\"remove\" LSAction=\"remove\"><LSAction class=\"btn-group-xs\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"delete\" title=\"\"><img src=\"/img/remove.png\"></a></LSAction></td>\r\n</tr></table>  ", "FieldsLL" : "\"F0\": {\"title\": \"SampleText\"},\"F1\": {\"title\": \"SampleRichText\"},\"F2\": {\"title\": \"SampleRadio\"},\"F3\": {\"title\": \"Samplecheckbox\"},\"F4\": {\"title\": \"SampleDatetime\"},\"F5\": {\"title\": \"SampleID\"},\"Show\": {\"title\": \"Detail\"},\"Edit\": {\"title\": \"Edit\"},\"Copy\": {\"title\": \"Copy\"},\"Remove\": {\"title\": \"Remove\"}", "AdvanceCondition" : "", "Filter" : "", "Header" : "", "New" : "<div class=\"col-md-0\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"submit\" title=\"Add new data into this application\"><img src=\"/img/add.png\">New Data</a></div>", "History" : "off", "ActionLS" : "<div class=\"col-md-0\"><a class=\"btn btn-primary col-md-2\" href=\"javascript:;\" name=\"list\" style=\"min-width:80px;\" title=\"\">OK</a></div>\r\n<div class=\"col-md-0\"><a class=\"btn btn-default\" href=\"javascript:;\" name=\"edit\" style=\"min-width:80px;\" title=\"\"><img src=\"/img/edit.png\">Edit</a></div>\r\n<div class=\"col-md-0\"><a class=\"btn btn-default\" href=\"javascript:;\" name=\"copy\" style=\"min-width:80px;\" title=\"\"><img src=\"/img/copy.png\">Copy&Create</a></div>\r\n<div class=\"col-md-0\"><a class=\"btn btn-default\" href=\"javascript:;\" name=\"new\" style=\"min-width:80px;\" title=\"\"><img src=\"/img/add.png\">Add new</a></div>\r\n", "LayoutS" : "<div class='col-md-12' field='F0'>(F0)</div>\r\n<div class='col-md-12' field='F1'>(F1)</div>\r\n<div class='col-md-12' field='F2'>(F2)</div>\r\n<div class='col-md-12' field='F3'>(F3)</div>\r\n<div class='col-md-12' field='F4'>(F4)</div>\r\n<div class='col-md-12' field='F5'>(F5)</div>\r\n", "FieldsLS" : "\"F0\": {},\"F1\": {},\"F2\": {},\"F3\": {},\"F4\": {},\"F5\": {}", "TitleLS" : "Show New Applicaton Title", "ActionLE" : "<div class=\"col-md-0\"><a class=\"btn btn-primary\" href=\"javascript:;\" name=\"submit\" style=\"min-width:80px;\" title=\"\">Save Changes</a></div>\r\n<div class=\"col-md-0\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"list\" style=\"min-width:80px;\" title=\"\">Cancel</a></div>\r\n", "LayoutE" : "<div class='col-md-12' field='F0'>(F0)</div>\r\n<div class='col-md-12' field='F1'>(F1)</div>\r\n<div class='col-md-12' field='F2'>(F2)</div>\r\n<div class='col-md-12' field='F3'>(F3)</div>\r\n<div class='col-md-12' field='F4'>(F4)</div>\r\n<div class='col-md-12' field='F5'>(F5)</div>\r\n  ", "FieldsLE" : "\"F0\": {},\"F1\": {},\"F2\": {},\"F3\": {},\"F4\": {},\"F5\": {}", "TitleLE" : "Modify New Applicaton Title", "ActionLN" : "<div class=\"col-md-0\"><a class=\"btn btn-primary\" href=\"javascript:;\" name=\"submit\" style=\"min-width:80px;\" title=\"\">Save</a></div>\r\n<div class=\"col-md-0\"><a class=\"btn btn-link\" href=\"javascript:;\" name=\"list\" style=\"min-width:80px;\" title=\"\">Cancel</a></div>\r\n", "LayoutN" : "<div class='col-md-12' field='F0'>(F0)</div>\r\n<div class='col-md-12' field='F1'>(F1)</div>\r\n<div class='col-md-12' field='F2'>(F2)</div>\r\n<div class='col-md-12' field='F3'>(F3)</div>\r\n<div class='col-md-12' field='F4'>(F4)</div>\r\n<div class='col-md-12' field='F5'>(F5)</div>\r\n", "FieldsLN" : "\"F0\": {},\"F1\": {},\"F2\": {},\"F3\": {},\"F4\": {},\"F5\": {}", "TitleLN" : "Add New New Applicaton Title" };
var options = {"app": [], "users": []};

function add(req, res) {
	var uData = req.u.data;
	if (!("Title" in uData)) {
		var recorder = {};
		recorder.data = TTemplate;
		recorder.data["Tid"] = "auto";
		recorder.data["Vid"] = "auto";
		recorder.data["Rid"] = "auto";
		recorder.title = "NEW Application";
		recorder.action = "/T/new";
		recorder.code = 200;
		return __new(res, recorder);
	} else {
		var json = {"Fields":"", "New":"", "Copy":"", "Edit":"", "Remove":""};
		for (var i in json) {
			uData[i] = (uData[i] || "").replace(/'/g, "\"");
		}
//		uData.New = JSON.parse(uData.New);
		var ids = __getTVid(uData["Tid"], uData["Vid"]);
		uData["Tid"] = ids["Tid"];
		uData["Vid"] = ids["Vid"];
		uData['URL'] = (uData['URL'] || "").toLowerCase();
		var cond = {'$or' : [{'Title': uData['Title']}, {'URL': uData['URL']}]};
		
		uData = __fillDefault(uData);
		for (var i in TTemplate) {
			if (! i in uData) {
				uData[i] = TTemplate[i];
			}
		}
		uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "applications"/g, '"otype": "applications", "options": ' + options.app);
		uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "users"/g, '"otype": "users", "options": ' + options.users);
		mongo.newOne("T", "V", cond, uData, function (recorder) {
			if (recorder.code != 200) {
				log.error(recorder.message);
				uData["dl"] = uData["dl"] == "layout" ? "" : "layout" ;
				recorder.data = uData;
				recorder.title = "NEW Application";
				recorder.action = "/T/new";
				return __new(res, recorder);
			} else {
				svUpdateIDDefine(uData);				
				refreshAppList(req, res);
				res.redirect("/T/update?Rid=" + recorder.data["Rid"] + "&dl=layout");		
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
	var encodeFields = ["JSNew", "JSEdit", "JSShow", "JSSave"];
	for (var i in encodeFields) {
		var fid = encodeFields[i];
		if (!recorder.data[fid]) {
			continue;
		}
		recorder.data[fid] = recorder.data[fid].replace(/&/g, "&amp;").replace(/"/g, "&#34;").replace(/'/g, "&#39;").replace(/\r/g, "&#10;").replace(/\n/g, "&#13;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\\/g, "&#92;");
	}
	recorder.app = "/tangrammy";
	recorder.fields = __fields(recorder.data["Tid"]);
	recorder.total = recorder.fields["total"] + 4;
	recorder.total = recorder.total > 15 ? 15 : recorder.total;
	delete recorder.fields["total"];
	recorder.request = res.req;
	recorder.request.u.userurl = res.req.u.userurl || "/i/show?Rid=" + res.req.u.user["Rid"];
	recorder.message = recorder.message || recorder.data.message || "";
	recorder.warning = recorder.warning || recorder.data.warning || "";
	recorder.warning = recorder.warning.replace(/\n/g, "<br />");
	recorder.notification = (settings.SMTP && (settings.SMTP.host || settings.SMTP.service));
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
	recorder.total = recorder.fields["total"];
	delete recorder.fields["total"];
	recorder.notification = (settings.SMTP && (settings.SMTP.host || settings.SMTP.service));
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
	var total = 0;
	if (tid + "V1" in def) {
		def = (def[tid + "V1"]["Fields"] + "").toJSON();
		for (var i in def) {
			fds[i] = def[i]["label"];
			total++;
		}
	} else {
		for (var i=0; i < 10; i++) {
			fds["F" + i] = "F" + i;
			total++;
		}
	}
	fds["total"] = total;
	return fds;
}

function show(req, res, cond) {
	var uData = req.u.data;
	delete uData["Tid"];
	delete uData["Vid"];
	var condition = {};
	for (var i in fnames) {
		if (i in uData) {
			condition[i] = uData[i];
		}
	}
	condition["Rid"] = uData["Rid"];
	mongo.findOne("T", "V", null, condition, function (recorder) {
		if (recorder.code != 200) {
			log.error(recorder.message);
			__show(res, recorder);
		} else {
			__show(res, recorder);
		}
	});
}
function copy(req, res) {
	var uData = req.u.data;
	var condition = {};
	condition["Rid"] = uData["Rid"];
	mongo.findOne("T", "V", null, condition, function (recorder) {
		if ("Title" in uData) {
			var ids = __getTVid(uData["Tid"], "");
			uData["Tid"] = ids["Tid"];
			uData["Vid"] = ids["Vid"];
			uData['URL'] = (uData['URL'] || "").toLowerCase();
			var cond = {'$or' : [{'Title': uData['Title']}, {'URL': uData['URL']}]};
			uData = __fillDefault(uData);
			if (recorder.code == 200) {
				for (var i in recorder.data) {
					if (i in uData) continue;
					uData[i] = recorder.data[i];
				}
			}
			uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "applications"/g, '"otype": "applications", "options": ' + options.app);
			uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "users"/g, '"otype": "users", "options": ' + options.users);
			mongo.newOne("T", "V", cond, uData, function (recorder) {
				if ((recorder.code) != 200 || recorder.num < 1) {
					log.error(recorder.message);
					uData["dl"] = uData["dl"] == "layout" ? "" : "layout" ;
					recorder.data = uData;
					recorder.title = "";
					recorder.action = "/T/copy";
					return __new(res, recorder);
				} else {
					svUpdateIDDefine(uData)
					res.redirect("/T/update?Rid=" + recorder.data["Rid"] + "&dl=layout");		
					refreshAppList(req, res);
				}
			});
		} else {
			if (recorder.code != 200) {
				log.error(recorder.message);
				res.end(recorder.message + util.inspect(recorder.error));
			} else {
				recorder.title = "";
				recorder.action = "/T/copy";
				recorder.data["Vid"] = "auto";
				recorder.data["Rid"] = "auto";
				return __new(res, recorder);
			}
		}
	});
}
function modify(req, res) {
	var uData = req.u.data;
	var condition = {};
	condition["Rid"] = uData["Rid"];
	
	// remove wrong data brought by oneclick update at Tangrammy page.
	if (uData["Tid"] == "t") {
		delete uData["Tid"];
		delete uData["Vid"];
	}
	
	if ("Title" in uData || "Description" in uData || "Fields" in uData || "FieldsLE" in uData) {
		if ("Fields" in uData) {
			uData = __fillDefault(uData);
			// TODO tmp changes for old data
			/*
			if ("LayoutE" in uData && uData["LayoutE"] != "") {
				uData["LNew"] = "";
				uData["LEdit"] = "";
				uData["LShow"] = "";
			}
			*/
			uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "applications"/g, '"otype": "applications", "options": ' + options.app);
			uData["Fields"] = (uData["Fields"] + "").replace(/"otype": "users"/g, '"otype": "users", "options": ' + options.users);
		}
		mongo.update("T", "V", condition, uData, function (recorder) {
			if ((recorder.code) != 200 || recorder.num < 1) {
				log.error(recorder.message);
				recorder.data = uData;
				
				if (uData["dl"] == "layout") {
					recorder.title = recorder.data["Title"] + " Defines";
				} else {
					recorder.title = recorder.data["Title"] + " Layouts";
				}
				recorder.data["dl"] = uData["dl"] == "layout" ? "" : "layout" ;
				recorder.action = "/T/update";
				return __new(res, recorder);
			} else {
				if ("Fields" in uData) {
					svUpdateIDDefine(uData);
				}
				if (uData["dl"] == "layout") {
					res.redirect("/T/update?Rid=" + uData["Rid"] + "&dl=layout");
				} else {
					res.redirect("/T/show?Rid=" + uData["Rid"]);
				}
				refreshAppList(req, res);
				return;
				/*
				mongo.findOne("T", "V", null, condition, function (recorder) {
					if (recorder.code != 200) {
						recorder.data = uData;
						recorder.code = 200;
					}
					if (uData["dl"] == "layout") {
						recorder.title = recorder.data["Title"] + " Layouts";
						recorder.action = "/T/update";
						recorder.data["dl"] = uData["dl"];
						__new(res, recorder);
					} else {
						recorder.title = recorder.data["Title"] + " Details";
						__show(res, recorder);
					}
				});
				*/
			}
		});
	} else {
		mongo.findOne("T", "V", null, condition, function (recorder) {
			if (recorder.code != 200) {
				log.error(recorder.message);
				res.end(recorder.message + util.inspect(recorder.error));
			} else {
				recorder.action = "/T/update";
				if ("dl" in uData) {
					recorder.data["dl"] = uData["dl"];
					recorder.title = recorder.data["Title"] + " Layouts";
				} else {
					recorder.title = recorder.data["Title"] + " Defines";
				}
				// TODO tmp changes for old data
				if (!recorder.data["LayoutL"]) {
					var layout = tmpconvert(recorder.data["LNew"]);
					recorder.data["TitleLN"] = layout["Title"];
					recorder.data["LayoutN"] = layout["Layout"];
					recorder.data["ActionLN"] = layout["Action"];
					recorder.data["FieldsLN"] = layout["Fields"];
					
					layout = tmpconvert(recorder.data["LEdit"]);
					recorder.data["TitleLE"] = layout["Title"];
					recorder.data["LayoutE"] = layout["Layout"];
					recorder.data["ActionLE"] = layout["Action"];
					recorder.data["FieldsLE"] = layout["Fields"];
					
					layout = tmpconvert(recorder.data["LShow"]);
					recorder.data["TitleLS"] = layout["Title"];
					recorder.data["LayoutS"] = layout["Layout"];
					recorder.data["ActionLS"] = layout["Action"];
					recorder.data["FieldsLS"] = layout["Fields"];
					
					layout = tmpconvertlist(recorder.data["LList"]);
					recorder.data["LayoutL"] = layout["Layout"];
					recorder.data["FieldsLL"] = layout["Fields"];
					if (recorder.data["LayoutE"] == "") {
						var lout = "";
						var tds = "";
						var fds = (recorder.data["Fields"] + "").toJSON();
						for (var j in fds) {
							lout += "<div class='col-md-12' field='" + j + "'>" + fds[j]["label"] + "(" + j + ")</div>\n";
							tds += "<td field='" + j + "'>" + fds[j]["label"] + "(" + j + ")</td>\n";
						}
						recorder.data["LayoutN"] = lout;
						recorder.data["LayoutE"] = lout;
						recorder.data["LayoutS"] = lout;
						recorder.data["LayoutL"] = recorder.data["LayoutL"].replace("<tr>\n", "<tr>\n" + tds);						
					}
					var act = "New";
					if (!recorder.data[act] || recorder.data[act] == "") {
						recorder.data[act] = '<div class="col-md-0"><a class="btn btn-link" href="javascript:;" name="new" style="min-width:80px;"><b><img src="/img/add.png">New Data</b></a></div>'
					} else {
						layout = recorder.data[act].toJSON();
						recorder.data[act] = '<div class="col-md-0"><a class="btn btn-link" href="javascript:;" name="new" style="min-width:80px;">' + (layout["icon"] ? '<img src="/img/' + layout["icon"] + '">' : '') + '' + (layout["label"] || "") + '</a></div>'
					}
					recorder.data["Filter"] = (recorder.data["Filter"] || "").replace(/<\/a>/gi, "</a>\n").replace(/(.+<a )([^>]+>.+<\/a>)(.+)/gi, "<a class='filter' $2").replace(/<[\/]?ul[^>]*>\r?\n?/gi, "");
				}
				
				return __new(res, recorder);
			}
		});
	}
}

// TODO tmp changes for old data
function tmpconvertlist(data) {
	var json = {"Title": "", "Layout": "", "Fields": ""};
	
	var tds = (data + "").toJSON(); 
	if (typeof tds == "string") {
		return json;		
	}
	json["Title"] = tds["Title"] || "";
	delete tds["Title"];
	
	function _convertListOne(j, data) {
		if ((j + "").match(/f[0-9][0-9]?/gi) || j == "Update" || j == "UpdateR" || j == "Create" || j == "CreateR") {
			json["Fields"] += (json["Fields"].length > 0 ? ',':'') + '"' + j + '": {';
			var label = "";
			if (data[j]["label"] && data[j]["label"].length > 0) {
				label = data[j]["label"];
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"displayas": "' + data[j]["label"] + '"';
			}
			if (data[j]["Title"] && data[j]["Title"].length > 0) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"title": "' + data[j]["Title"] + '"';
			}
			if ("readonly" in data[j]) {
				label = "[ReadOnly] " + label;
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"readonly": true';
			} 
			if ("clickable" in data[j]) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"clickable": true';
			} 
			if ("show" in data[j]) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"iconly": true';
			} 
			
			var wid = "";
			if (data[j]["width"] && (data[j]["width"].contains("col-") || data[j]["width"].contains("wid"))) {
				wid = "class=\"" + data[j]["width"] + "\" ";
			}
			if (data[j]["colspan"]) {
				wid += "colspan=" + data[j]["colspan"] + " ";
			}
			json["Layout"] += "<td " + wid + " field='" + j + "'>" + label + "(" + j + ")</td>\n";
			json["Fields"] += '}';
		} 
		if (j.match(/(submit|list|new|copy|edit|show|remove)/gi)) {
			var css = data[j]["css"] || "";
			if (css.contains("btn-")) {
				css = css.replace("btn ", "");
			}
			if (data[j]["type"] == "link") {
				css = "btn-link";
			}
			var img = "";
			if ((data[j]["icon"] || "") != "") {
				img = '<img src="/img/' + data[j]["icon"] + '">';
			}
			
			var wid = "";
			if (data[j]["width"] && (data[j]["width"].contains("col-") || data[j]["width"].contains("wid"))) {
				wid = "class=\"" + data[j]["width"] + "\" ";
			}
			if (data[j]["colspan"]) {
				wid += "colspan=" + data[j]["colspan"] + " ";
			}
			json["Layout"] += '<td ' + wid + 'field="' + j.toLowerCase() + '" LSAction="' + j.toLowerCase() + '"><LSAction class="btn-group-xs"><a class="btn ' + css + '" href="javascript:;" name="' + j.toLowerCase() + '" title="">' + img + data[j]["label"] + '</a></LSAction></td>\n';

			json["Fields"] += (json["Fields"].length > 0 ? ',':'') + '"' + j + '": {';
			if (data[j]["Title"] && data[j]["Title"].length > 0) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"title": "' + data[j]["Title"] + '"';
			}
			json["Fields"] += '}';
		}
		if (j.match(/diy.*/gi)) {
			var link = (new Buffer(data[j]["label"], 'base64')).toString();
			link = ("<a " + link.mid("<a ", link.lastIndexOf("</a>")) + "</a>").replace(/[\r\n]/g, "").replace(/<\/a>/g, "</a>\n").replace(/(.*)(<a .+<\/a>)(.*)/gi, '$2');
			link = link.replace(/(<%=|%>)/g, '');
			link = link.replace(/(.*)(url=)(["'])([^'"]+json.)([^'"]+)(["'])(.+>.*)/g, "$1val=$3$5$3$7");
			link = link.replace(/(.*)(href=["'][^'"]+["'])(>.*)/g, "$1val=''$3");
			link = link.replace(/.+class="caret".+/g, '&#20;<span class="caret" val="caret"></span>');
			link = link.replace(/<a /g, '<LSAction class="btn-group-xs"><a ').replace(/\/a>/g, '/a></LSAction>');
			
			var wid = "";
			if (data[j]["width"] && (data[j]["width"].contains("col-") || data[j]["width"].contains("wid"))) {
				wid = "class=\"" + data[j]["width"] + "\" ";
			}
			if (data[j]["colspan"]) {
				wid += "colspan=" + data[j]["colspan"] + " ";
			}
			var url = ' url="' + link.mid('href="', '"') + '"';
			json["Layout"] += '<td ' + wid + ' field="diy" LSAction="' + j + '">' + link + '</td>\n';
			json["Fields"] += (json["Fields"].length > 0 ? ',':'') + '"' + "diy" + '": {';
			if (data[j]["Title"] && data[j]["Title"].length > 0) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"title": "' + data[j]["Title"] + '"';
			}
			json["Fields"] += '}'
		}
		if (j == "TR") {
			json["Layout"] += '</tr><tr>';
		}
	}
	for (var i in tds) {
		if (i.startsWith("Section")) {
			json["Layout"] += "<td>";
			
			/*
			if ("Title" in tds[i]) {
				json["Layout"] += "	<legend>" + tds[i]["Title"] + "</legend>\n";
				delete tds[i]["Title"];
			}
			*/
			for (var j in tds[i]) {
				_convertListOne(j, tds[i]);
			}
			json["Layout"] += "</td>\n";
		} else if (i.startsWith("Action")) {
			for (var j in tds[i]) {
				_convertListOne(j, tds[i]);
			}
		} else {
			_convertListOne(i, tds);
		}
	}
	var ends = "<td></td>\n";
	if (json["Layout"].endsWith(ends)) {
		json["Layout"] = json["Layout"].mid(0, json["Layout"].length - ends.length);
	}
	json["Layout"] = "<table class=‘table’><tr>\n" + json["Layout"].replace('name="remove"', 'name="delete"') + "</tr></table>";
	return json;
}
// TODO tmp changes for old data
function tmpconvert(data) {
	var json = {"Title": "", "Layout": "", "Action": "", "Fields": ""};
	
	var tds = (data + "").toJSON(); 
	if (!tds["Title"]) {
		return json;		
	}
	json["Title"] = tds["Title"] || "";
	delete tds["Title"];
	
	function _convertOne(j, data) {
		if ((j + "").match(/f[0-9][0-9]?/gi) || j == "Update" || j == "UpdateR" || j == "Create" || j == "CreateR") {
			json["Fields"] += (json["Fields"].length > 0 ? ',':'') + '"' + j + '": {';
			var label = "";
			if (data[j]["label"] && data[j]["label"].length > 0) {
				label = data[j]["label"];
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"displayas": "' + data[j]["label"] + '"';
			}
			if ("readonly" in data[j]) {
				label = "[ReadOnly] " + label;
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"readonly": true';
			} 
			if ("clickable" in data[j]) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"clickable": true';
			} 
			if ("show" in data[j]) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"iconly": true';
			} 
			if (data[j]["Title"] && data[j]["Title"].length > 0) {
				json["Fields"] += (json["Fields"].endsWith("{") ? '':',') + '"title": "' + data[j]["Title"] + '"';
			}
			
			if (data[j]["width"] && data[j]["width"].contains("col-")) {
				json["Layout"] += "<div class='" + data[j]["width"] + "' field='" + j + "'>" + label + "(" + j + ")</div>\n";
			} else {
				json["Layout"] += "<div class='col-md-12' field='" + j + "'>" + label + "(" + j + ")</div>\n";
			}
			json["Fields"] += '}';
		} 
		if (j.match(/(submit|list|new|copy|edit|show|remove)/gi)) {
			var css = data[j]["css"];
			if (css.contains("btn-")) {
				css = css.replace("btn ", "");
			}
			if (data[j]["type"] == "link") {
				css = "btn-link";
			}
			var img = "";
			if ((data[j]["icon"] || "") != "") {
				img = '<img src="/img/' + data[j]["icon"] + '">';
			}
			json["Action"] += '<div class="col-md-0"><a class="btn ' + css + '" href="javascript:;" name="' + j.toLowerCase() + '" style="min-width:80px;" title="">' + img + data[j]["label"] + '</a></div>\n';
		}
		if (j.match(/diy.*/gi)) {
			var link = (new Buffer(data[j]["label"], 'base64')).toString();
			link = link.replace('<%= data["Rid"] %>', 'RID');
			var label = link.mid('>', '<');
			var url = ' url="' + link.mid('href="', '"') + '"';
			json["Action"] += '<div class="col-md-0"><a class="btn btn-link" href="javascript:;" name="diy"' + url + ' style="min-width:80px;" title="">' + label + '</a></div>\n';
		}
	}
	for (var i in tds) {
		'<div class="col-md-0"><a class="btn btn-danger" href="javascript:;" name="submit" style="min-width:80px;" title=""><img src="/img/add.png">New Action</a></div>'
		
		if (i.startsWith("Section")) {
			json["Layout"] += "<div class='col-md-12'>";
			
			if ("Title" in tds[i]) {
				json["Layout"] += "	<legend>" + tds[i]["Title"] + "</legend>\n";
				delete tds[i]["Title"];
			}
			
			for (var j in tds[i]) {
				_convertOne(j, tds[i]);
			}
			json["Layout"] += "</div>\n";
		} else if (i.startsWith("Action")) {
			for (var j in tds[i]) {
				_convertOne(j, tds[i]);
			}
		} else {
			_convertOne(i, tds);
		}
	}
	var ends = "<div class='col-md-12'></div>\n";
	if (json["Layout"].endsWith(ends)) {
		json["Layout"] = json["Layout"].mid(0, json["Layout"].length - ends.length);
	}
	json["Layout"] = json["Layout"].replace('name="remove"', 'name="delete"');
	return json;
}
function remove(req, res) {
	var uData = req.u.data;
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
/*
function search(req, res) {
	var uData = req.u.data;
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
*/

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
		if (lst[it]["Status"] == "disabled" || lst[it]["Status"] == "hidden") {
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

	items += '<% if (request.u.apps && request.u.apps.contains("*") && request.admin) { %>\r\n	<div class="col-md-3" style="border: 1px solid #ccc;">\r\n' + 
			'		<h2><a href="/tangrammy">Tangrammy</a></h2>\r\n' + 
			'		<div style="height: 60px; overflow: hidden;"><p>Define/edit/rebuild applications.</p></div>\r\n' + 
			'		<p class="text-right"><a href="/tangrammy" role="button">Details »</a></p>\r\n' + 
			'	</div>\r\n<% } %>\r\n';

	items += '</div></div>\r\n';
	cols = 0;
	for (var it = lst.length - 1; it > -1; it--) {
		// items for Tangrammy page
		defines += '<% if (!request.u.apps || request.u.apps.contains("*") || request.u.apps.contains("' + lst[it]["Tid"] + '/' + lst[it]["Vid"] + '")) { %>\r\n	<div class="list-app">\r\n' + 						
'		<h3>' + (lst[it]["Status"] == "disabled" ? "<small>[Disabled]</small>" : (lst[it]["Status"] == "hidden" ? "<small>[Hidden]</small>" : "")) + '<span name="blurupdate" url="/T/update?Rid=' + lst[it]["Rid"] + '&Title=" contenteditable="true" orginal="Title' + lst[it]["Rid"] + '">' + lst[it]["Title"] + '</span> <small>(' + lst[it]["Tid"] + '.' + lst[it]["Vid"] + ')</small> </h3>\r\n' + 
'		<p name="Title' + lst[it]["Rid"] + '" class="hide" >' + lst[it]["Title"] + '</p>\r\n' + 
'		<small><a href="/' + lst[it]["URL"] + '/list">http://~/' + lst[it]["URL"] + '/list </a> </small> <br /> \r\n' + 
'		<p name="blurupdate" url="/T/update?Rid=' + lst[it]["Rid"] + '&Description=" contenteditable="true" orginal="Description' + lst[it]["Rid"] + '">' + lst[it]["Description"] + '</p>\r\n' + 
'		<p name="Description' + lst[it]["Rid"] + '" class="hide" >' + lst[it]["Description"] + '</p>\r\n' + 
'		<div class="text-right">\r\n' + 
'			<a class="btn btn-xs" name="onereload" href="javascript:;" url="/T/create?Rid=' + lst[it]["Rid"] + '&format=json" title="Rebuild application[' + lst[it]["Title"] + '] to active changes">Rebuild</a>\r\n' + 
'			<a href="/T/show?Rid=' + lst[it]["Rid"] + '" title="View define detail of application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/detail.png"></a>\r\n' + 
'			<a href="/T/update?Rid=' + lst[it]["Rid"] + '" title="Edit Define"><img class="icon15" src="/img/edit.png"></a>\r\n' + 
'			<a href="/T/update?Rid=' + lst[it]["Rid"] + '&dl=layout" title="Edit Layout"><img class="icon15" src="/img/edit2.png"></a>\r\n' + 
'			<a href="/T/copy?Rid=' + lst[it]["Rid"] + '" title="Create a new one based on application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/copy.png"></a>\r\n' + 
(lst[it]["Tid"].match(/TF\d/gi) ? '' : '			<a name="remove" href="javascript:;" url="/T/remove?Rid=' + lst[it]["Rid"] + '" title="Remove application[' + lst[it]["Title"] + ']"><img class="icon15" src="/img/remove.png"></a>\r\n') + 
'		</div>\r\n	</div>\r\n<% } %>\r\n';

		if ((++cols) > 3) {
			cols = 0;
		}
	}

	defines += '	<div class="list-app">\r\n' + 	 						
'		<h3><small>Rebuild: </small><a name="onereload" href="javascript:;" url="/T/create?format=json">All Applications</a></h3><br />\r\n' + 
'		<p class="text-center"><a href="/T/new" class="btn btn-lg btn-default" title="Add New Application"><img src="/img/add.png"> Application</a></p>\r\n' + 
'		<div class="text-right"><a href="https://github.com/ItMan70s/Tangrammy/">View TangramMy on GitHub</a></div>\r\n' + 
			'</div>\r\n';
	defines += '</div>\r\n';
var hed = '	<div class="well">\r\n' + 
'		<h2 style="margin-top: 0px;">Tangrammy</h2>\r\n' + 
'		<p>The tangrammy is a system enable DIY your own services. Its idea comes from <a target="_blank" href="http://en.wikipedia.org/wiki/Tangram"><img style="height: 20px;" src="/img/favicon.ico">tangram</a>, and is implemented by NodeJS, Bootstrap, jQuery.\r\n ' + 
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
hed = '	<div class="well">\r\n' + 
(settings.home.welcome ? '		<h2 style="margin-top: 0px;">' + settings.home.welcome + '</h2>\r\n' : '') + 
'		<p>' + settings.home.content + '</p>\r\n' + 
'</div>\r\n';
	fs.writeFile(vpath + 'welcome.ejs', template.replace("TOP_LINKS", links.replace("<li><a href='/'", "<li class='active'><a href='/'")).replace("FIELDS", hed + items).replace("HEAD_TITLE", settings.home.name), function(err){ if (err) log.error(err); });

	// T show
	var names = ["./service/admin/T_show.ejs", "./service/admin/T_new.ejs"];
	for (var i in names) {
		var contents = fs.readFileSync(names[i], {encoding: 'utf8'});
		if (contents.length > 100) {
			fs.writeFile(names[i] + ".bak", contents, function(err){ if (err) log.error(err); });
		}
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
	
	var uData = req.u.data;
	var condition = {};
	if ("Rid" in uData) {
		condition["Rid"] = uData["Rid"];
		createOne(req, res, condition);
	} else {
		mongo.list("T", "V", null, condition, "", {"sort": {"Title": -1}}, function (recorder) {
			var lst = recorder.data;
			for (var it = lst.length - 1; it > -1; it--) {
				if (lst[it]["Status"] == "disabled") {
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
		fdata.data = (recorder.data["Fields"] + "").toJSON();
		//.replace('"otype": "applications"', '"options": ' + options.app)
		recorder.data = __fillDefault(recorder.data);
		recorder.data["CheckFuncs"] = "" + util.inspect(field.toCheckFuncs(recorder.data["Fields"]));

		fdata["CheckFuncs"] = (recorder.data["CheckFuncs"] + "").toJSON();
		
		fdata["LNew"] = (recorder.data["LEdit"] + "").toJSON();
		fdata["LEdit"] = (recorder.data["LNew"] + "").toJSON();
		fdata["LShow"] = (recorder.data["LShow"] + "").toJSON();
		fdata["LList"] = (recorder.data["LList"] + "").toJSON();
		/*
		fdata["New"] = (recorder.data["New"] + "").toJSON();
		fdata["Copy"] = (recorder.data["Copy"] + "").toJSON();
		fdata["Show"] = (recorder.data["Show"] + "").toJSON();
		fdata["Edit"] = (recorder.data["Edit"] + "").toJSON();
		fdata["Remove"] = (recorder.data["Remove"] + "").toJSON();
		*/
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
		fdata["Layout"] = recorder.data["LayoutN"];
		fdata["TitleL"] = recorder.data["TitleLN"];
		fdata["ActionL"] = recorder.data["ActionLN"];
		fdata["FieldsL"] = recorder.data["FieldsLN"];
		fdata.url = recorder.data["URL"];
		fdata.action = "/" + recorder.data["URL"] + "/new";
		fs.writeFile(name, data.replace("FIELDS", field.toEdit(fdata, 4)).replace('<%= data["Rid"] %>', ''), function(err){ if (err) log.error(err); });
		
		fdata["Layout"] = recorder.data["LayoutE"];
		fdata["TitleL"] = recorder.data["TitleLE"];
		fdata["ActionL"] = recorder.data["ActionLE"];
		fdata["FieldsL"] = recorder.data["FieldsLE"];
		fdata.title = "Edit " + recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"] + "/update";
		name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'edit.ejs';
		fs.writeFile(name, data.replace("FIELDS", field.toEdit(fdata, 4)), function(err){ if (err) log.error(err); });
		
		fdata["Layout"] = recorder.data["LayoutS"];
		fdata["TitleL"] = recorder.data["TitleLS"];
		fdata["ActionL"] = recorder.data["ActionLS"];
		fdata["FieldsL"] = recorder.data["FieldsLS"];
		fdata.title = "SHOW " + recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"];
		name = vpath + recorder.data["Tid"] + "X" + recorder.data["Vid"] + 'show.ejs';
		fs.writeFile(name, data.replace("FIELDS", field.toShow(fdata, 4)), function(err){ if (err) log.error(err); });
		
		fdata.title = recorder.data["Title"];
		fdata.action = "/" + recorder.data["URL"];
		fdata["Layout"] = recorder.data["LayoutL"];
		fdata["ActionL"] = recorder.data["ActionLL"];
		fdata["FieldsL"] = recorder.data["FieldsLL"];
		fdata["Group"] = recorder.data["Group"];
		fdata["Pagging"] = recorder.data["Pagging"];
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
	if (options.app.length < 1) {
		options.app += '{"caption": "All", "value": "*"}';
		mongo.list("T", "V", null, {}, "Tid Vid Rid Title Status URL", {"sort": {"Title": -1}}, function (recorder) {
			var lst = recorder.data;
			for (var it = lst.length - 1; it > -1; it--) {
				if (lst[it]["Status"] == "disabled") {
					continue; 
				}
				options.app += ', {"caption": "' + (lst[it]["Status"] == "hidden" ? "[hidden]" : "") + lst[it]["Title"] + '", "value": "' + lst[it]["Tid"] + '/' + lst[it]["Vid"] + '"}';
			}
			options.app = "[" + options.app + "]";
		});
	}
	if (options.users.length < 1) {
		options.users += '{"caption": "All", "value": "*"}';
		mongo.list("TF1", "V1", null, {"F4": "1"}, "Rid F0 F1", {}, function (recorder) {
			var lst = recorder.data;
			for (var it = lst.length - 1; it > -1; it--) {
				options.users += ', {"caption": "' + lst[it]["F0"] + ' (' + lst[it]["F1"] + ')", "value": "' + lst[it]["Rid"] + ':' + lst[it]["F0"] + '"}';
			}
			options.users = "[" + options.users + "]";
		});
	}
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
		default:
			log.warn("ssid[" + req.u.ssid + "] no expected URL: " + req.url + ". Client information: " + req.info());
			return A.welcome(req, res, "", true);
		break
	}
	var warning = "<B>404 EVENT!</B><br/>Tangrammy made a lot of applications except " + tid + ". <br/>Google tangrammy then DIY one _(._.)_";
	A.welcome(req, res, warning);
	log.warn("ssid[" + req.u.ssid + "] " + " access invalidated URL by " + req.info().replace(/[\r\n]+/g, " "));
}

module.exports = {
	process: process,
};
