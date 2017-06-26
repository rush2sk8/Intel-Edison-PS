const scpClient = require('scp2');
//scpClient.scp('.', 'root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs', function(err){}); moves stuff in this directory to logs

scpClient.scp('root:cookiemonster@10.20.0.15:/home/root/.node_app_slot/logs/10.20.0.11 (Tue Jun 07 2016 02:01:03 GMT+0000 (UTC)) rx.log', __dirname+'/fie.txt', (err)=>{
  if (err) console.log('err');
});
// /scpClient.scp('root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs/files.txt', __dirname+'/c.tct', ()=>{});
//const rimraf = require('rimraf');
//rimraf(__dirname+'/10.20.0.10', ()=>{})
