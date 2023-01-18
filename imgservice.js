// to write to log file ------>>>>>>> node ALPRService.js > ALPRService.log 2>&1
// crontab command to delete files older than 14 days, runs everday at 0900 -------->>>>>>>>>> 0 9 * * * /usr/bin/find /var/www/ipcam/door/* -ctime +14 -exec rm {} \;
var common = require('./common.js');
var express = require('express');
var app = express();
var fs = require("fs");
var jSon = require("./imgsettings.json");
var bodyParser = require('body-parser');
var contains = require("string-contains");
const request = require('request');
const path = require('path');
var _ = require('underscore');
var Promise = require('promise');

app.use(express.static('./'));
app.use(express.json());
app.use(express.urlencoded());
var srcdir = jSon.SETTINGS.sourcedir;
var tgtdir = jSon.SETTINGS.targetdir;
var imgtype = jSon.SETTINGS.imgtype;
var ALPRurl = jSon.ALPRService.url;
var ALPRport = jSon.ALPRService.port;
var dEfined_port = jSon.SETTINGS.port;

var server = app.listen(dEfined_port, () => {
  var host = server.address().address;
  var port = server.address().port;
  common.wrItelog("listening on http://" + host + ":" + port);
})

app.post('/ProcessImage', (req, res) => {
  var img = (getMostRecentFileName(srcdir, imgtype));
  common.wrItelog(ALPRurl + "/ProcessImage     ------" + srcdir + "/" + img);
  getnumberplatedata(ALPRurl + "/ProcessImage", img).then((returnval) => {

  }).catch (err => {
      common.wrItelog("error: " + err)
  })
})

app.post('/', (req, res) => {
  if (req.body.MODE == "IMAGE") {
    var img = (getMostRecentFileName(srcdir, imgtype));
    common.wrItelog(ALPRurl + ":" + ALPRport + "/LoadImage     ------" + srcdir + "/" + img);
    getnumberplatedata(ALPRurl + ":" + ALPRport + "/LoadImage", img).then((returnval) => {
      common.wrItelog("Success:  " + JSON.stringify(returnval));
      //res.send(JSON.stringify(returnval));
      res.send("boom");
    }).catch(err => {
      common.wrItelog("Error:  " + JSON.stringify(returnval));
      res.send(JSON.stringify(returnval));
    })
  }
})

function getnumberplatedata(uRl, img) {
  return new Promise((resolve, reject) => {
    request({
      url: uRl,
      form: { "IMG": img },
      method: 'POST',
    }, (err, res, resbody) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        var returnval = JSON.parse(resbody);
        resolve(returnval);
      }
    })
  })
}
/*function getnumberplatedata(uRl, img){
    var imgData = { "IMG" : img };
    var returnval = {"reg" : "INITIAL"};
    request.post({
        url : uRl,
        json : imgData
        }, (error, res, body) => {
            if (error) {
            common.wrItelog(error);
            return;
            }
            else {
                common.wrItelog("2   " + body.reg);
                returnval = body;
                common.wrItelog("4    " + returnval.reg);
            }
    });
    common.wrItelog("5    " + returnval.reg);
    //returnval = {"reg" : "PLATE2"};
    return returnval;
}*/
// Return only base file name without dir
function getMostRecentFileName(dir, type) {
  var files = fs.readdirSync(dir);

  // use underscore for max()
  return _.max(files, (f) => {
    var fullpath = path.join(dir, f);

    // ctime = creation time is used
    // replace with mtime for modification time
    if (contains(f, type) == true) {
      return fs.statSync(fullpath).ctime;
    }
  });
}
/*
function wrItelog(sTrval){
    console.log(getDateTime() + "   " + sTrval);
}
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + "   " + hour + ":" + min + ":" + sec;
}*/