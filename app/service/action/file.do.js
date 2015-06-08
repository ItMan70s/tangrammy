var log = require('../core/log.js')('Z');
var util = require('util');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mongo = require('../core/mongo.db.js');
var cps = require('../core/components.js');
var setting = require('../../settings.js');
var zlib = require("zlib");
/*

var field = require('../core/fields.js');
var cps = require('../core/components.js');

function getUData(req) {
	var udata = cps.getReqData(req);
	var ff = {"F1": {type: "String", form: "text", label: 'name', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 50, min: 0, max: 0, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: 'ERROR: user name is empty'},
		"F2": {type: "String", form: "text", label: 'email', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 0, min: 0, max: 0, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: ''},
		"F3": {type: "String", form: "text", label: 'age', required: true, trim: true, exist:true, minLength: 0, length: 0, maxLength: 0, min: 0, max: 150, enum:['en','cn'], default: 'en', regExp: "", exist0: "return true", placeholder: 'hint message', msg: ''}, };

 return ff;
// return {name: 'zzb2',  uid: 'duid', password: "fdf", email: "demail", timezone: "0", language: "en", updater: "boa"};
}
function add(req, res) {
getUData(req);
//fs.writeFileSync("./service/views/fieldsss.json", JSON.stringify(getUData(req)));
fs.readFile("./service/views/fields.json", 'utf8', function (err, data) {
var obj = {name: 'JP'};

	if(err) {
		console.error(err);
		return res.render("detail_new", {title: "NEW EJS ERROR", action: "/new", data: {F1: "", F2: "", F3: "", F4: "admin", F5: "T01", F6: ""}, warning: ""});
	} 
	var uData = {};
	try {
		uData = JSON.parse(data);
	} catch (msg) {
		console.error(msg);
	}
	
	var recorder = {};
	recorder.data = field.init(uData);
	recorder.title = "NEW EJS";
	recorder.action = "/new";
	recorder.warning = "";
	fs.readFile('./service/views/detail_temple.ejs',function(err,data){
		if(err) {
			console.error(err);
			recorder.title = "NEW EJS ERROR";
			return res.render("detail_new", recorder);
		} else {
		//			fs.writeFileSync('./service/views/detail_new.ejs', data);
//			return res.render("detail_new", {title: "NEW EJS", action: "/new", data: {F1: "", F2: "", F3: "", F4: "", F5: "", F6: ""}});

			data = ("" + data).replace("FIELDS", field.toEdit(uData, "col-md-4"));
			fs.writeFile('./service/views/detail_new.ejs', data, function(err){
			if (err) console.error(err);
			return res.render("detail_new", recorder);
			});
		}

	});
});
}

function show(req, res) {

getUData(req);
//fs.writeFileSync("./service/views/fieldsss.json", JSON.stringify(getUData(req)));
fs.readFile("./service/views/fields.json", 'utf8', function (err, data) {
var obj = {name: 'JP'};

	if(err) {
		console.error(err);
		return res.render("detail_new", {title: "NEW EJS ERROR", action: "/new", data: {F1: "", F2: "", F3: "", F4: "admin", F5: "T01", F6: ""}, warning: ""});
	} 
	var uData = {};
	try {
		uData = JSON.parse(data);
	} catch (msg) {
		console.error(msg);
	}
	var recorder = {};
	recorder.data = field.init(uData);
	recorder.title = "SHOW EJS";
	recorder.action = "/show";
	recorder.warning = "";
	fs.readFile('./service/views/detail_temple.ejs',function(err,data){
		if(err) {
			console.error(err);
			recorder.title = "SHOW EJS ERROR";
			return res.render("detail_new", recorder);
		} else {
			data = ("" + data).replace("FIELDS", field.toShow(uData, "col-md-4"));
			fs.writeFile('./service/views/detail_show.ejs', data, function(err){
			if (err) console.error(err);
			return res.render("detail_show", recorder);
			});
		}

	});
});
}
function list(req, res) {

getUData(req);
//fs.writeFileSync("./service/views/fieldsss.json", JSON.stringify(getUData(req)));
fs.readFile("./service/views/fields.json", 'utf8', function (err, data) {
var obj = {name: 'JP'};

	if(err) {
		console.error(err);
		return res.render("detail_new", {title: "LIST EJS ERROR", action: "/list", data: {F1: "", F2: "", F3: "", F4: "admin", F5: "T01", F6: ""}, warning: ""});
	} 
	var uData = {};
	try {
		uData = JSON.parse(data);
	} catch (msg) {
		console.error(msg);
	}
	var recorder = {};
	recorder.data = {"0": field.init(uData)};
	recorder.title = "LIST EJS";
	recorder.action = "/list";
	recorder.warning = "";
	fs.readFile('./service/views/detail_temple.ejs',function(err,data){
		if(err) {
			console.error(err);
			recorder.title = "LIST EJS ERROR";
			return res.render("detail_list", recorder);
		} else {
			data = ("" + data).replace("FIELDS", field.toList(uData));
			fs.writeFile('./service/views/detail_list.ejs', data, function(err){
			if (err) console.error(err);
			return res.render("detail_list", recorder);
			});
		}

	});
});
}
*/
var maxAge = 60 * 60 * 24 * 365;
var types = {
    "css": "text/css",
    "gif": "image/gif",
    "htm": "text/html",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};

