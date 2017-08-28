#!/bin/bash
nodejs=node
mongod=mongod
tangrammy=/opt/tangrammy

# restart nginx
pid=`ps -ef | grep nginx | grep sbin`
echo $pid
if [ "$pid" == "" ]
then
#	/usr/sbin/nginx &
#        echo restart nginx
fi
pid=`ps -ef | grep mongod | grep tangram`
echo $pid
if [ "$pid" == "" ]
then
	nohup $mongod --smallfiles --dbpath $tangrammy/db --logpath $tangrammy/logs/mongodb.log &
	echo restart DB
fi

# -f 参数判断 $file 是否存在
file="$tangrammy/app/restart_required"
if [ -f "$file" ]; then
  killall $nodejs
  rm -f $file
fi


pid=`ps -ef | grep tangram/app | grep index.js`
echo $pid
if [ "$pid" == "" ]
then
	cd $tangrammy/app
	nohup $nodejs $tangrammy/app/index.js 3000 &
	echo restart Tangrammy at 3000
fi

pid=`ps -ef | grep tangram/app | grep admin.js`
echo $pid
if [ "$pid" == "" ]
then
	cd $tangrammy/app
	nohup $nodejs $tangrammy/app/admin.js 3333 &
	echo restart Tangrammy Admin at 3333
fi

pid=`ps -ef | grep tangram.demo | grep index.js`
echo $pid
if [ "$pid" == "" ]
then
	cd $tangrammy/../tangram.demo/app
	nohup $nodejs $tangrammy/../tangram.demo/app/index.js 4000 &
	echo restart Tangrammy at 4000
fi


pid=`ps -ef | grep tangram.demo | grep admin.js`
echo $pid
if [ "$pid" == "" ]
then
	cd $tangrammy/../tangram.demo/app
	nohup $nodejs $tangrammy/../tangram.demo/app/admin.js 4444 &
	echo restart Tangrammy Admin at 4444
fi

pid=`ps -ef | grep node | grep cli`
echo $pid
if [ "$pid" == "" ]
then
	cd /opt/cli
	nohup $nodejs /opt/cli/start.js &
	echo restart cli at 3009
fi


pid=`ps -ef | grep node | grep metronic`
echo $pid
if [ "$pid" == "" ]
then
	cd /opt/server
	nohup $nodejs /opt/server/static.js 8080 /opt/metronic &
	echo restart metronic
fi

pid=`ps -ef | grep node | grep ItManTos`
echo $pid
if [ "$pid" == "" ]
then
	cd /opt/server
	nohup $nodejs /opt/server/static.js 8088 /opt/ItManTos &
	echo restart Home Page
fi


pid=`ps -ef | grep node | grep email `
echo $pid
if [ "$pid" == "" ]
then
	cd /opt/tangrammy/friends/email
	nohup $nodejs /opt/tangrammy/friends/email/start.js  &
	echo restart email
fi

# nohup /opt/zcar/cmd/node /opt/zcar/app/index.js 

