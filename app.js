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
    createSongList: "CREATE TABLE `songList` (aid varchar(20) NOT NULL)"
}

async.waterfall([
    function (callback) {
        connection.connect();
        callback(null);
    },
    function (callback) {
        /*
        connection.query(commands.songListExist, function (err, results, fields) {
            callback(err, results[0]["COUNT(*)"]);
        });
        */

        callback(null);
    },
    //function (result, callback) {
    function (callback) {
        /*
        if (result == 0) {
            connection.query(commands.createSongList, function (err, results, fields) {
                console.log(results);
                callback(err);
            });
        }
        else {
            //orz
            callback(null);
        }
        */
        callback(null);
    },
    function (callback) {
        var finalResults = [];
        bilibili.getAllVideoData(1, function (result, cbin) {
            /**
             * 判断是否为VOCALOID中文曲有两种形式
             * 1.主动判断法（优先级：1）
             *      当一首歌曲中主动标有关键字[洛天依/乐正绫/言和/星尘/心华/乐正龙牙/南北组/……]时，
             *   则判断该歌曲为VOCALOID中文曲。
             * 99oi0ik9iik8
             * 2.主动否决法（优先级：2）
             *      当一首歌曲中标有关键字[UTAU/初音/双子/GUMI/……]市，则判断该歌曲非VOCALOID中文曲。
             */

            //咳咳……以上都是脑洞……周刊官方说了，只有带上VOCALOID中文曲标签才算在统计范围之内……

            if (result.title.substring(0, 15) == "周刊VOCALOID中文排行榜") return;

            var flag = false;

            for (var i in result.tags) {
                if (result.tags[i] == "VOCALOID中文曲" ||
                    result.tags[i] == "中文曲" ||
                    result.tags[i] == "洛天依" ||
                    result.tags[i] == "乐正绫" ||
                    result.tags[i] == "言和" ||
                    result.tags[i] == "星尘" ||
                    result.tags[i] == "心华" ||
                    result.tags[i] == "龙牙" ||
                    result.tags[i] == "乐正龙牙" ||
                    result.tags[i] == "战音") {
                    /*
                    async.waterfall([
                        function (cb) {
                            connection.query("SELECT COUNT(*) FROM information_schema.`TABLES` WHERE TABLE_NAME='av" + result.aid + "';", function (err, results, fields) {
                                cb(err, results[0]["COUNT(*)"]);
                            });
                        },
                        function (exist, cb) {
                            if (exist) {
                                //connection.query("INSERT INTO av" + result.aid + "()");
                                console.log(1);
                            }
                            else {
                                //connection.query("CREATE TABLE");
                            }
                            cb(null);
                        },
                        function(cb){
                            console.log(JSON.stringify(result, null, 4));
                        }
                    ], function (err, results) {
                        console.error(err);
                    });
                    */
                    flag = true; break;
                }
            }
            var test2 = result.title.match("(天依|乐正绫|言和|星尘|心华|乐正龙牙|龙牙|南北|南北组|战音)");
            if (test2 && typeof test2.length != "undefined" && test2.length > 0) flag = true;

            if (flag) cbin(result);
            else cbin(null);
        });
    }
], function (err, result) {
    console.error(err);
    connection.end();
});