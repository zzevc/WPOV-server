var mysql = require('mysql');
var bilibili = require('./bilibili/bilibili');
var async = require('async');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'wpov-nodejs',
    password: "wpov-nodejs",
    database: 'WPOV'
});

var commands = {
    songListExist: "SELECT COUNT(*) FROM information_schema.`TABLES` WHERE TABLE_NAME='songList';",
    createSongList: "CREATE TABLE `songList` (aid varchar(20) NOT NULL)",
    createSongTable: "CREATE TABLE `"
}

connection.connect();

async.waterfall([
    function (callback) {
        connection.query(commands.songListExist, function (err, results, fields) {
            callback(err, results[0]["COUNT(*)"]);
        });
    },
    function (result, callback) {
        if(result == 0){
            connection.query(commands.createSongList, function(err, results, fields){
                callback(err);
            })
        }
    }
], function (err, result) {
    console.error(err);
});

bilibili.getAllVideoData(1, function(result){
    /**
     * 判断是否为VOCALOID中文曲有两种形式
     * 1.主动判断法（优先级：1）
     *      当一首歌曲中主动标有关键字[洛天依/乐正绫/言和/星尘/心华/乐正龙牙/南北组/……]时，
     *   则判断该歌曲为VOCALOID中文曲。
     * 
     * 2.主动否决法（优先级：2）
     *      当一首歌曲中标有关键字[UTAU/初音/双子/GUMI/……]市，则判断该歌曲非VOCALOID中文曲。
     */

    //咳咳……以上都是脑洞……周刊官方说了，只有带上VOCALOID中文曲标签才算在统计范围之内……

    if(result.title.substring(0, 15) == "周刊VOCALOID中文排行榜")return;

    for(var i in result.tags){
        if(result.tags[i] == "VOCALOID中文曲"){
            async.waterfall([
                function(callback){
                    connection.query("SELECT COUNT(*) FROM information_schema.`TABLES` WHERE TABLE_NAME='av" + result.aid + "';", function(err, results, fields){
                        callback(err, results[0]["COUNT(*)"]);
                    });
                },
                function(exist, callback){
                    if(exist){
                        connection.query("INSERT INTO av" + result.aid + "()");
                    }
                    else{
                        connection.query("CREATE TABLE");
                    }
                }
            ])

            //console.log(JSON.stringify(result, null, 4));
            break;
        }
    }
});

connection.end();