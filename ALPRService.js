// to write to log file ------>>>>>>> node ALPRService.js > ALPRService.log 2>&1
// crontab command to delete files older than 14 days, runs everday at 0900 -------->>>>>>>>>> 0 9 * * * /usr/bin/find /var/www/ipcam/door/* -ctime +14 -exec rm {} \;
var common = require('./common.js');
var express = require('express');
var app = express();
var fs = require("fs");
var jSon = require("./ALPRsettings.json");
var bodyParser = require('body-parser');
var contains = require("string-contains");
const request = require('request');
var Promise = require('promise');
var _ = require("underscore");


app.use(express.static('./'));
app.use(express.json());
app.use(express.urlencoded());

var vehicle_details = {};
var dEfined_port = jSon.SETTINGS.port;
var imgfullpath = "";
var aPproved = "";
var jSonfile = "./ALPRSettings.json";

var server = app.listen(dEfined_port, () => {
	var host = server.address().address;
	var port = server.address().port;
	common.wrItelog("listening on http://" + host + ":" + port);
})
//getVehicle_details('lp1.jpg');
app.post('/ProcessImage', (req,res) => {
  imgfullpath = jSon.SETTINGS.ALPR_CLOUD.image_path + req.body.IMG;
  //common.wrItelog(req.body.IMG);
  common.wrItelog(imgfullpath);
  getVehicle_details();

})
app.post('/LoadImage', (req,res) => {
  imgfullpath = jSon.SETTINGS.ALPR_CLOUD.image_path + req.body.IMG;
  common.wrItelog(req.body.IMG);
  getVehicle_info().then((regplate) => {
    common.wrItelog("3   " + regplate.reg);
    res.send(regplate);
  }).catch(err => {
    common.wrItelog("Error:  " + JSON.stringify(regplate));
    res.send(regplate);
  })
})
  
 // for (var vAl in vehicle_details.results) { 
   // var numplate = vehicle_details.results[vAl].plate;
    //var vehicledets = { "ABC 123" : {"name" : "TBC", "colour" : "blue", "vehicle" : "datsun cherry"}}
    //common.wrItelog(vehicledets);
    //addjSon(vehicledets);
  //}
