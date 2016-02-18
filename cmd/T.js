var version = "1.0";

var fs = require('fs');

var cli = require('child_process');
var util = require('util');
var cmds = null;
var cmds_win = {exportDB: "mongoexport --db z -c name -o folder/name.json", 
				importDB: "mongoimport --db z --drop -c name -file folder/name.json",
				zip: "7z u name folder",
				unzip: "7z x name -ofolder -r -y"};
				
var pwd = fs.realpathSync("./");
console.log('pwd: ' + pwd);

var bak = "../bak";
var app = "../app";
var db = "../db";
var modules = "../app/node_modules";
/*
var os = require('os');
	console.log('os.arch(): ' + os.arch());
	console.log('os.platform(): ' + os.platform());
	console.log('os.type(): ' + os.type());
	console.log('os.hostname(): ' + os.hostname());
	//What platform you're running on: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
console.log('This platform is ' + process.platform);
// What processor architecture you're running on: 'arm', 'ia32', or 'x64'.
console.log('This processor architecture is ' + process.arch);
/* >node t
os.arch(): ia32
os.platform(): win32
os.type(): Windows_NT
os.hostname(): ZHANGZA17
This platform is win32
This processor architecture is ia32
*/
var windows = false;
if (process.platform == "win32") {
	cmds = cmds_win;
	windows = true;
} else {
	cmds = cmds_win;
}

if(process.argv.length < 3) {
	console.log('Usage: node T commands');
	console.log('commands: ');
	console.log('    backupdb - backup DB data.');
	console.log('    backup - backup DB data and application files.');
	console.log('    restore filenmame - restore DB data.');
	console.log('    install - inital DB and application, and start services.');
	console.log('    uninstall - stop and remove DB service and tangrammy service.');
}

for(var idx = 2; idx < process.argv.length; idx++) {
	var val = ("" + process.argv[idx]).toLowerCase();
	switch(val) {
		case "backupdb":
			backupDB();
		break;
		case "backup":
			backupAll();
		break;
		case "restore":
			idx++;
			if (process.argv[idx]) {
				restoreDB(process.argv[idx]);
			} else {
				console.error('Usage: node T restore filenmame');
				console.error('  filenmame - the file is zip file created by backup/backupDB command.');
			}
		break;
		case "install":
			install();
		break;
		case "uninstall":
			uninstall();
		break;
		default:
		break;
	}
}

function uninstall() {
	if (windows) {
		exec('nssm stop Tangrammy');
		exec('nssm stop TangrammyDB');
		exec('nssm remove Tangrammy confirm');
		exec('nssm remove TangrammyDB confirm');
	} else {
		exec('killall -9 mongod' );
		exec('killall -9 node' );
		exec("echo '' > " + fs.realpathSync("..") + "/cmd/tangrammy.sh");
	}
}
	// ('x-www-browser google.com')
function install() {
	mkdir(db);
	mkdir("../logs");
	var path = fs.realpathSync(db);
	if (windows) {		
		try {fs.writeFileSync("../logs/mongodb.log", ""); } catch(e){}
		
		exec('nssm stop TangrammyDB');
		exec('nssm remove TangrammyDB confirm');
		exec('nssm install TangrammyDB "' + fs.realpathSync("./mongod.exe") + '" --smallfiles --dbpath "' + path + '" --logpath "' + fs.realpathSync("../logs/mongodb.log") + '"');
		exec('nssm restart TangrammyDB');
		
		backupDB();
		restoreDB("dat/TangramDB.7z");
		
		exec('nssm stop Tangrammy');
		exec('nssm remove Tangrammy confirm');
		
		console.log(modules + '/express');
		if (!fs.existsSync(modules + '/express')) {
			exec(cmds["unzip"].replace("name", "dat/node_modules.7z").replace("folder", modules));
		}
		exec("nssm install Tangrammy " + fs.realpathSync("node.exe") + " index.js");
		exec("nssm set Tangrammy AppDirectory " + fs.realpathSync(app));
		exec('nssm restart Tangrammy');
	} else {
		exec(fs.realpathSync("./mongod") + ' --smallfiles --dbpath "' + path + '" --logpath "' + fs.realpathSync("../logs/mongodb.log") + '"');
		restoreDB("dat/TangramDB.7z");
		
		exec(fs.realpathSync("./node") + ' --smallfiles --dbpath "' + path + '" --logpath "' + fs.realpathSync("../logs/mongodb.log") + '"');
		var script = "#!/bin/bash\n" + 
"# start mongo db service\n" + 
"folder/cmd/mongod --smallfiles  --dbpath folder/db  --logpath folder/logs/mongodb.log &\n" + 
"\n" + 
"# start node service\n" + 
"cd folder/app\n" + 
"folder/cmd/node folder/app/index.js &\n";
		var folder = fs.realpathSync("../");
		script = script.replace(/folder/gi, folder);
		var shname = folder + "/cmd/tangrammy.sh";
		fs.writeFileSync(shname, script);
		exec("chmod 777 " + shname);

		var ts = fs.readFileSync("/etc/rc.d/rc.local", {encoding: 'utf8'});
		if (ts.indexOf("tangrammy.sh") > -1) {
			if (ts.indexOf(shname) > -1) {
				console.warn('Found same start script in /etc/rc.d/rc.local');
			} else {
				console.error('Found different start script in /etc/rc.d/rc.local, please update it manually.');
			}
		} else {
			exec('echo "' + shname + '" >> ' + folder + '/logs/script.log  2>&1 &" >> /etc/rc.d/rc.local');
		}
		exec('sh "' + shname + '" &');
	}
}

