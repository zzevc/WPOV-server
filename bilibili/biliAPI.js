var async = require('async');
var http = require('http');
var fs = require('fs');

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

var getAllVideoData = function (begin) {
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
                                    play: data.play,
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
                                if(backcheck) result.unshift(profile);
                                else result.push(profile);

                                console.log(id);

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

                //Save to File.
                fs.writeFile('results.json', JSON.stringify(result, null, 4), 'utf8', (err) => {
                    if (err) throw err;
                    console.log("Filewrite success!");
                });
            })
        });
    });
};

exports.getAllVideoData = getAllVideoData;