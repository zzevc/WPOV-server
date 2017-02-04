var async = require('async');

/**
 * 问题：如果截止
 */

var getVideoData = function (http, id, callback) {
    var url = "http://api.bilibili.com/archive_rank/getarchiverankbypartion?type=jsonp&tid=30&ps=1&pn=" + id.toString();

    http.get(url, function (res) {
        var resData = "";
        res.on('data', function (data) {
            resData += data;
        });

        res.on("end", function () {
            callback(JSON.parse(resData));
        });
    }).on('error', function (err) {
        console.err(err);
    });
}

var getVideoNum = function (http) {
    getVideoData(http, 1, function (data, callback) {
        callback(data.data.page.count);
    });
};

var getAllVideoData = function (http) {
    var num = getVideoNum();

    for (var i = 1; i != num; i++) {
        var data = JSON.parse(getVideoData(i))["data"]["0"];
    }
};

async.auto({
    getVideoNum: function(callback){
        callback
    }
})


exports.getVideoNum = getVideoNum;
exports.getVideoData = getVideoData;