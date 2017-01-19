/*
  F1: {type: String, form: text, label: 'name', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 0, min: 0, max: 0, options:['en','cn'], default: 'en', regExp: "", exist: "return true", placeholder: 'hint message', msg: ''},
cols, rows, size, multiple
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
	*/
	
function getDefault(json) {
	var data = {}
	for (var i in json) {
		data[i] = json[i]["default"] || "";
	}
	return data;
}
/*
button checkbox date datetime datetime-local email file hidden image 
month number password radio range reset submit text time url week 
*/

var foptions = {
"hidden": [],
"id": [],
"text": ["maxLength", "minLength", "length", "max", "min", "required", "unique", "placeholder"],
"textarea": ["maxLength", "minLength", "length", "cols", "rows", "required", "unique", "placeholder"],
"richtext": ["rows", "placeholder"],
"password": ["maxLength", "minLength", "length", "max", "min", "required", "placeholder"],
"number": ["maxLength", "minLength", "length", "max", "min", "required", "unique", "placeholder"],
"radio": ["required"],
"checkbox": ["required"],
"select": ["size", "multiple", "required"],
"date": ["format", "required", "placeholder"],
"time": ["format", "required", "placeholder"],
"datetime": ["format", "required", "size", "unique", "placeholder"],
}
function toList(json) {
	var data = json.data;
	var trs = json.Layout || "";
	var head = "";
	var options = "";
	if (trs.length != "") {
		trs = trs.replace("<tbody>", "").replace("</tbody>", "");
		trs = trs.replace(/[\r\n]+/gi, "").replace(/(.*<table [^>]*>)(.+)(<\/table>.*)/gi, "$2").replace(/ field=/gi, " Fid=");
		head = trs.mid("<tr>", "</tr>").replace(/<td /gi, "<th ").replace(/<\/td>/gi, "</th>\n");
		var sub = trs.contains("</tr>") ? trs.mid("</tr>").replace(/'/gi, '"') : "";
		trs = "<tr Rid='<%= data[item][\"Rid\"] %>'" + trs.mid(3).replace(/<\/td>/gi, "</td>\n").replace(/<tr>/gi, "<tr Rid='<%= data[item][\"Rid\"] %>' class='hidden' sub='true' >") + "\n";
		trs = trs.split("<td ");
		var def = (json.FieldsL || "").toJSON();
		
		if (!("Update" in data)) data["Update"] = {"type": "String", "form": "datetime", "label": "Update", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"};
		if (!("Create" in data)) data["Create"] = {"type": "String", "form": "datetime", "label": "Create", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"};
		if (!("UpdateR" in data)) data["UpdateR"] = {"type": "String", "form": "text", "label": "Updater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"};
		if (!("CreateR" in data)) data["CreateR"] = {"type": "String", "form": "text", "label": "Creater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"};

		head = head.replace(/"/gi, "'").replace(/ LSAction='.+'/gi, "");
		head = head.replace(/(.*<th [^>]*>)(.*)(<\/th>.*)/gi, "$1$3");
			
		for (var j = 1; j < trs.length; j++) {
			var i = trs[j].mid(0, "</td>").replace(/(.*Fid=['"])([^'"]+)(['"].*)/gi, "$2");
			if (!i || i == "") continue;
			
			var label = ((def[i] && "title" in def[i]) ? def[i]["title"] : (data[i]? data[i]["label"] : ""));
			var pos = head.indexOf("Fid='" + i + "'");
			if (pos > 0) {
				var th = head.mid(head.lastIndexOf("<", pos), head.indexOf("<", pos));
				var nth = th;
				if (data[i] && data[i]["form"] == "number") {
					if (nth.contains("class=")) {
						nth = nth.replace("class='", "class='number ");
					} else {
						nth = nth.replace("<th", "<th class='number'");
					}
				}
				head = head.replace(th, nth + label);
			}
			
			if (!(i in data)) {
				var typ = i.toLowerCase();
				var href = 'href="/' + json.url;
				trs[j] = trs[j].replace(/ (fid|lsaction|href)=['"][^'"]+['"]/gi, "").replace(/ name=['"](list|new|edit|copy|show|remove)['"]/gi, "").replace(/<.?lsaction[^>]*>/gi, "");
				
				switch(typ) {
					case "list":
						href += '/list"';
						break;
					case "new":
						href += '/new"';
						break;
					case "edit":
						href += '/update?Rid=<%= data[item]["Rid"] %>"';
						break;
					case "copy":
						href += '/copy?Rid=<%= data[item]["Rid"] %>"';
						break;
					case "show":
						href += '/show?Rid=<%= data[item]["Rid"] %>"';
						break;
					case "remove":
						href = 'name="remove" href="javascript:;" url="/' + json.url + '/remove?Rid=<%= data[item]["Rid"] %>"';
						break;
					case "diy":
						var links = trs[j].split(/<span [^>]*val="caret"[^>]*>.*<\/span>/gi);
						if (links.length > 1) {
							links[1] = links[1].replace(/<a /gi, "<li><a ").replace(/<\/a>/gi, "</a></li>\n");
							var lst = links[1].lastIndexOf("</li>");
							links[1] = '<a class="btn btn-default dropdown-toggle" data-toggle="dropdown">&#20;<span class="caret"></span></a>\n' +
										'<ul class="dropdown-menu" role="menu">\n' + links[1].mid(0, lst) + "</li></ul>\n</div>" + links[1].mid(lst + 5);
						}
						links[0] = links[0].replace(">", "><div class='btn-group btn-group-xs'>");
						trs[j] = links.join("\n").replace(/<\/a>/gi, "</a>\n");
						// val=""  => more to edit page
						trs[j] = trs[j].replace(/(.*)( val=)(""|'')(.*)/gi, "$1" + ' href="/' + json.url + '/update?Rid=<%= data[item]["Rid"] %>"' + "$4");
						trs[j] = trs[j].replace(/(.*)( val=)("|')(.*)/gi, "$1" + ' url=$3/' + json.url + '/update?Rid=<%= data[item]["Rid"] %>&format=json&' + "$4");
						break;
					default:
						// log.warn("Unexpected action type: " + typ);
						typ = "diy";
						break;
				}
				if (typ != "diy") {
					trs[j] = trs[j].replace('<a ', '<a ' + href + ' ').replace(/ class=['"]btn btn-link['"]/gi, "");
				}
				continue;
			}
			
			// TODO class ellipsis
			
			var val = "";
			switch (data[i].form.toLowerCase()) {
			case "hidden":
				val += "-";
			break;
			case "id":
			case "text":
			case "number":
			case "textarea":
				if (hasDefine(data[i], "htm")) {
					val += "<%- (data[item][\"" + i + "\"] || \"\").replace(/(\\r\\n)|(\\r)|(\\n)/g, \"<br />\") %>";
				} else {
					val += "<%= (\"" + i + "\" in data[item]) ? data[item][\"" + i + "\"] : \"\" %>";
				}
				// TODO number class
			break;
			case "richtext":
				val += "<%- (\"" + i + "\" in data[item]) ? data[item][\"" + i + "\"] : \"\" %>";
			break;
			case "password":
				val += "******";
			break;
			case "radio":
			case "checkbox":
			case "select":
			case "mulselect":
				var iconly = (i in def && "iconly" in def[i]) ? def[i]["iconly"] : false;
				var textonly = (!iconly && i in def && "textonly" in def[i]) ? def[i]["textonly"] : false;
				
				options += "<% function get" + i + "(val) { \n";
				options += "  var opts = \"\"; \n  val = \",\" + (val || \"\") + \",\"; \n";
				for (var k = 0; k < data[i].options.length; k++) {
					var opt = data[i].options[k];
					if (opt.caption == undefined) {
						opt.caption = opt.value;
					}
					options += "  if (val.contains( \",\" + \"" + opt.value + "\" + \",\")) { ";
					options += "   opts += \"" + (opt["css"] ? "<span class='" + opt["css"] + "'>":"");
					var tmp = (opt.icon ? "<img class='icon15' src='" + opt.icon + "' alt='" + opt.caption + "' title='" + opt.caption + "'> " : "") + opt.caption;
					if (iconly) {
						if (tmp.contains("<img ")) {
							tmp = "<img " + tmp.mid("<img ", ">") + ">";
						} else {
							tmp = "";
						}
					}
					if (textonly) {
						tmp = tmp.replace(/<img [^>]+>/gi, "");
					}
					options += tmp + (opt["css"] ? "</span>":"") + " \"; } \n ";
					// options += iconly ?  + (!iconly ? opt.caption : "") + (opt["css"] ? "</span>":"") + " \"; } \n ";
					//options += (!iconly ? opt.caption : "") + (opt["css"] ? "</span>":"") + " \"; } \n ";
				}
				options += "  return opts; } %>\n";
				val += "<%- get" + i + "(data[item][\"" + i + "\"]) %>";
			break;
			case "img":
				val += "<% var " + i + "data = data[item][\"" + i + "\"] || \"\"; if (" + i + "data.length > 0) { var jsn = " + i + "data.toJSON(); %>";
				val += "<img src='<%= jsn[\"url\"] %>' /> <% } %>";
			break;
			case "video":
				//TODO		
				val += "-";
			break;
			case "file":
				val += "<% var " + i + "data = data[item][\"" + i + "\"] || \"\"; if (" + i + "data.length > 0) { var jsn = " + i + "data.toJSON(); %>";
				val += "<a href='<%= jsn[\"url\"] %>'><%= jsn[\"realname\"] %></a><% } %> ";
			break;
			case "reservation":
				val += "<%- data[item][\"Reservation\"] || '' %>";
			break;
			case "date":
			case "time":
			case "datetime":
				val += "<%" + (hasDefine(data[i], "htm") ? "-":"=") + " (data[item][\"" + i + "\"] || \"\") %>";
			break;
			default:
			break;
			}
			
			if (i in def) {
				if (def[i]["clickable"]) {
					val = ___showLink("show", json["Show"], 'data[item][\"Rid\"]', json.url).mid(0, "\">") + "\" title=\"Click for detail information\">" + val + "</a>";
				}
			}
			if (sub.contains('Fid="' + i + '"')) {
				val = (label == "" ? "": "<label class='pull-left'>" + label + ":</label>") + "<span class='pull-left spanval'>" + val + "</span>";
			}
			trs[j] = trs[j].replace(new RegExp("(.*Fid=['\"]" + i + "['\"])(.*>)(.*)(</td>)", "ig"), "$1" + ' val="<%= getShortVal(data[item]["' + i + '"]) %>" $2' + val + "$4");
		}
		trs = trs.join("<td ");
	}
	

		
	var func = "";
	var linkAdd = ((json.raw["New"] || "") + "").replace(/(name=['"]new['"]|href=['"][^'"]+['"])/gi, 'href="/' + json.url + '/new"').replace(/(.*)(<a .*<\/a>)(.*)/gi, "$2"); 
	var html = "<h1>" + json.title + "  <small>" + linkAdd + "</small>";
	html += "<div class='btn-group pull-right'>\n";
	html += "<a class='btn btn-lg btn-link glyphicon glyphicon-save dropdown-toggle' data-toggle='dropdown' ></a>\n";
	html += "<ul class='dropdown-menu' role='menu'>\n";
	html += "<li><a href='#' download='.csv' title='Save current page as csv file' >Save as CSV file</a></li>\n";
	html += "<li><a href='#' download='.xls' title='Save current page as Excel file' >Save as Excel file</a></li>\n";
	html += "</ul>\n";
	html += "<a class='pull-right btn btn-lg green glyphicon glyphicon-edit' name='EditMode' title='List with edit buttons'></a>\n";
	html += "</div>\n";
	html += "</h1>\n";

	
	html += "<% function getShortVal(val) { if (!val || typeof val != 'string') return val; return (val.length > 10 ? val.substr(0,10) : val).replace(/\"/g, '&#34;').replace(/'/g, '&#39;');} %>\n";
	html += (json.raw["Header"] ? json.raw["Header"] + "\n" : "");
//	html += "<form class='navbar-form navbar-left' action='javascrip:doFilter();'>\n<div class='form-group input-group-sm'>Search <input type='text' name='filterstring' class='form-control data-filter' placeholder=''></div><div class='form-group small'><ul class='pager nomargin'><li><a href='javascript:;' filter='' title='Clear'>Clear</a></li></ul></div><div class='form-group small'>" + json.raw["Filter"] + "</div>\n	</form>";
	html += "<form class='navbar-form navbar-left' action='javascrip:doFilter();'>\n";
	html += "<div class='form-group small' style='width:230px'><div class='input-group'><input type='text' name='filterstring' class='form-control data-filter' value='<%= (request.u.data[\"condition\"] || \"\") %>' placeholder='Search in page'>\n";
	html += "<div class='input-group-btn'><a class='btn btn-default' filter='' title='Clear search text'>X</a>";
	/*
	html += "<button type='button' class='btn btn-default dropdown-toggle' data-toggle='dropdown' style='padding-left:5px;padding-right:5px;'>More <span class='caret'></span></button>";
	html += "<ul class='dropdown-menu dropdown-menu-right' role='menu'>\n";
	html += "	<li><a name='search' href='javascript:;'>Search In Site</a></li>\n";
	if (json.raw["AdvanceCondition"] && json.raw["AdvanceCondition"].contains("condition")) {
		html += "	<li><a name='advance' href='javascript:hideSearchZone(false);'>Advance Search</a></li>\n";
	}
	html += "</ul>";
	*/
	html += "</div></div></div>\n<div class='form-group small'>" + json.raw["Filter"] + "</div>\n	</form>";

	if (false && json.raw["AdvanceCondition"] && json.raw["AdvanceCondition"].contains("condition")) {
		html += "<div class='col-md-12 search-zone' >\n";
		html += "<div class='col-md-12 win-close'><strong>" + "Advance Search" + "</strong></div>\n<table class='table'>";
		//<a href='javascript: hideSearchZone(true);' class='glyphicon glyphicon-remove list-item win-close' title='Close Advance Search'></a>
		var adconds = json.raw["AdvanceCondition"].toJSON();
		var conds = adconds["condition"];
		for (var i = 0; i < conds.length; i++) {
			var fid = conds[i].fid;
			if ("options" in conds[i]) {
			
				html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'>";
				html += "<div>";
				for (var j = 0; j < conds[i].options.length; j++) {
					var opt = conds[i].options[j];
					if (opt.caption == undefined) {
						opt.caption = opt.value;
					}
					// data-toggle='buttons' btn list-item 
					html += "<label class='space20 " + (opt["css"] ? opt["css"]:"") + "'> <input type='checkbox' target='" + fid + "' value='" + opt.value + "'>" + (opt.icon ? "<img class='icon15' src='" + opt.icon + "' >": "") + opt.caption + "</label>";
					//html += "<a name='" + fid + "' href='javascript:;' " + (opt["css"] ? "class='" + opt["css"] + "'>":">") + (opt.icon ? "<img class='icon15' src='" + opt.icon + "' > ": "") + opt.caption + "</a>";
				}
				if (conds[i]["selectall"] == true) {
					html += "<label class='checked'> <input type='checkbox' selectall=true>All</label>";
				}
				html += "</div></div></td></tr>";
			} else if ("type" in conds[i]) {
				if (conds[i].type == "1") { // text
					if (fid.contains(",")) {
						var fids = fid.split(",");
						html += "\n<tr><td><div class='col-md-1 line-header'>" + "Text" + ":</div><div class='col-md-11'><div class='space20 wid400 pull-left'><input type='text' target='" + fid.replace(/ /g, "").replace(/,/g, "_ac_") + "' class='form-control input-sm ' placeholder='" + (conds[i].placeholder || "") + "'></div><div class='pull-left'>";
						while (fids.length > 0) {
							var fd = fids.shift().trim();
							html += "<div class='wid80 pull-left'><label class='margin1'><input type='checkbox' target='Fids' value='" + fd + "' checked=true >" + data[fd].label + "</label></div>";
						}
						html += "</div></div></td></tr>";
					} else {
						html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'><div class='wid400 pull-left'><input type='text' target='" + fid + "' class='form-control input-sm' placeholder='" + (conds[i].placeholder || "") + "'></div> " + (conds[i].unit ? "<div class='pull-left input-group-addon input-sm'><label>" + conds[i].unit +"</label></div>": "") + "</div></div>";
					}
				} else if (conds[i].type == "2") { //range
					html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'><div class='wid200 pull-left'><input type='text' target='" + fid + "' class='form-control input-sm between' placeholder='" + (conds[i].placeholder || "") + "'></div><div class='wid200 pull-left'><input type='text' target='" + fid + "' class='form-control input-sm' placeholder='" + (conds[i].placeholder2 || "") + "'></div>" + (conds[i].unit ? "<div class='pull-left input-group-addon input-sm'><label>" + conds[i].unit +"</label></div>": "") + "</div></td></tr>";
				} else if (conds[i].type == "datetime") {
					html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'><div class='wid90 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm datesection' data-format='YYYY/MM/DD' maxlength='10' placeholder='yyyy/mm/dd'></div><div class='wid100 pull-left input-group between'><input type='text' target='" + fid + "' class='form-control input-sm' maxlength='8' data-format='hh:mm:ss' placeholder='hh:mm:ss'></div>" +
					"<div class='wid90 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm datesection' data-format='YYYY/MM/DD' maxlength='10' placeholder='yyyy/mm/dd'></div><div class='wid80 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm' maxlength='8' placeholder='hh:mm:ss'></div>" + "</div></td></tr>";
				} else if (conds[i].type == "3") { // date
					html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'><div class='wid100 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm datesection between' data-format='YYYY/MM/DD' maxlength='10' placeholder='yyyy/mm/dd'></div>" +
					"<div class='wid90 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm datesection' data-format='YYYY/MM/DD' maxlength='10' placeholder='yyyy/mm/dd'></div>" + "</div></td></tr>";
				} else if (conds[i].type == "4") { // time
					html += "\n<tr><td><div class='col-md-1 line-header'>" + data[fid].label + ":</div><div class='col-md-11'><div class='wid100 pull-left input-group between'><input type='text' target='" + fid + "' class='form-control input-sm' maxlength='8' data-format='hh:mm:ss' placeholder='hh:mm:ss'></div><div class='wid80 pull-left input-group'><input type='text' target='" + fid + "' class='form-control input-sm' maxlength='8' placeholder='hh:mm:ss'></div>" + "</div></td></tr>";
				} else {
					// TODO
				}
			} else if ("recent" in conds[i]) {
				html += "\n<tr><td><div class='col-md-1 line-header'>" + (data[fid] ? data[fid].label : fid) + ":</div><div class='col-md-11'>";
				html += "<div>";
				html += "<% var latest = (new Date()).recent(" + "" + "); for (var i = 0; i < latest.length; i++) { if (!latest[i]) continue; %>\n";
				html += "<label class='space20 " + (conds[i]["css"] ? conds[i]["css"]:"") + "'> <input type='radio' name='opt_" + fid + "' target='" + fid + "' value='<%= latest[i].mid(0, \"@\").replace(/\\./g, '/') %>'><%= latest[i].mid(\"@\") %></label>";
				html += "<% } %>\n";
				html += "<label class='space20 " + (conds[i]["css"] ? conds[i]["css"]:"") + "'> <input type='radio' name='opt_" + fid + "' value='' checked=true >All Days</label>";
				html += "</div></div></td></tr>";
			} else if ("last" in conds[i]) {
				var unit = conds[i]["last"];
				var num = unit.mid(0, " ");
				unit = unit.substr(num.length + 1);
		
				html += "\n<tr><td><div class='col-md-1 line-header'>" + (data[fid] ? data[fid].label : fid) + ":</div><div class='col-md-11'>";
				html += "<div>";
				
				html += "<% var latest = (new Date()).last(" + num + ", '" + unit + "'); for (var i = 0; i < latest.length; i++) { if (!latest[i]) continue; %>\n";
				html += "<label class='space20 " + (conds[i]["css"] ? conds[i]["css"]:"") + "'> <input type='checkbox' target='" + fid + "' reg=true value='<%= latest[i].mid(0, \"@\") %>'><%= latest[i].mid(\"@\").replace(/\\./g, \"/\") %></label>";
				html += "<% } %>\n";
				if (conds[i]["selectall"] == true) {
					html += "<label class='checked'> <input type='checkbox' selectall=true>All</label>";
				}
				html += "</div></div></td></tr>";
			} else if ("next" in conds[i]) {
				var unit = conds[i]["next"];
				var num = unit.mid(0, " ");
				unit = unit.substr(num.length + 1);
		
				html += "\n<tr><td><div class='col-md-1 line-header'>" + (data[fid] ? data[fid].label : fid) + ":</div><div class='col-md-11'>";
				html += "<div>";
				
				html += "<% var latest = (new Date()).next(" + num + ", '" + unit + "'); for (var i = 0; i < latest.length; i++) { if (!latest[i]) continue; %>\n";
				html += "<label class='space20 " + (conds[i]["css"] ? conds[i]["css"]:"") + "'> <input type='checkbox' target='" + fid + "' reg=true value='<%= latest[i].mid(0, \"@\") %>'><%= latest[i].mid(\"@\").replace(/\\./g, \"/\") %></label>";
				html += "<% } %>\n";
				if (conds[i]["selectall"] == true) {
					html += "<label class='checked'> <input type='checkbox' selectall=true>All</label>";
				}
				html += "</div></div></td></tr>";
			}
		
		}
		html += "\n<tr><td><div class='pull-left hidden' name='selectedconditiontitle'>" + "Selected Condition" + ":</div><div class='col-md-9 pull-left hidden' name='selectedcondition'></div>";
		html += "<div class='pull-right'><a class='btn btn-success btn-sm space0' name='advancesearch'>Search</a><a class='btn btn-default btn-sm ' href='javascript: hideSearchZone(true);'>Hide</a></div></td></tr>";
		html += "</table></div>\n<script type='text/javascript'>\n";
		html += "<% if (\"szone\" in request.u.data && request.u.data[\"szone\"].length > 0) { %>\n";
		html += "initAS('<%= request.u.data[\"szone\"].replace(/'/g, '\\\'') %>');";
		html += "<% }  %>\n";
		html += "if (!" + ("alwaysinlist" in adconds) + ") {$('.search-zone').hide();} $('.search-zone').removeClass('hidden');\n";
		html += " </script>\n";
		
	}
	html += "<div class='col-md-6 hidden'>\n<div class='input-group'><input type='text' name='condition' class='form-control'><span name='search' class='input-group-addon glyphicon glyphicon-search'></span></div>\n	</div>";
	html += options;
	html += "<div class='input-group hidden'><input type='hidden' class='hidden' name='app' value='" + json.url + "'></div>";
	html += "<table class='table table-hover'>\n  <thead>\n	<tr>" + head;
	var tds = json.LList;
	var ids = "";
	var headers = head.split("</th>").length - 1;
	var gfid = "";
	if (json["Group"] == 1) {
		gfid = ((json["OrderBy"] || "")  + ",").mid(0, ",");
	}
	
	html += "\n	</tr>\n  </thead>\n  <tbody>\n" +	
		"	<% if(data.length < 1) { %>\n" +
		"	<tr><td colspan=\"" + headers + "\">" + "No recorder yet. " + (linkAdd == "" ? "" : "Add one now? " + linkAdd) + "</td></tr>" +
		"	<% }\n var group = \"\"; for(var item in data) { \n" +
		((gfid != "") ? 'if (data[item]["' + gfid + '"] != group) { group = data[item]["' + gfid + '"]; %> <tr class="group"><th colspan="' + headers + '"><b class="glyphicon glyphicon-minus-sign"></b> ' + data[gfid].label + ': <%= group %> </th></tr> <% } %>' : " %>");

	html += trs + "\n" +
		"	<% } %>\n" +
		"  </tbody>\n</table>\n\n" ;
	
	html += "<span class='input-group hidden'><input type='hidden' class='hidden' name='ids' value='" + ids + "'></span><span class='col-md-12 summaryarea'></span>";
	if ( html.contains("datesection") || html.contains("timesection")) {
		html += "<link rel='stylesheet' href='/css/bootstrap-datetimepicker.min.css'>\n" +
	"	<script src='/js/moment.js'></script>\n" +
	"	<script src='/js/bootstrap-datetimepicker.min.js'></script>\n" +
	"	<script type='text/javascript'>  \n" +
	"	$('.datesection').each(function() { $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pickTime: false, pick12HourFormat: false});  $(this).change(); }); \n" +
	"	$('.timesection').each(function() { $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pickDate: false, pick12HourFormat: false});  $(this).change();}); \n" +
	"	$('.datetimesection').each(function() { var pk = $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pick12HourFormat: false}); if ($(this).val() == '') $(this).val(new Date().format($(this).attr('data-format')));  $(this).change();}); \n" +
	"\n" +
	" </script>\n";
	}
	html += "<script type='text/javascript'>\n  var summaryid = '';\n" + func + "\n" + 
"	$(\"[sub='true']\").each(function () {\n" + 
"		var empty = true;\n" + 
"		$(this).find('.spanval').each(function () { if ($(this).html().length > 1) empty = false; });\n" + 
"		if (empty) {this.parentNode.removeChild(this);} else {$(this).removeClass('hidden');}\n" + 
"	});\n summary();" + 
"</script>\n";

	html += (json.raw["Footer"] ? json.raw["Footer"] + "\n" : "");
	return html;
}

function toShow(data, span) {
	var html = data.Layout || "";
	if (html.length != "") {
		var def = (data.FieldsL || "").toJSON();
		for (var j in data.data) {
			// <div class='col-md-2' field='F7'>[ReadOnly] Password(F7)</div>
			html = html.replace(new RegExp(" field=['\"]" + j + "['\"]>[^<]*<" , "ig"), ">" + ___show(data.data[j], j, (def[j] || {})) + "<")
		}
		var adt = {"Update": {"type": "String", "form": "datetime", "label": "Update", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"},
				"Create": {"type": "String", "form": "datetime", "label": "Create", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, 
				"UpdateR": {"type": "String", "form": "text", "label": "Updater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"},
				"CreateR": {"type": "String", "form": "text", "label": "Creater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}};
		
		for (var j in adt) {
			html = html.replace(new RegExp(" field=['\"]" + j + "['\"]>[^<]*<" , "ig"), ">" + ___show(adt[j], j, (def[j] || {"Title": adt[j]["label"], "css": "readonly"})) + "<")
		}
	}
	var acts = (data.ActionL || "").replace(/href=['"][^'"]+['"]/gi, '');
	acts = acts.replace(/name=['"]list['"]/gi, 'href="/' + data.url + '/list"');
	acts = acts.replace(/name=['"]new['"]/gi, 'href="/' + data.url + '/new"');
	acts = acts.replace(/name=['"]edit['"]/gi, 'href="/' + data.url + '/update?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]copy['"]/gi, 'href="/' + data.url + '/copy?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]show['"]/gi, 'href="/' + data.url + '/show?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]remove['"]/gi, 'name="remove" href="/' + data.url + '/remove?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]diy['"]/gi, '').replace(/(.*)(url)(=["'][^\/].*)/gi, '$1target="_blank" href$3').replace(/(.*)(url)(=["']\/.*)/gi, '$1 href$3').replace(/RID/g, '<%= data["Rid"] %>');
	
	html = "<h1>" + (data.TitleL || "") + "</h1>\n\n" +
		"<div class='fields-section well col-md-12'>\n<div class='row'>\n" + 
		"<div class='input-group hidden'><input type='hidden' class='hidden' name='app' value='" + data.url + "'></div>" +
		html + "<div class='col-md-12'><div class='panel-footer section-action' style='padding-top:20px;'>\n";
	html += acts + '</div></div>\n';
		
	html += "<span name='history' class='col-md-12'></span>\n";
	if (("," + data.raw["History"] + ",").contains( "," + "on" + ",")) {
		html += "<script type='text/javascript'>getOPLogs('" + data.raw["Tid"] + "', '" + data.raw["Vid"] + "', '" + '<%= data["Rid"] %>' + "');</script>";
	}
	html += "	</div></div>\n";
	return html;
	
	if ("Layout" in tds) {
		var layout = "\t" + tds["Layout"].join("\r\n\t") + "\r\n";
		for(var i in data.data) {
			if (layout.indexOf("{{" + i + "}}") < 0) {
				continue;
			}
			layout = layout.replace("{{" + i + "}}", ___show(data.data[i], i, tds[i] || {}));
		}
		
		var i = "Update";		
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Update", "css": "readonly"}).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')"));
		}
		i = "Create";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Create", "css": "readonly"}).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')"));
		}
		i = "UpdateR";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Updater", "css": "readonly"}));
		}
		i = "CreateR";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Creater", "css": "readonly"}));
		}
		html += layout;
		
		if ("Action" in tds) {
			html += '<div class="col-md-12"><hr>\r\n	<div>';
			for(var i in tds["Action"]) {
				html += ___showLink(i.toLowerCase(), tds["Action"][i], 'data["Rid"]', data.url);
			}
			html += '</div>\r\n</div>\r\n';
		}
	} else {
	for(var i in tds) {
		if (i.startsWith("Section")) {
			if (data.data[i] && "attribute" in data.data[i] && data.data[i].attribute.contains("hidden")) {
				if (!("Width" in tds[i])) {
					tds[i]["Width"] = "col-md-12";
				}
				tds[i]["Width"] += " hidden";
			}
			if (i == "SectionAction") {
				html += "<div class='container section-action'><div class='panel-footer col-md-7'>\n";
			} else {
				html += "<div class='" + tds[i]["Width"] + "'>\n";
			}
			delete tds[i]["Width"];
			
			if ("Title" in tds[i]) {
				html += "<legend>" + tds[i]["Title"] + "</legend>\n";
				delete tds[i]["Title"];
			} else if (i != "SectionAction") {
				html += "<hr></hr>\n";
			}
			html += "<div>";
			for (var j in tds[i]) {
				if (j in data.data) {
					html += ___show(data.data[j], j, tds[i][j]);
				} else {
					html += ___showLink(j.toLowerCase(), tds[i][j], 'data["Rid"]', data.url);
				}
			}
			html += "</div></div>";			
			if (i == "SectionAction") {
				html += "</div>";
			}
		} else {
			if (i in data.data) {
				html += ___show(data.data[i], i, tds[i]);
			} else if (i == "Update" || i == "UpdateR" || i == "Create" || i == "CreateR") {
				if (i == "Update" || i == "Create") {
					html += ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i]).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')");
				} else {
					html += ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i]);
				}
			} else {
				html += ___showLink(i.toLowerCase(), tds[i], 'data["Rid"]', data.url);
			}
		}
	}
	}
	if (("," + data.raw["History"] + ",").contains( "," + "on" + ",")) {
		html += "<div name='history' class='col-md-12'></div>\n<script type='text/javascript'>getOPLogs('" + data.raw["Tid"] + "', '" + data.raw["Vid"] + "', '" + '<%= data["Rid"] %>' + "');</script>";
	}
	html += "	</div></div>\n";
	return html;
}

function ___showLink(name, define, rid, act) {
	var htm = "";
	if (name == "submit") {
		htm = "btn btn-primary";
		var label = define["label"] || "";
		if (define.icon) {
			label = '<img src="/img/' + define.icon + '" alt="' + label + '" title="' + label + '">' + label;
		}
		if ("css" in define) {
			htm = define["css"];
		}
		htm = '<button type="submit" class="' + htm + '">' + label + '</button>';
		if (define.disabled) {
			htm = htm.replace(' class="', 'disabled=true class="disabled ');
		}
		return htm;
	}
	if (name.startsWith("diy")) {
		return (new Buffer(define["label"], 'base64')).toString();
	}
	var def = {};
	var action = "/" + act;
	switch (name) {
	case "list":
		def = {"Title": "List", "label": "List", "icon": "", "type": "link"};
		action += "/list";
		break;
	case "edit":
		def = {"Title": "Edit", "label": "Edit", "icon": "copy.png", "type": "link"};
		action += "/update";
		break;
	case "new":
		def = {"Title": "New", "label": "New Data", "icon": "add.png", "type": "link"};
		action += "/new";
		break;
	case "copy":
		def = {"Title": "Copy", "label": "Copy", "icon": "copy.png", "type": "link"};
		action += "/copy";
		break;
	case "show":
		def = {"Title": "Detail", "label": "Detail", "icon": "", "type": "link"};
		action += "/show";
		break;
	case "remove":
		def = {"Title": "Remove", "label": "Remove", "icon": "remove.png", "type": "link"};
		action += "/remove";
		break;
	default:
		break;
	}
	for (var i in define) {
		def[i] = define[i];
	}
	
	if (def.type != "link" && def.type != "button") {
		return "";
	}
	
	htm = ' class=""';
	if (def.type != "link") {
		htm = ' class="btn btn-primary"';
	}
	if ("css" in def) {
		htm = ' class="' + def["css"] + '"';
	}
	
	if (def.disabled) {
		htm = htm.replace(' class="', 'disabled=true class="disabled ');
	}
	if (action.match(/.*\/(remove|copy|update|show)/gi)) {
		action += '?Rid=<%= ' + rid + ' %>';
	}
	if (def.name) {
		htm = '<a name="' + def.name + '"' + htm + ' href="javascript:;" url="';
	} else {
		htm = '<a ' + htm + ' href="';
	}
	//if (action.contains("/remove?Rid=")) {
	//	htm = '<a name="remove" href="#ConfirmModal" url="' + action + htm + '">'
	//} else {
		if ("href" in def) {
			htm += def.href + '">';
		} else {
			htm += action + '">'
		}
	//}
	if (def.icon) {
		htm += '<img src="/img/' + def.icon + '" alt="' + def.label + '" title="' + def.label + '">';
	}
	htm += def.label + '</a>';
	if (def.width) {
		htm = '<div class="' + def.width + '">' + htm + '</div>';
	}
	return htm;
}

function ___show(json, name, def) {
	var html = "";
	var cs = "col-md-12";
	if ("width" in def && def["width"] != "col-md-12") {
		cs = def["width"];
	}
	if ("attribute" in json && json.attribute.contains("hidden")) { 
		cs += " hidden";
	}
	if ("label" in def) {
		json["label"] = def["label"];
	}
	var count = 0;
	//html += "		<div class='" + cs + "'>" + toEF(json, ["label"]) + "\n";
	html += toEF(json, ["label"]) + "\n";
	switch (json.form.toLowerCase()) {
		case "hidden":
			html = html.replace("<div>", "<div class='hidden'>") + "<div class='input-group'><input type='hidden' class='hidden' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'></div>";
		break;
		case "id":
		case "text":
		case "number":
		case "textarea":
			html += "		<div class='form-show' readonly=true><%" + (hasDefine(json, "htm") ? "-":"=") + " ((data[\"" + name + "\"] || '') + '').replace(/(\\r\\n)|(\\r)|(\\n)/g, '<br />') %></div>";
		break;
		case "richtext":
			html += "		<div class='form-show' readonly=true><%- ((data[\"" + name + "\"] || '') + '').replace(/(\\r\\n)|(\\r)|(\\n)/g, '<br />') %></div>";
		break;
		case "password":
			html += "		<div class='form-show' readonly=true>******</div>";
		break;
		case "radio":
		case "checkbox":
		case "select":
		case "mulselect":
		
			html += "<div class='form-show' readonly=true><% var val = data[\"" + name + "\"] || \"\";  val = \",\" + val.toString() + \",\";%>";
			for (var i = 0; i < json.options.length; i++) {
				var opt = json.options[i];
				if (opt.caption == undefined) {
					opt.caption = opt.value;
				}
				html += "<% if (val.contains( \",\" + \"" + opt.value + "\" + \",\")) { %> <span class='pull-left " + (opt["css"] || "col-md-auto") + "'>" + (opt.icon ? "<img class='icon15' src='" + opt.icon + "' title='" + opt.caption + "'> ": "") + opt.caption + "</span> <% } %>";
			}
			html += "</div>";
		break;
		case "img":
			html += "<% var " + name + "data = data[\"" + name + "\"] || \"\"; if (" + name + "data.length > 0) { var jsn = " + name + "data.toJSON(); %>";
			html += "<img src='<%= jsn[\"url\"] %>' /> <% } %>";
		break;
		case "video":
			//TODO			
		break;
		case "file":
			html += "		<div class='form-show' readonly=true>";
			html += "<% var " + name + "data = data[\"" + name + "\"] || \"\"; if (" + name + "data.length > 0) { var jsn = " + name + "data.toJSON(); %>";
			html += "<a href='<%= jsn[\"url\"] %>'><%= jsn[\"realname\"] %></a> <% } %> </div>";
		break;
		case "reservation":
			html += "<div class='form-show' readonly=true><%- data[\"Reservation\"] || '' %></div>";
		break;
		case "date":
			count++;
		case "time":
			count++;
		case "datetime":
			count++;
			html += "		<div class='form-show' readonly=true ><%" + (hasDefine(json, "htm") ? "-":"=") + " (data[\"" + name + "\"] || '') %></div>";
		break;
		default:
		break;
	}  
	//html += "</div>\n";	
	return html;
}
function copyJSON(json) {
	var data = {};
	if (json) {
		for(var i in json) {
			data[i] = json[i];
		}
	}
	return data;
}
function toEdit(data) {
	var html = data.Layout || "";
	if (html.length != "") {
		var def = (data.FieldsL || "").toJSON();
		for (var j in data.data) {
			if (j in def && "readonly" in def[j]) {
				html = html.replace(new RegExp(" field=['\"]" + j + "['\"]>[^<]*<" , "ig"), ">" + ___show(data.data[j], j, (def[j] || {})) + "<")
			} else {
				html = html.replace(new RegExp(" field=['\"]" + j + "['\"]>[^<]*<" , "ig"), ">" + ___edit(data.data[j], j, (def[j] || {})) + "<")
			}
		}
		var adt = {"Update": {"type": "String", "form": "datetime", "label": "Update", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"},
				"Create": {"type": "String", "form": "datetime", "label": "Create", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, 
				"UpdateR": {"type": "String", "form": "text", "label": "Updater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"},
				"CreateR": {"type": "String", "form": "text", "label": "Creater", "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}};
		
		for (var j in adt) {
			html = html.replace(new RegExp(" field=['\"]" + j + "['\"]>[^<]*<" , "ig"), ">" + ___show(adt[j], j, (def[j] || {"Title": adt[j]["label"], "css": "readonly"})) + "<")
		}
	}
	var acts = (data.ActionL || "").replace(/href=['"][^'"]+['"]/gi, '');
	acts = acts.replace(/name=['"]list['"]/gi, 'href="/' + data.url + '/list"');
	acts = acts.replace(/name=['"]new['"]/gi, 'href="/' + data.url + '/new"');
	acts = acts.replace(/name=['"]edit['"]/gi, 'href="/' + data.url + '/update?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]copy['"]/gi, 'href="/' + data.url + '/copy?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]show['"]/gi, 'href="/' + data.url + '/show?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]remove['"]/gi, 'name="remove" href="/' + data.url + '/remove?Rid=<%= data["Rid"] %>"');
	acts = acts.replace(/name=['"]diy['"]/gi, '').replace(/(.*)(url)(=["'][^\/].*)/gi, '$1target="_blank" href$3').replace(/(.*)(url)(=["']\/.*)/gi, '$1 href$3').replace(/RID/g, '<%= data["Rid"] %>');
	acts = acts.replace(/(<a )(.*)(name=['"]submit['"])([^<]*)(<\/a>)/gi, '<button type="submit" $2 $4 </button>');
	
	html = "<h1>" + (data.TitleL || "") + "</h1>\n\n" +
		"<form class='fields-section well col-md-12'" + ' method="post" action="' + data.action + '" target="submitFrame" >\n' + "\n<div class='row'>\n" + 
		"<div class='col-md-12 <%= (code != 200) ? \"alert alert-danger\": \"\" %>'><%= (code != 200) ? message : \"\" %></div>\n" + 
		"<div class='hidden'><input type='hidden' class='hidden' name='format' value='json'>\n" + 
		"<input type='hidden' class='hidden' name='app' value='" + data.url + "'>\n" + 
		"<input type='hidden' class='hidden' name='Rid' value='<%= data[\"Rid\"] %>'></div>" +
		html + "<div class='col-md-12'><div class='panel-footer section-action' style='padding-top:20px;'>\n";
	html += acts + '</div></div>\n';
	html += "<span name='history' class='col-md-12'></span>\n";
	
if (false) {
	
	
	var tds = data.LEdit;
	
	var html = "<h1>";
	if ("Title" in tds) {
		html += tds["Title"];
		delete tds["Title"];
	} else {
		html += data.title;
	}
	html += "</h1>\n\n";
	if ("Width" in tds) {
		html += "<form class='well " + tds["Width"] + "' ";
		delete tds["Width"];
	} else {
		html += "<form class='well col-md-12' ";
	}
	
	html += ' method="post" action="' + data.action + '" target="submitFrame" >\n' +
	'	<div class="row">\n' +
	"<div class='col-md-12 <%= (code != 200) ? \"alert alert-danger\": \"\" %>'><%= (code != 200) ? message : \"\" %></div>\n" + 
	"<div class='input-group hidden'><input type='hidden' class='hidden' name='format' value='json'><input type='hidden' class='hidden' name='app' value='" + data.url + "'></div>\n" + 
	"<div class='input-group hidden'><input type='hidden' class='hidden' name='Rid' value='<%= data[\"Rid\"] %>'></div>";
	
	if ("Layout" in tds) {
		var layout = "\t" + tds["Layout"].join("\r\n\t") + "\r\n";
		for(var i in data.data) {
			if (layout.indexOf("{{" + i + "}}") < 0) {
				continue;
			}
			var fd = "";
			if (tds[i] && "readonly" in tds[i]) {
				fd = ___show(data.data[i], i, tds[i] || {});
			} else {
				fd = ___edit(data.data[i], i, tds[i] || {});
			}
			layout = layout.replace("{{" + i + "}}", fd);
		}
		
		var i = "Update";		
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Update", "css": "readonly"}).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')"));
		}
		i = "Create";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Create", "css": "readonly"}).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')"));
		}
		i = "UpdateR";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Updater", "css": "readonly"}));
		}
		i = "CreateR";
		if (layout.indexOf("{{" + i.toUpperCase() + "}}") > 0) {
			layout = layout.replace("{{" + i.toUpperCase() + "}}", ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i] || {"Title": "Creater", "css": "readonly"}));
		}
		html += layout;
		
		if ("Action" in tds) {
			html += '<div class="col-md-12"><hr>\r\n	<div>';
			for(var i in tds["Action"]) {
				html += ___showLink(i.toLowerCase(), tds["Action"][i], 'data["Rid"]', data.url);
			}
			html += '</div>\r\n</div>\r\n';
		}
	} else {
	for(var i in tds) {
		if (i.startsWith("Section")) {
			if (data.data[i] && "attribute" in data.data[i] && data.data[i].attribute.contains("hidden")) { 
				if (!("Width" in tds[i])) {
					tds[i]["Width"] = "col-md-12";
				}
				tds[i]["Width"] += " hidden";
			}
			if (i == "SectionAction") {
				html += "<div class='container section-action'><div class='panel-footer col-md-7'>\n";
			} else {
				html += "<div class='" + tds[i]["Width"] + "'>\n";
			}
			delete tds[i]["Width"];
			
			if ("Title" in tds[i]) {
				html += "<legend>" + tds[i]["Title"] + "</legend>\n";
				delete tds[i]["Title"];
			} else if (i != "SectionAction") {
				html += "<hr></hr>\n";
			}
			html += "<div>";
			for (var j in tds[i]) {
				if (j in data.data) {
					if ("readonly" in tds[i][j]) {
						html += ___show(data.data[j], j, tds[i][j]);
					} else {
						html += ___edit(data.data[j], j, tds[i][j]);
					}
				} else {
					html += ___showLink(j.toLowerCase(), tds[i][j], 'data["Rid"]', data.url);
				}
			}
			html += "</div></div>";
			if (i == "SectionAction") {
				html += "</div>";
			}
		} else {
			if (i in data.data) {
				if ("readonly" in tds[i]) {
					html += ___show(data.data[i], i, tds[i]);
				} else {
					html += ___edit(data.data[i], i, tds[i]);
				}
			} else if (i == "Update" || i == "UpdateR" || i == "Create" || i == "CreateR") {
				if (i == "Update" || i == "Create") {
					html += ___show({"type": "String", "form": "datetime", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i]).replace(" (data[\"" + i + "\"] || '')", " (new Date().convert(data[\"" + i + "\"], request.u.data[\"user\"][\"ctz\"], 'YYYY/MM/DD hh:mm') || '')");
				} else {
					html += ___show({"type": "String", "form": "text", "label": i, "default": "", "placeholder": "", "msg": "", "format": "json", "attribute": ",readonly,"}, i, tds[i]);
				}
			} else {
				html += ___showLink(i.toLowerCase(), tds[i], 'data["Rid"]', data.url);
			}
		}
	}
	}
}	
	if (("," + data.raw["History"] + ",").contains( "," + "on" + ",")) {
		html += "<script type='text/javascript'>getOPLogs('" + data.raw["Tid"] + "', '" + data.raw["Vid"] + "', '" + '<%= data["Rid"] %>' + "');</script>";
	}

	html += "</div>\n</form>\n<iframe id='submitFrame' name='submitFrame' class='hidden'></iframe>\n";
if ( html.contains("datesection") || html.contains("timesection")) {
	html += "<link rel='stylesheet' href='/css/bootstrap-datetimepicker.min.css'>\n" +
"	<script src='/js/moment.js'></script>\n" +
"	<script src='/js/bootstrap-datetimepicker.min.js'></script>\n" +
"	<script type='text/javascript'>  \n" +
"	$('.datesection').each(function() { $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pickTime: false, pick12HourFormat: false});  $(this).change(); }); \n" +
"	$('.timesection').each(function() { $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pickDate: false, pick12HourFormat: false});  $(this).change();}); \n" +
"	$('.datetimesection').each(function() { var pk = $(this).datetimepicker({ format: $(this).attr('data-format'), language: 'en', pick12HourFormat: false}); if ($(this).val() == '') $(this).val(new Date().format($(this).attr('data-format')));  $(this).change();}); \n" +
"\n" +
" </script>\n";
}

	if ("CheckFuncs" in data) {
		var funcs = "";
		for (var i in data["CheckFuncs"]) {
			funcs += "if ($('[name=" + i + "]')[0]) { ";
			funcs += "var val = $('[name=" + i + "]').val(); switch ($('[name=" + i + "]').attr('type')) { case 'radio': val = $('[name=" + i + "]:checked').attr('value'); break; case 'textarea': val = $('[name=" + i + "]')[0].value; break;} val = Function('val', " + data["CheckFuncs"][i] + ")(val); if (val.length > 0) msg += val + '\\n'; showError('" + i + "', val.length > 0);";
			funcs += "}\n";
		}
		if (funcs.length > 0) {
			//html += "<script type='text/javascript'>  \n	function checkFields() {\n var msg = ''; \n" + funcs + "\n return msg;}</script>\n";
		}
	}


	return html;
}

function ___edit(json, name, def) {
	var html = "";
	var count = 0;
	var cs = "col-md-12";
	if ("width" in def && def["width"] != "col-md-12") {
		cs = def["width"];
	}
	
	if ("attribute" in json && json.attribute.contains("hidden")) { 
		cs += " hidden";
	}
	
	if ("label" in def) {
		json["label"] = def["label"];
	}
	//html += "		<div class='" + cs + "'><div>" + toEF(json, ["label"]) + "<div class='controls'>\n";
	html += "		<div>" + toEF(json, ["label"]) + "<div class='controls'>\n";
	
	switch (json.form.toLowerCase()) {
		case "hidden":
			html = html.replace("class='", "class='hidden ") + "<div class='input-group'><input type='hidden' class='hidden' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'></div>";
		break;
		case "text":
		 // TODO: <span class='input-group-addon'>$</span><input / ><span class='input-group-addon'>.00</span>
			html += "<input type='text' class='form-control' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'";
			html += toEF(json, foptions[json.form]) + ">";
		break;
		case "id":
			html += "		<div class='form-show' readonly=true><%= (data[\"" + name + "\"] || '') %><input type='hidden' class='hidden' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'></div>";
		break;
		case "number":
			html += "<div class='input-group'><span class='input-group-addon'><b >%</b></span><input type='text' class='form-control' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'";
			html += toEF(json, foptions[json.form]) + "><span class='input-group-addon'>.00</span></div>";
		break;
		case "password":
			html += "<% if (!data[\"Rid\"]) { %> <div class='input-group'><input type='password' class='form-control' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>'";
			html += toEF(json, foptions[json.form]) + "></div><% } else { %> ****** <a href=\"javascript:changePassword('<%= data[\"Rid\"] || \"\" %>', '" + name + "')\">Change</a><% } %>";
		break;
		case "textarea":
			html += "<textarea class='form-control' name='" + name + "' ";
			html += toEF(json, foptions[json.form]) + "><%= data[\"" + name + "\"] || \"\" %></textarea>";
		break;
		case "richtext":
			html += "<textarea class='form-control richtext' name='" + name + "' ";
			html += toEF(json, foptions[json.form]) + "><%= data[\"" + name + "\"] || \"\" %></textarea>";
		break;
		case "radio":
		case "checkbox":
			html += "<% var val = data[\"" + name + "\"] || \"\";  val = \",\" + val.toString() + \",\";%><div class='form-control min-h34'>";
			
			if (json.form == "checkbox") {
				// if no such checked empty value, disappeared in request data
				html += "<input type='checkbox' name='" + name + "' value='' checked=true class='hidden' >";
			}
			var cols = (json.cols || 6);
			var md = 100 / cols;
			md = ((md < 16) ? "col-md-1" : (md < 25) ? "col-md-2" : (md < 33) ? "col-md-3" : (md < 41) ? "col-md-4" : "col-md-5") + " ";
			for (var i = 0; i < json.options.length; i++) {
				var opt = json.options[i];
				if (opt.caption == undefined) {
					opt.caption = opt.value;
				}
				if (i % cols == 0) {
					html += "<div class='min-h20'>";
				}
				html += "\n			<label class='" + json.form + "-inline " + (((i + 1) % cols == 0) ? "" : md) + (opt["css"] || "") + "'><input type='" + json.form + "' name='" + name + "' value='" + opt.value + "' " + toEF(json, foptions[json.form]).replace(" required=true", "") + " <%= (val.contains( \",\" + \"" + opt.value + "\" + \",\")) ? \"checked=true\" : \"\" %> >" + (opt.icon ? "<img class='icon15' src='" + opt.icon + "'>": "") + opt.caption + "</label>";
				if ((i + 1) % cols == 0) {
					html += "</div>";
				}
			}
			if (!html.endsWith("</div>")) {
				html += "</div>";
			}
			html += "</div>";
		break;
		case "select":
			html += "<% var val = data[\"" + name + "\"] || \"\";  val = \",\" + val.toString() + \",\";%>";
			html += "\n			<select class='form-control' name='" + name + "' " + toEF(json, foptions[json.form]) + " >"
			for (var i = 0; i < json.options.length; i++) {
				var opt = json.options[i];
				if (opt.caption == undefined) {
					opt.caption = opt.value;
				}
				html += "\n			<option value='" + opt.value + "'  <%= (val.contains( \",\" + \"" + opt.value + "\" + \",\")) ? \"selected=true\" : \"\" %>  >" + opt.caption + "</option>";
			}
			html += "\n			</select>"
		break;
		case "mulselect":
			//TODO			
		break;
		case "img":
			html += "<% var " + name + "data = data[\"" + name + "\"] || \"\"; if (" + name + "data.length > 0) { var jsn = " + name + "data.toJSON(); %>";
			html += "<input type='hidden' name='" + name + "' ftype='img' value='<%= data[\"" + name + "\"] || \"\" %>' ><span name='" + name + "_link'><img src='<%= jsn[\"url\"] %>' /></span><input type='file' class='btn-upload' title='Upload' accept='image/*' >";
			html += "<% } else { %><input type='hidden' name='" + name + "' ftype='img' value='' ><input type='file' class='btn-upload' title='Upload' accept='image/*' ><span name='" + name + "_link'>" + (json.placeholder || "") + "</span><% } %>";
		break;
		case "video":
			//TODO			
		break;
		case "file":
			html += "<% var " + name + "data = data[\"" + name + "\"] || \"\"; if (" + name + "data.length > 0) { var jsn = " + name + "data.toJSON(); %>";
			html += "<input type='hidden' name='" + name + "' ftype='link' value='<%= data[\"" + name + "\"] || \"\" %>' ><span name='" + name + "_link'><a href='<%= jsn[\"url\"] %>'><%= jsn[\"realname\"] %></a></span><input type='file' class='btn-upload' title='Upload' target='" + name + "'>";
			html += "<% } else { %><input type='hidden' name='" + name + "' ftype='link' value='' ><input type='file' class='btn-upload' title='Upload'><span name='" + name + "_link'>" + (json.placeholder || "") + "</span> <% } %>";
		break;
		case "reservation":
			html += "<% var link = \"<label class='checkbox-inline'><input type='checkbox' class='Reservation cancel'>Cancel</label>\"; var reserv = (data[\"Reservation\"] || ''); var re = new RegExp(\"\\<a [^>]+mailto:\" + request.u.user.email + \"[^<]+</a>\",\"ig\"); reserv = reserv.replace(re, link); re = new RegExp(\"\\<a [^>]+>\" + request.u.user.name + \"</a>\",\"ig\"); reserv = reserv.replace(re, link); %>";
			html += "<%- reserv %>";
			//value='\"add\": {\"t0\": " + Math.floor(new Date().now() / 1000) + ", \"t1\": 3600, \"memo\": \"\"}' 
			html += "<div class='input-group pull-left' style='width:295px'><input type='hidden' name='Reservation' > </input><input type='text' class='Reservation t0 datetimesection form-control' style='width:140px' data-format='YYYY/MM/DD HH:mm'></input><span class='input-group-addon' style='width:34px'>+</span><select class='Reservation t1 form-control' style='width:120px'>" +
			"<option value=''>Duration</option>" + 
			"<option value='3600'>1 Hour</option>" + 
"<option value='7200'>2 Hours</option>" + 
"<option value='14400'>4 Hours</option>" + 
"<option value='21600'>6 Hours</option>" + 
"<option value='28800'>8 Hours</option>" + 
"<option value='43200'>12 Hours</option>" + 
"<option value='86400'>1 Day</option>" + 
"<option value='129600'>1.5 Days</option>" + 
"<option value='172800'>2 Days</option>" + 
"<option value='259200'>3 Days</option>" + 
"<option value='345600'>4 Days</option>" + 
"<option value='432000'>5 Days</option>" + 
"<option value='604800'>7 Days</option>" + 
"<option value='864000'>10 Days</option>" + 
"<option value='1728000'>20 Days</option>" + 
"<option value='2592000'>30 Days</option>" + 
"</select></div><div class='col-md-7'><input type='text' class='Reservation memo form-control' placeholder='why make this reservation'></input></div>";
		break;
		case "date":
			count++;
		case "time":
			count++;
		case "datetime":
			count++;
			var iclass = "datetimesection";
			if (count == 3) iclass = "datesection";
			if (count == 2) iclass = "timesection";
			html += "<div><input type='text' name='" + name + "' value='<%= data[\"" + name + "\"] || \"\" %>' class='form-control " + iclass + "'";
			html += toEF(json, foptions[json.form]) + "></input></div>";
		break;
		default:
		break;
	}
	//html += "</div>" + toEF(json, ["msg"]) + "</div></div>\n";
	html += "</div>" + toEF(json, ["msg"]) + "</div>\n";
	return html;
}
// toEditField
function toEF(json, attr) {
	if (!attr) return "";
	var names = attr;
	var edit = "";
	
	if ("attribute" in json) {
		var chks = "required unique hidden disabled readonly trim exist pk htm multiple".split(" ");
		for (var cidx in chks) {
			var k = chks[cidx];
			if (json.attribute.contains("," + k + ",")) {
				json[k] = true;
			}
		}
	}
	// Add default attributes only if it's not full tag like <label />
	if (names[0] != "label" && names[0] != "msg") {
		names.push("disabled");
		names.push("readonly");
		names.push("hidden");
	}
	
	for (var i = 0; i < names.length; i++)
		switch (names[i]) {
		case "label": 
			edit += "<label class='control-label title-label'>" + json.label + (json.required ? "<B class='red'>*</B>":"") + "</label>";
			break;
		case "required": 
			edit += (json.required) ? " required=true" : "";
			break;
		case "unique": 
			edit += (json.required) ? " unique=true" : "";
			break;
		case "disabled": 
			edit += (json.disabled) ? " disabled=true" : "";
			break;
		case "readonly": 
			edit += (json.readonly) ? " readonly=true" : "";
			break;
		case "multiple": 
			edit += (json.multiple) ? " multiple=true" : "";
			break;
		case "maxLength": 
			edit += (json.maxLength > 0) ? " maxlength=" + json.maxLength : "";
			break;
		case "minLength": 
			edit += (json.minLength > 0) ? " minlength=" + json.minLength : "";
			break;
		case "length": 
			edit += (json.length > 0) ? " length=" + json.length + " maxlength=" + json.length : "";
			break;
		case "max": 
			edit += (json.max) ? " max=" + json.max : "";
			break;
		case "min": 
			edit += (json.min) ? " min=" + json.min : "";
			break;
		case "cols": 
			edit += (json.cols) ? " cols=" + json.cols : "";
			break;
		case "rows": 
			edit += (json.rows) ? " rows=" + json.rows : "";
			break;
		case "size": 
			edit += (json.size && json.size > 0) ? " size=" + json.size : "";
			break;
		case "format": 
			edit += (json.format) ? " data-format='" + json.format + "' maxlength=" + json.format.length + "": "";
			break;
		case "placeholder": 
			edit += (json.placeholder && json.placeholder.length > 0) ? " placeholder='" + json.placeholder + "'" : "";
			break;
		case "msg": 
			edit += (json.msg && json.msg.length > 0) ? "<span class='errormsg'>" + json.msg + "</span>" : "";
			break;
		default:
			edit += ""
			break;
	}
	return edit;
}

function hasDefine(defines, key) {
	return ((key in defines && defines[key]) || ("attribute" in defines && defines["attribute"].indexOf(key) > -1));
}
// 
function toCheckFuncs(defines) {
	return "";
	if (typeof defines == "string") {
		defines = defines.toJSON();
	}
	var funcs = {};
	//Failed to verify " + i + ": 
	for (var k in defines) {
		var json = defines[k];
		var js = "if (val == undefined) return '';";
		
		var names = new Array();
		
		if ("attribute" in json) {
			json["required"] = true;
			json["multiple"] = true;
		}
		
		if ("max" in json && "min" in json) {
			if ((json.max == json.min && json.min !=0) || json.max > json.min) {
				js += "if (val > " + json.max + " || val < " + json.min + ") return 'Please input value between " + json.min + " and " + json.max + " for " + json.label +".';";
			}
		} else {
			if ("max" in json) {
				js += "if (val > " + json.max + ") return 'Please input value <= " + json.max + " for " + json.label +".';";
			}
			if ("min" in json) {
				js += "if (val < " + json.min + ") return 'Please input value >= " + json.min + " for " + json.label +".';";
			}
		}
		
		if ("maxLength" in json && "minLength" in json && json.maxLength > json.minLength && json.minLength > 0) {
			js += "if (val.length > " + json.maxLength + " || val.length < " + json.minLength + ") return 'Please input " + json.minLength + "~" + json.maxLength + " chars for " + json.label +".';";
		} else {
			if ("maxLength" in json) {
				js += (json.maxLength > 0) ? "if (val.length > " + json.maxLength + ") return 'Please input less than " + json.maxLength + " chars for " + json.label +".';" : "";
			}
			if ("minLength" in json) {
				js += (json.minLength > 0) ? "if (val.length < " + json.minLength + ") return 'Please input at least " + json.minLength + " chars for " + json.label +".';" : "";
			}
		}
		if ("length" in json) {
			js += (json.length > 0) ? "if (val.length != " + json.length + ") return 'Please input " + json.length + " chars for " + json.label +".';" : "";
		}
		if ("required" in json) {
			js += "if (val.length < 0) return 'Please input value for " + json.label +"!';";
		}
		var reg = "";
		if ("regexp" in json && json.regexp) {
			reg = json.regexp;
		}
		if ("regExp" in json && json.regExp) {
			reg = json.regExp;
		}
		if (reg.length > 0) {
			js += "if (!val.match(" + reg.replace(/\\/g, "\\\\") + ")) return 'Failed to verify " + json.label +": " +json["msg"] + "';";
		}
		js += "return '';";
		funcs[k] = '"' + js.replace(/"/g, '\\"') + '"';
	}
	return funcs;
}


module.exports = {
	toEdit: toEdit,
	toShow: toShow,
	toList: toList,
	init: getDefault,
	toCheckFuncs: toCheckFuncs,
};