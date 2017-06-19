var exec = require('child_process').exec;


var pingCmd = "ping " + "10.20.0.101";
var result = '';

function puts(error, stdout, stderr) {

    console.log(stdout)
 console.log(error)
 console.log(stderr)

}

exec(pingCmd, puts);