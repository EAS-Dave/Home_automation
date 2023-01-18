
////EXPORT FUNCTIONS
module.exports = {
    wrItelog : function (sTrval){
        console.log(this.getDateTime("LOG") + "	" + sTrval);
    },
    getDateTime : function (mode) {
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
        if (mode == "LOG"){
        return year + ":" + month + ":" + day + "	" + hour + ":" + min + ":" + sec;
        }
        if (mode == "FILE"){
        return year + "-" + month + "-" + day + "_" + hour + "" + min + "" + sec;
        }
    }
};