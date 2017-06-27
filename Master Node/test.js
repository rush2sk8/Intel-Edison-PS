


//var child = require('child_process').spawn;//.spawn('pscp -r -scp -pw cookiemonster root@10.20.0.11:/home/root/.node_app_slot/logs .');
//child('pscp', ['-r', '-scp', '-pw cookiemonster', 'root@10.20.0.11:/home/root/.node_app_slot/logs', '.'])
//console.log('d');

const ips = ['10.20.0.10', '10.20.0.11', '10.20.0.12'];
var i = 0;

var runSCP = function () {
  if(i < ips.length){
    const {spawn} = require('child_process')
    const scp = spawn('pscp', ['-r', '-scp', '-pw' ,'cookiemonster', 'root@'+ips[i]+':/home/root/.node_app_slot/logs', '.'])
    scp.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    scp.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    scp.on('close', (code) => {

      i++;
      runSCP();
    });
  }else{
    finish();
  }
}
runSCP();

function finish() {
  const rimraf = require('rimraf');
  rimraf(__dirname+'/logs/', ()=>{})
  console.log('done');
}


// /scpClient.scp('root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs/files.txt', __dirname+'/c.tct', ()=>{});
//const rimraf = require('rimraf');
//rimraf(__dirname+'/10.20.0.10', ()=>{})
