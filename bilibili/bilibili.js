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

var async = require('async');
var http = require('http');
var fs = require('fs');

var biliGetDate = function (c) {
    var d = new Date();
    return d.getFullYear() + c + d.getMonth() + c + d.getDate();
}

var getVideoNum = function (callback) {
    var url = "http://api.bilibili.com/archive_rank/getarchiverankbypartion?type=jsonp&tid=30&ps=1&pn=1";

    http.get(url, function (res) {
        var resData = "";
        res.on('data', function (data) {
            resData += data;
        });

        res.on("end", function () {
            //callback(null, 50);
            callback(null, JSON.parse(resData).data.page.count);
        });
    }).on('error', function (err) {
        callback(err);
    });
};

var getAllVideoData = function (begin, cbAfter) {
    getVideoNum(function (err, total) {
        var arr = [], result = [], fetch = 0, last = "", offset = 0, backcheck = false;
        var getVideoData = function (id, callback) {
            var url = "http://api.bilibili.com/archive_rank/getarchiverankbypartion?type=jsonp&tid=30&ps=1&pn=" + id.toString();

            setTimeout(function () {
                http.get(url, function (res) {
                    var resData = "";

                    res.on('data', function (data) {
                        resData += data;
                    });

                    res.on("end", function () {
                        if (resData.substr(0, 1) == "<") {
                            callback(id);
                        }
                        else {
                            var data = JSON.parse(resData).data.archives["0"],
                                profile = {
                                    aid: data.aid,
                                    copyright: data.copyright,
                                    pic: data.pic,
                                    title: data.title,
                                    duration: data.duration,
                                    tags: data.tags,
                                    stat: data.stat,
                                    create: data.create,
                                    description: data.description,
                                    mid: data.mid,
                                    author: data.author
                                },
                                count = JSON.parse(resData).data.page.count;

                            if (resData == count) {
                                total++; offset++;
                                arr.push(total);
                            }
                            else {
                                //console.log(id);
                                if (typeof cbAfter != "function") {
                                    if (backcheck) result.unshift(profile);
                                    else result.push(profile);
                                }
                                else {
                                    cbAfter(profile);
                                }

                                if (id == total) callback(id);
                                else callback(null);
                            }
                        }
                    });
                }).on('error', function (err) {
                    callback(err);
                });
            }, 5);
        };

        for (var i = begin; i <= total; i++) {
            arr.push(i);
        }

        async.eachSeries(arr, getVideoData, function (err) {
            console.log("Till: ", err);
            console.log("Total: ", total - offset);

            arr = [], backcheck = true;
            for (var i = offset; i >= 1; i--) {
                arr.push(i);
            }

            async.eachSeries(arr, getVideoData, function (err) {
                console.log("Till: ", err);
                console.log("Total(Offset): ", offset);

                var d = new Date();
                //Save to File.
                fs.writeFile("./results/total_" + biliGetDate(".") + ".json", JSON.stringify(result, null, 4), 'utf8', (err) => {
                    if (err) throw err;
                    console.log("Filewrite success!");
                });
            })
        });
    });
};

exports.getAllVideoData = getAllVideoData;