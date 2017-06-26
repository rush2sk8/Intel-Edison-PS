const scpClient = require('scp2');
//scpClient.scp('.', 'root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs', function(err){}); moves stuff in this directory to logs

scpClient.scp('root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs/10.20.0.11 (Mon Jun 06 2016 23:01:59 GMT+0000 (UTC)) rx.log', __dirname+'/allFiles/10.20.0.11 (Mon Jun 06 2016 23:01:59 GMT+0000 (UTC)) rx.log.txt', function(){});
// /scpClient.scp('root:cookiemonster@10.20.0.10:/home/root/.node_app_slot/logs/files.txt', __dirname+'/c.tct', ()=>{});
//const rimraf = require('rimraf');
//rimraf(__dirname+'/10.20.0.10', ()=>{})
 
