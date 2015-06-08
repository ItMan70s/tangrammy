module.exports = {
db: {
	host: 'localhost', 
	port: '27017',
	name: 'z',
},
defines: {
	enable: true, 
	template: "./service/defines/framework.ejs",
},
logs: {
	file: "../logs/z.log", 
	maxLogSize: 20480,
	level: "TRACE",
	/* TRACE DEBUG INFO WARN ERROR FATAL */
},
files: {
	host: 'localhost', 
	port: '3000',
	uploadDir: "public/upload",
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
	welcome: "Welcome!",
	content: "This a sample of tangrammy system. ",
}, 
port: 3000,
tops: [{name: "Home", title: "", url: "/"}, 
		{name: "", title: "", url: "/todo/list"}, 
		],
};