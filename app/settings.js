
var settings = {
db: {
	host: '127.0.0.1', 
	port: '27017',
	name: 'mine',
},
SMTP: {
	host: "smtp.163.com", 
	port: 25,
    auth: {
        user: "itman70s@163.com",
        pass: "tangrammy"
    },
	cc: "superjob@totiming.com",
},
defines: {
	enable: true, 
	template: "./service/admin/framework.ejs",
},
logs: {
	file: "../logs/mine.log", 
	maxLogSize: 20480,
	level: "TRACE",
	/* TRACE DEBUG INFO WARN ERROR FATAL */
},
files: {
	host: 'localhost', 
	port: '3000',
	uploadDir: "web/u",
	root: 'web/u',
},
/*
localhost
16.83.62.2',
SMTP: {
   service: "Gmail",
   auth: {
       user: "gmail.user@gmail.com",
       pass: "gmailpass"
   }
},
SMTP: {
   host: "smtpcorp.com",
   port: 2525, //  8025, 587 and 25 can also be used. 
   auth: {
       user: "USERNAME",
       pass: "PASSWORD"
   }
}
*/
home: {
	name: "Home",
	link: "/",
	welcome: "精益管理",
	content: "精益管理要求企业的各项活动都必须运用“精益思维” (Lean Thinking）。“精益思维”的核心就是以最小资源投入，包括人力、设备、资金、材料、时间和空间， 创造出尽可能多的价值，为顾客提供新产品和及时的服务。",
}, 
port: 3000,
portadmin: 3333,
tops: [
		{name: "", title: "", url: "/zcar/list"}, 
		{name: "", title: "", url: "/todo/list"}, 
		{name: "", title: "", url: "/release/list"}, 
		],
sites: {label: "Inner Sites",
		sites: [{name: "AngularStrap", title: "", url: "http://mgcrea.github.io/angular-strap/#"}, 
		{name: "前端网址导航", title: "", url: "http://www.whycss.com/"}, 
		{name: "", title: "", url: ""} ]},
bottom: "",
};

function setDB(name) {
	if (!name) {
		return;
	}
	settings.db.name = name;
	settings.logs.file = "../logs/" + name + ".log";
}
function setPort(port) {
	if (!port) {
		return;
	}
	settings.port = port;
	settings.files.port = port;
}

setDB(process.argv[2]);   // DB数据库名称
setPort(process.argv[3]);   // web服务端口号

settings.portadmin = process.argv[4] || settings.portadmin;   // web服务管理员端口号

module.exports = settings;
