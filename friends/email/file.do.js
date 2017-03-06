//var log = require('../core/log.js')('Z');
var util = require('util');
var url = require('url');
var fs = require('fs');
var path = require('path');
var settings = require('../../app/settings.js');
var zlib = require("zlib");
var multiparty = require('multiparty');

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
    var realPath = "./web/" + pathname;
	var lastModified = fs.statSync(realPath).mtime.toUTCString();
	if (lastModified) {
		res.setHeader("last-modified", lastModified);
	}

	if (req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]) {
		res.writeHead(304, "Not Modified");
		res.end();
		//console.log("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms());
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

				////console.log("ssid[" + req.u.ssid + "] client information: " + util.inspect(req.headers).replace(/[\r\n]+/g, " "));
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
				//console.log("ssid[" + req.u.ssid + "] " + req.method + " " + req.url + " " + res.statusCode + " " + req.ms() + "".formatSize(file.length));
			}
		});
	}
}
function upload(req, res) {
	//生成multiparty对象，并配置上传目标路径
	var form = new multiparty.Form({uploadDir: settings.files.uploadDir});
	//上传完成后处理
	form.parse(req, function(err, fields, files) {
		var filesTmp = JSON.stringify(files,null,2);

		if(err){
		  //console.log('parse error: ' + err);
			res.end(JSON.stringify(err));
		} else {
			//console.log('parse files: ' + filesTmp);
			var inputFile = files.file[0];
			var uploadedPath = inputFile.path;
			var dstPath = settings.files.uploadDir + inputFile.originalFilename;    
			
			var name = inputFile.originalFilename;
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
			data["realname"] = inputFile.originalFilename;
			data["size"] = inputFile.size;
			data["owner"] = req.u.user.name + "(" + req.u.user.email + ")";
			data["ownerid"] = req.u.user.Rid;
			data["timestamp"] = (new Date() - 0);

			fs.appendFileSync( root + "/list.txt", JSON.stringify(data) + "\r\n");
			//console.log("ssid[" + req.u.ssid + "] " + req.method + "  " + name + "\norignal file:" + inputFile.path);

			// 移动文件
			fs.rename(uploadedPath, name, function(err) {
			  // if (err) throw err;
				//res.json(data);
				res.end(JSON.stringify(data));
			})
		}
	});
}


module.exports = {
	get: get,
	upload: upload
};
