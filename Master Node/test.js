const fs = require('fs');
const jsonexport = require('jsonexport')
const json2csv = require('json2csv');
fs.mkdir(__dirname+'/logs/csv',()=>{});

fs.readdir(__dirname + '/logs/', (err, files)=>{
  files.forEach( file => {

    if(file.includes('.log')){
      var contents = fs.readFileSync(__dirname+ '/logs/'+file, 'utf8');


console.log(contents);

    }
  });
});
