/****************************************************MAIN****************************************************/
const ip = '10.20.0.11';
const port = 1337;
var intervalIDLed ;
var dh = function(data){
     var rate = parseFloat(data.split(':')[1]);
     clearInterval(intervalIDLed);
     intervalIDLed = setInterval(writeLed, rate);
    
};

var Client = require('./PubSub.js');
var client = new Client(ip, port,dh);
client.run();


// MRAA, as per usual
var mraa = require('mraa');


// Set up a digital output on MRAA pin 20 (GP12)
var ledPin = new mraa.Gpio(20); // create an object for pin 20
ledPin.dir(mraa.DIR_OUT);  // set the direction of the pin to OUPUT


var BlinkNormalMs = 1000.0 / 5.0;
var BlinkAlertMs = 1000.0 / 50.0;

var analogIn;
var lightThreshold = 0.8;
var lightSensorState = 1;  // 1 = above threshold, 0 = below

// global variable for pin state
var ledState = 0;
function writeLed() {
    // toggle state of led
    ledState = (ledPin.read() ? 0 : 1);
    // set led value
    ledPin.write(ledState);
}

intervalIDLed = setInterval(writeLed, BlinkNormalMs);  // start the periodic read



/**************************************************END MAIN**************************************************/