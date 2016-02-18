#!/bin/sh
cd cmd
chmod +x 7z mongod mongoimport npm  mongoexport node

./node T.js install

echo "open http://localhost:3000/ in browser to start"