function getVehicle_info() {
  vehicle_details = {};
  var uRl = jSon.SETTINGS.ALPR_CLOUD.url;
  var formData = {
    secret_key : jSon.SETTINGS.ALPR_CLOUD.secret_key,
    recognize_vehicle : jSon.SETTINGS.ALPR_CLOUD.recognize_vehicle,
    country : jSon.SETTINGS.ALPR_CLOUD.country,
    return_image : jSon.SETTINGS.ALPR_CLOUD.return_image,
    Topn : jSon.SETTINGS.ALPR_CLOUD.Topn,
    state : jSon.SETTINGS.ALPR_CLOUD.state,
    image : fs.createReadStream(imgfullpath)
  }
  return new Promise((resolve, reject) => {
    request.post({
      url : uRl,
      formData : formData 
      }, (error, res, resbody) => {
      if (error) {
        common.wrItelog(error);
        reject(error);
      }
      else {
        vehicle_details = JSON.parse(resbody);
        if (vehicle_details.results.length > 0) {
            for (var vAl in vehicle_details.results) {
              var plate = vehicle_details.results[vAl].plate;
              var year = vehicle_details.results[vAl].vehicle.year[0].name;
              var colour = vehicle_details.results[vAl].vehicle.color[0].name;
              var make_model = vehicle_details.results[vAl].vehicle.make_model[0].name;
              common.wrItelog("Reg :  " + plate  + "   Make & Model :   " + make_model + "   Colour :   " + colour + "   Year :   " + year);
              addjSon({ plate : {"name" : "TBC", "colour" : colour, "vehicle" : make_model, "open_gate" : "0", "notify" : "0"}});
            }
          aPproved = 3;
        } 
        else {
            aPproved = 2;
            plate = "NOT_FOUND";
            common.wrItelog("No license plate found.");
        }
        renamefile(plate);
        resolve ({"reg" : plate});
      }
    });
  })
}
function getVehicle_details() {
  vehicle_details = {};
  var uRl = jSon.SETTINGS.ALPR_CLOUD.url;
  var formData = {
    secret_key : jSon.SETTINGS.ALPR_CLOUD.secret_key,
    recognize_vehicle : jSon.SETTINGS.ALPR_CLOUD.recognize_vehicle,
    country : jSon.SETTINGS.ALPR_CLOUD.country,
    return_image : jSon.SETTINGS.ALPR_CLOUD.return_image,
    Topn : jSon.SETTINGS.ALPR_CLOUD.Topn,
    state : jSon.SETTINGS.ALPR_CLOUD.state,
    image : fs.createReadStream(imgfullpath)
  }
  aPproved = 0;
  request.post({
    url : uRl,
    formData : formData 
    }, (error, res, body) => {
    if (error) {
      common.wrItelog(error);
      return;
    }
    else {
      vehicle_details = JSON.parse(body);
      if (vehicle_details.results.length > 0) {
          for (var vAl in vehicle_details.results) {
            var plate = vehicle_details.results[vAl].plate;
            var year = vehicle_details.results[vAl].vehicle.year[0].name;
            var colour = vehicle_details.results[vAl].vehicle.color[0].name;
            var make_model = vehicle_details.results[vAl].vehicle.make_model[0].name;
            common.wrItelog("Reg :  " + plate  + "   Make & Model :   " + make_model + "   Colour :   " + colour + "   Year :   " + year);

            for (var vAl2 in jSon.REG_NOs)
            {
              var appr_plate = vAl2.replace(/\s/g, '');
              if (contains(appr_plate, plate)){
                //wrItelog("Approved");
                aPproved = 1;
                if (jSon.REG_NOs[vAl2].open_gate == 1){
                  check_closed("read_garage", function(check){
                    if (check == 1){
                      trigger_switch("btn_garage");
                    }
                    else {
                      common.wrItelog("Gates are Open");
                    }
                  });
                }
              }
              else {
                // else something
              }
            }
          }
          if (aPproved == 1){
          common.wrItelog("Approved Vehicle");
          }
          else {
            common.wrItelog("Vehicle NOT Approved");
          }
         // nOtify(aPproved);
      } 
      else {
          aPproved = 2;
          plate = "";
          common.wrItelog("No license plate found.");
      }
      renamefile(plate);
    }
  });
}
function renamefile(numplate){
  var imgnew = "";
  if (aPproved == 0) { //not approved
    imgnew = common.getDateTime("FILE") + "_" + numplate + "_NOTAPPROVED.jpg";
  }
  if (aPproved == 1) { //approved
    imgnew = common.getDateTime("FILE") + "_" + numplate + "_APPROVED.jpg";
  }
  if (aPproved == 2) {
    imgnew = common.getDateTime("FILE") + "_NO_PLATE_FOUND.jpg";
  }
  else {
    imgnew = common.getDateTime("FILE") + "_" + numplate + "_ADDED.jpg";
  }
  fs.rename(imgfullpath, jSon.SETTINGS.ALPR_CLOUD.image_path + imgnew, function(err) {
      if ( err ) common.wrItelog('ERROR: ' + err);
  });
}
function trigger_switch(gpio){
  var trigger_data = { "MODE" : "SET", "GPIO" : gpio };
  request.post({
    url : jSon.SETTINGS.SWITCH_HUB.url + ":" + jSon.SETTINGS.SWITCH_HUB.port,
    json : trigger_data
    }, (error, res, body) => {
    if (error) {
      common.wrItelog(error);
      return;
    }
    else {
      return body.value;
    } 
  });
}
function check_closed(gpio,cb){
  var check_data = { "MODE" : "READ", "GPIO" : gpio };
  request.post({
    url : jSon.SETTINGS.SWITCH_HUB.url + ":" + jSon.SETTINGS.SWITCH_HUB.port,
    json : check_data
    }, (error, res, body) => {
    if (error) {
      common.wrItelog(error);
      cb("");
    }
    else {
      cb(body.value);
    } 
  });
}
function nOtify(app){
  if (jSon.SETTINGS.NOTIFICATION.approved == 1 && app == 1){
    common.wrItelog("Vehicle Approved ");
  }
  if (jSon.SETTINGS.NOTIFICATION.not_approved == 1 && app == 0){
    common.wrItelog("Vehicle Not Approved");
  }
}
function removejSon(regnumber){
  delete jSon.REG_NOS[regnumber];
  fs.writeFile(jSonfile, JSON.stringify(jSon, null,2),(err) => {
      if (err) return console.log(err);
      console.log(JSON.stringify(jSon));
      console.log('writing to ' + jSonfile);
    });
}
function rereadjSon (){
  jSon = require(jSonfile);
}
function addjSon (pushdata){
  //common.wrItelog('addjSon');
  jSon.REG_NOs = _.extend(jSon.REG_NOs,pushdata);
  fs.writeFile(jSonfile, JSON.stringify(jSon, null,2), (err) => {
      if (err) return common.wrItelog(err);
      common.wrItelog('writing ' + JSON.stringify(pushdata) + ' to ' + jSonfile);
    });
}