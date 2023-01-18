var Client = require('ftp');
 
var c = new Client();
c.on('data/output/Camera1', function() {
  c.list(function(err, list) {
    if (err) throw err;
    console.dir(list);
    c.end();
  });
});
// connect to localhost:21 as anonymous
c.connect({user : 'admin', password : '', host : '192.168.1.151', port : 21});