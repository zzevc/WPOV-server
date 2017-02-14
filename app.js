var mysql = require('mysql');

var biliAPI = require('./bilibili/biliAPI.js')

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'wpov-nodejs',
    password: "wpov-nodejs",
    database: 'WPOV'
});

connection.connect();

/*
connection.query('CREATE TABLE ', function (error, results, fields){
    //err
})
*/
connection.end();

biliAPI.getAllVideoData(1);

/**
 * Bilibili API
 * 
 * http://api.bilibili.com/x/v2/reply?jsonp=jsonp&pn=1&type=1&oid=10492&sort=0&_=1482889773903
 * http://api.bilibili.com/x/tag/archive/tags?callback=jQuery17202870352235622704_1482889079894&aid=1048576&type=jsonp&_=1482889080659
 * 
 * 获取所有视频数据
 * http://api.bilibili.com/archive_rank/getarchiverankbypartion?type=jsonp&tid=30&pn=1
 * 
 */