function backupAll() {
	var folder = tmpfolder();
	exportDB(folder);
	mkdir(bak);
	_zip([app, folder + "/DB"], bak + "/Tangram_" + format(new Date(), "yyyyMMddhhmm") + ".7z");
	remove(folder);
}

function backupDB() {
	var folder = tmpfolder();
	exportDB(folder);
	mkdir(bak);
	_zip([folder + "/DB"], bak + "/Tangram_DB_" + format(new Date(), "yyyyMMddhhmm") + ".7z");
	remove(folder);
}

function _zip(folders, zipname) {
	var d = new Date();
	var cmd = cmds["zip"].replace("name", zipname);
	if (fs.existsSync(zipname)) {
		fs.unlinkSync(zipname);
	}
	for (var i in folders) {
		exec(cmd.replace(/folder/gi, folders[i]));
	}
}


function exportDB(folder) {
	remove(folder + "/DB");
	mkdir(folder + "/DB");
	var cmd = cmds["exportDB"].replace("folder", folder + "/DB");
	exec(cmd.replace(/name/gi, "reservations"));
	exec(cmd.replace(/name/gi, "ops"));
	exec(cmd.replace(/name/gi, "settings"));
	exec(cmd.replace(/name/gi, "ts"));
	
	var ts = fs.readFileSync(folder + "/DB" + "\\ts.json", {encoding: 'utf8'}).replace(/(.+"Tid" : ")(T..?)(",.+)/gi, "$2");
	ts = ts.replace(/[\r\n]/gi, " ").replace(/ +/g, " ").toLowerCase().split(" ");
	var done = "";
	for (var i in ts) {
		if (done.indexOf(ts[i] + ",") > -1) {
			continue;
		}
		done += ts[i] + ",";
		
		if (ts[i].match(/.+[a-z]$/gi)) {
			ts[i] += "s";
		}
		exec(cmd.replace(/name/gi, ts[i]));
	}
}

function restoreDB(zfile) {
	var folder = tmpfolder();
	exec(cmds["unzip"].replace("name", zfile).replace("folder", folder));
	var cmd = cmds["importDB"].replace("folder", folder + "/DB");
    var dirList = fs.readdirSync(folder + "/DB");
    dirList.forEach(function(item){
		if (item.match(/.+\.json/gi)) {
			exec(cmd.replace(/name/gi, item.replace(".json", "")));
			//console.error('exec : ' + cmd.replace(/name/gi, item.replace(".json", "")));
		}
    });
	remove(folder);
}

function exec(cmd, callback) {
    console.log('To run: ' + cmd);
	if (callback) {
		cli.exec(cmd, callback || function(error, stdout, stderr) {
			if (error !== null) {
			  console.error('exec error: ' + error);
			}
			// return stdout || stderr;
		});
		return "";
	} else {
		try {
			return cli.execSync(cmd, {encoding: 'utf8'});
		} catch (e) {
			return e.toString();
		}
	}
}

function remove(folder) {
	if (fs.existsSync(folder)) {
		if(fs.statSync(folder).isFile()){
			fs.unlinkSync(folder);
		} else {
			var dirList = fs.readdirSync(folder);
			dirList.forEach(function(item){
				var name = folder + '/' + item;
				if(fs.statSync(name).isFile()){
					fs.unlinkSync(name);
				} else {
					remove(name)
				}
			});
			
			fs.rmdirSync(folder);
		}
	}
}
function mkdir(path) {
	if (!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}
function tmpfolder() {
	var path = "./tmp" + format(new Date(), "hhmmssS");
	mkdir(path);
	return path;
}

// ("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// ("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
function format(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, 
        "D+": date.getDate(),
        "d+": date.getDate(),
        "H+": date.getHours(),
        "h+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S": date.getMilliseconds()
    };
    if (/(y+)/i.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

    return fmt;
}