function get(req, res) {
    var pathname = url.parse(req.url).pathname;
    var realPath = "web" + pathname;
	var lastModified = mongo.lastModified(realPath);
	if (lastModified) {
		res.setHeader("last-modified", lastModified);
	}

	if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
		res.writeHead(304, "Not Modified");
		res.end();
		log.info("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms());
	} else {
		fs.readFile(realPath, "binary", function (err, file) {
			if (err) {
				fs.exists(realPath, function (exists) {
					if (!exists) {
						res.writeHead(404, {'Content-Type': 'text/plain'});
						res.write("This request URL " + pathname + " was not found on this server.");
						res.end();
					} else {
						res.writeHead(500, {'Content-Type': 'text/plain'});
						res.end(err);
					}
					log.error("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + " " + res.statusCode + " " + req.ms());
				});
			} else {
				var ext = path.extname(realPath);
				ext = ext ? ext.slice(1) : 'unknown';
				if (ext.match(/^(gif|png|jpg|js|css)$/ig)) {
					var expires = new Date();
					expires.setTime(expires.getTime() + maxAge * 1000);
					res.setHeader("Expires", expires.toUTCString());
					res.setHeader("Cache-Control", "max-age=" + maxAge);
				}
				
				var acceptEncoding = req.headers['accept-encoding'] || "";
				var matched = ext.match(/^(css|js|htm|html)$/ig);
				matched = matched && acceptEncoding.match(/(\bgzip\b|\bdeflate\b)/ig);

				//log.info("ssid[" + req.u.ssid + "] client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
				if (matched && file.length > 1024) {
					// only zip file if size > 1KB
					var raw = fs.createReadStream(realPath);
					if (acceptEncoding.match(/\bgzip\b/ig)) {
						res.writeHead(200, "OK", {'Content-Type': (types[ext] || "text/plain"), 'Content-Encoding': 'gzip'});
						raw.pipe(zlib.createGzip()).pipe(res);
					} else  {
						res.writeHead(200, "OK", {'Content-Type': (types[ext] || "text/plain"), 'Content-Encoding': 'deflate'});
						raw.pipe(zlib.createDeflate()).pipe(res);
					}
				} else {
					res.writeHead(200, "OK", {'Content-Type': (types[ext] || "text/plain")});
					res.write(file, "binary");
					res.end();
				}
				log.info("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms() + "".formatSize(file.length));
			}
		});
	}
}
function upload(req, res) {
	
    var name = req.files.file.name;
	if (name.lastIndexOf(".") > 0) {
		name = name.substr(name.lastIndexOf("."));
	} else {
		name = "";
	}
	 
	name = ((new Date() - 1400371200000) + "").toN32() + name;
	var root = "web/u";
	if (name.match(/^.*\.(gif|png|jpg|jpeg|ico|bmp|tif|tiff|tga|svg|ai|hdri)$/ig)) {
		name = root + "/img/" + name;
	} else if (name.match(/^.*\.(wmv|asf|asx|rm|rmvb|mpg|mpeg|mpe|dat|vob|dv|3gp|3g2|mov|avi|mkv|mp4|m4v|flv)$/ig)) {
		name = root + "/mv/" + name;
	} else if (name.match(/^.*\.(js|css|txt|tsv|csv|doc|docx|docm|hlp|xps|wps|rtf|htm|html|pdf|xml|xslt|xsd|odt|chm|ppt|pptx|xls|xlsx)$/ig)) {
		name = root + "/doc/" + name;
	} else if (name.match(/^.*\.(exe|com|bat|sh|cmd)$/ig)) {
		name = root + "/bin/" + name;
	} else if (name.match(/^.*\.(rar|zip|arj|gz|z|7z)$/ig)) {
		name = root + "/zip/" + name;
	} else {
		name = root + "/unk/" + name;
	}
	var app = req.url.mid("/upload/");
	var data = {};
	data["app"] = app;
	data["filepath"] = name;
	data["url"] = name.substr(3);
	data["realname"] = req.files.file.name;
	data["size"] = req.files.file.size;
	data["owner"] = req.u.user.name + "(" + req.u.user.email + ")";
	data["ownerid"] = req.u.user.Rid;
	data["timestamp"] = (new Date() - 0);
	
	fs.appendFileSync( root + "/list.txt", JSON.stringify(data) + "\r\n");
	log.info("ssid[" + req.u.ssid + "] " + req.method + "  " + name + "\norignal file:" + req.files.file.path);
/*
	files: Object
file: Object
fieldName: "file"
headers: Object
name: "pics4.cxf"
originalFilename: "pics4.cxf"
path: "public\upload\11904-1s5xqgu.cxf"
size: 2155
type: "application/octet-stream"
*/

	// 移动文件
    fs.rename(req.files.file.path, name, function(err) {
      // if (err) throw err;
		//res.json(data);
		res.end(JSON.stringify(data));
	  /*
      // 删除临时文件夹文件, 
      fs.unlink(req.files.file.path, function() {
         if (err) throw err;
         res.send('File uploaded to: ' + name + ' - ' + req.files.file.size + ' bytes');
		res.end();
      });
	  */
	})
	
	/*
	  最后回答文章开头的那几个问题：

问：如何限制图片大小
if(req.files.image.size >307200)// 300 * 1024{
    msg +='File size no accepted. Max: 300k;
}
 

问：如何显示上传进度
req.form.on('progress',function(bytesReceived, bytesExpected){
    console.log(((bytesReceived / bytesExpected)*100)+"% uploaded");});
 

问：如何修改文件名
var fs =require('fs');
fs.renameSync(req.files.image.path,'public/files/img'+ new_name);
本文同时也发布在我的个人博客qingbob

app.configure(function(){
    app.use(express.bodyParser({
          keepExtensions:true,
          limit:10000000,// 10M limit
          defer:true//enable event            }));})

app.post('/upload',function(req, res){//bind event handler
    req.form.on('progress',function(bytesReceived, bytesExpected){});
    req.form.on('end',function(){
        console.log(req.files);
        res.send("done");});})
	  */
}


module.exports = {
//	add: add,
//	show: show,
//	list: list,
	get: get,
	upload: upload
};
