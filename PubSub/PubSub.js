/****************************************************EDISON 1 2 4 5 6 START*************************************************/
var MasterNodeConnection = require('./MasterNodeConnection.js')

var intervalIDLed;

var dh = function (data) {
  console.log(data)
  const x = data.split(':');
  const d = x[1].split('-')
  if (d[0] == 'but') {

    highPin.write(d[1]==='0' ? 1 : 0);
  }
};
var master = new MasterNodeConnection('10.20.0.128', 9999, '', 'light:button', dh);
master.setLogging(false);
master.startAutomaticDiscovery();

// MRAA, as per usual
var mraa = require('mraa');

var highPin = new mraa.Gpio(45);
highPin.dir(mraa.DIR_OUT);

/****************************************************EDISON 1 2 4 5 6 END**************************************************/

/****************************************************EDISON 03 START***********************************************
//client automatic start
var MasterNodeConnection = require('./MasterNodeConnection.js')


var master = new MasterNodeConnection('10.20.0.128', 9999, 'button:', 'light:', ()=>{});
master.setLogging(false);
master.startAutomaticDiscovery();

// MRAA, as per usual
var mraa = require('mraa');


var but = 0;

var buttonPin = new mraa.Gpio(36);

var highPin = new mraa.Gpio(45);
highPin.dir(mraa.DIR_OUT);

// Set that pin as a digital input (read)
buttonPin.dir(mraa.DIR_IN);


setInterval(function () {
var val = buttonPin.read();

if (val == but) {

but = (val == 0 ? 1 : 0);
master.publishDataToSubscribers('but-' + but);
highPin.write(val);
}
}, 1);

****************************************************EDISON 03 END**************************************************/
