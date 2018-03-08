
var util = require('util');
var url = require('url');
var fs = require('fs');
var path = require('path');
var zlib = require("zlib");
var md5 = require("md5");

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
	var fid = req.url.split("fid=")[1];
	if (fid) {
		fid = fid.split("&")[0];
		pathname = jFiles[fid] && jFiles[fid].path;
	} else if (pathname == "/tree") {
		pathname = tree;
	} else {
		pathname = "index.html";
	}
    var realPath = "./" + pathname;
	
	if (!fs.existsSync(realPath)) {
		res.writeHead(404, {'Content-Type': 'text/plain'});
		res.write("This request file " + (fid || pathname) + " was not found on this server.");
		res.end();
		return;
	}
		
	var lastModified = fs.lstatSync(realPath).mtime.toUTCString();
	if (lastModified) {
		res.setHeader("last-modified", lastModified);
	}
	
	if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
		res.writeHead(304, "Not Modified");
		res.end();
		//log.info("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms());
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
					//log.error("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + " " + res.statusCode + " " + req.ms());
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

				////log.info("ssid[" + req.u.ssid + "] client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
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
				//log.info("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms() + "".formatSize(file.length));
			}
		});
	}
}

function upload(req, res) {
	if (!req.files) {
		return res.status(400).send('No files were uploaded.');
	}
	
	let raw = null;
	var files = {};
	for (let idx in req.files) {
		raw = req.files[idx];
		var owner = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress) + "";
		var fid = ((new Date() - 1400371200000) + "").split("").reverse().join("").toN32();
		fid = "XZ" + md5(req.headers['user-agent']) + "X" + owner.replace(/[\.\:]/gi, "0").toN32() + "Z" + fid;
		fid = "F" + fid.substr(fid.length - 15);
		files[fid] = {fid: fid, "owner": owner}
		files[fid]["name"] = raw.name;
		files[fid]["path"] = getPath(raw.name);
		files[fid]["status"] = "uploading";
		files[fid]["size"] = raw.data.length;
		files[fid]["md5"] = md5(raw.data);
		files[fid]["mimetype"] = raw.mimetype;
		files[fid]["from"] = req.headers['referer'];
		files[fid]["timestamp"] = (new Date() - 0);
		raw.mv(files[fid]["path"], function(err) {
			if (err) {
				files[fid]["status"] = err;
			} else {
				delete files[fid]["status"];
			}
			uploaded(res, files);
		});	
	}

}

function uploaded(res, files) {
	if (!res || !files) {
		return;
	}
	var rtn = {}
	for (var i in files) {
		if (files[i].status == "uploading") {
			return;
		}
		jFiles[i] = files[i];
		rtn[i] = {};
		rtn[i].fid = files[i].fid;
		rtn[i].name = files[i].name;
		rtn[i].size = files[i].size;
		rtn[i].download = "http://" + res.req.headers.host + "/files?fid=" + files[i].fid;
		rtn[i].timestamp = files[i].timestamp;
	}
	let content = JSON.stringify(files) + "";
	fs.appendFileSync(tree, content.substring(1, content.lastIndexOf("}")) + ",\r\n");
	res.end(JSON.stringify(rtn));
}

function getPath(name) {
	name = name || "";
	if (name.lastIndexOf(".") > 0) {
		name = name.substr(name.lastIndexOf("."));
	} else {
		name = "";
	}
	 
	name = ((new Date() - 1400371200000) + "").toN32() + name;
	var root = "public";
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
	return name;
}

// 创建文件目录
function mkdir(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}
const root = "public";
var paths = [root, root + "/img/", root + "/mv/", root + "/doc/", root + "/bin/", root + "/zip/", root + "/unk/"];
for (var i in paths) {
	mkdir(paths[i]);
}

var jFiles = {};
const tree = root + "/files.json";

if (fs.existsSync(tree)) {
	fs.readFile(tree, "binary", function (err, file) {
		if (file.length > 10) {
			file = file.substring(0, file.lastIndexOf(","));
		}
		jFiles = JSON.parse(file + "}");
	});
} else {
	fs.appendFileSync(tree, "{\r\n");
}





var _keyStr = "0123456789ABCDEFGHIJKLMNPQRSTUVW";
/*
Usage: strVariable.toN32([radix])
*/
String.prototype.toN32 = function(radix) {
	var r = ((radix + "") in ["2", "8", "10", "16", "32"]) ? radix : 10;
	var val = "";
	var n = parseInt(this, r).toString(2);
	var s = 0;
	for (var e = n.length % 5; e <= n.length; e += 5) {
		if (e > s) {
			var i = parseInt(n.substring(s, e), 2);
			val += _keyStr[i];
		}
		s = e;
	}
	return val;	
}
module.exports = {
//	add: add,
//	show: show,
//	list: list,
	get: get,
	upload: upload
};
