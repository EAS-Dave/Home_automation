// to write to log file ------>>>>>>> node server.js > server.log 2>&1
var common = require('./common.js');
var express = require('express');
var app = express();
var fs = require("fs");
var jSon = require("./settings.json");
var gPio = require('onoff').Gpio;
var currentDate = new Date();

app.use(express.static('./'));
app.use(express.json());
app.use(express.urlencoded());

var dEfined_port = jSon.SETTINGS.port
var server = app.listen(dEfined_port, () => {
	var host = server.address().address;
	var port = server.address().port;
	common.wrItelog("listening on http://" + host + ":" + port);
})
//detect motion
/*for (var vAl in jSon.GPIOS) {
	if (jSon.GPIOS[vAl].name == "Motion"){
		const pir = new gPio(jSon.GPIOS[vAl].id, jSon.GPIOS[vAl].mode, "both");
		common.wrItelog ("Detecting Motion on GPIO sensor " +jSon.GPIOS[vAl].name + "(" + jSon.GPIOS[vAl].id + ")");
		pir.watch(function(err, value) {
			if (err) exit();
			//let blinkInterval = setInterval(blinkLED, 250);

			//common.wrItelog("Motion Detected!");
		  
			//if (value == 1) require("./mailer").sendEmail();
		//	setTimeout(endBlink, 15000);
		
		//	function endBlink() {
		//	  clearInterval(blinkInterval);
			  //LED1.writeSync(0);
			  //LED1.unexport();
			  //LED2.writeSync(0);
			  //LED2.unexport();
			  //LED3.writeSync(0);
			  //LED3.unexport();
		  
			  //included when we are working with sensors
			  //pir.unexport();
			  //process.exit();
		//	}
		  });
	}
}*/
app.post('/', (req,res) => {
	var mOde = req.body.MODE;
	var pOststr = 'POST /' + mOde + ' DATA =>         ';
	for (var key in req.body) {
		if (req.body.hasOwnProperty(key)) {
		  	item = req.body[key];
			pOststr = pOststr + " : " + item;
		}
	}
	common.wrItelog(pOststr);
	//load the page data
	if (mOde == "LOAD"){
		for (var vAl in jSon.GPIOS) {
			if (jSon.GPIOS[vAl].type == "monitor"){
				jSon.GPIOS[vAl].state = rEadpInsTate(jSon.GPIOS[vAl].id, jSon.GPIOS[vAl].mode);
			}
		}
		res.send(jSon.GPIOS);
	}
	if (mOde == "SET"){
		var Gpio_timer = jSon.GPIOS[req.body.GPIO].timer;
		var Gpio_mode = jSon.GPIOS[req.body.GPIO].mode;
		var Gpio_id = jSon.GPIOS[req.body.GPIO].id;
		var Gpio_dyn = jSon.GPIOS[req.body.GPIO].dynamic_state;
		var Gpio_state = jSon.GPIOS[req.body.GPIO].state;
		var Gpio_mon = jSon.GPIOS[req.body.GPIO].monitor;
		var pIn = new gPio(Gpio_id, Gpio_mode);
		if (Gpio_timer == 0){
			if (pIn.readSync() == '1'){
				sWitchon();
			}
			else{
				//wrItelog(Gpio_id + Gpio_mode);
				//pIn.writeSync(1);
				sWitchoff();
			}
		}
		else {
			//setting the pIn object up sets the mode and defaults the pin to 0,
			//so at this point its 0, and we just need to set to 1 to switch on
			setTimeout(sWitchoff, Gpio_timer);
		}
		if (Gpio_dyn == "1"){
			var sTate_pin = jSon.GPIOS[Gpio_mon].id;
			var sTate_mode = jSon.GPIOS[Gpio_mon].mode;
			var sTate = rEadpInsTate(sTate_pin, sTate_mode);
			var sTate_text = jSon.GPIOS[Gpio_mon].state_text[sTate];
			common.wrItelog("Returning   " + sTate_text);
			res.send({ "value" : sTate_text.toString()});
		}
		else {
			res.send({"value" : "no_value"});
		}
	}
	function sWitchoff(){
		pIn.writeSync(1);
	}
	function sWitchon(){
		pIn.writeSync(0);
	}
	if (mOde == "READ") {
		//var Gpio_timer = jSon.GPIOS[req.body.GPIO].timer;
		var Gpio_mode = jSon.GPIOS[req.body.GPIO].mode;
		var Gpio_id = jSon.GPIOS[req.body.GPIO].id;
		//var Gpio_dyn = jSon.GPIOS[req.body.GPIO].dynamic_state;
		//var Gpio_state = jSon.GPIOS[req.body.GPIO].state;
		sWitch_val =  rEadpInsTate(Gpio_id, Gpio_mode);
		//console.log(sWitch_val);
		common.wrItelog("Return value :    " + sWitch_val);
		res.send({"value" : sWitch_val.toString()});
	}
})
function rEadpInsTate (id,mode){
	var Gpio_pInstate = new gPio(id, mode);
	var pInstate = Gpio_pInstate.readSync();
	return pInstate;
}
/*function wrItelog(sTrval){
	console.log(getDateTime() + "	" + sTrval);
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
    return year + ":" + month + ":" + day + "	" + hour + ":" + min + ":" + sec;
}*/