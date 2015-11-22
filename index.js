var restify = require("restify");
var groveSensor = require('jsupm_grove');
var upmBuzzer = require("jsupm_buzzer");
var server = restify.createServer();
var request = require('request');
var upmMicrophone = require("jsupm_mic");



server.use(restify.queryParser());
//server.use(restify.bodyParser());
server.use(restify.bodyParser({ mapParams: true }));

//-------- Input and Output
var button = new groveSensor.GroveButton(4);
var ledRed = new groveSensor.GroveLed(8); //device 1
var ledGreen = new groveSensor.GroveLed(3); //device 2
var ledBlue = new groveSensor.GroveLed(2); //device 3
var myBuzzer = new upmBuzzer.Buzzer(6);
var myMic = new upmMicrophone.Microphone(0);


//----- global vars
var isUserAuthenticated = false;
var pythonServer = "http://192.168.65.220:5000";
var isRedON = false;
var isGreenON = false;
var isBlueON = false;

//---- Mic setup
var threshContext = new upmMicrophone.thresholdContext;
threshContext.averageReading = 0;
threshContext.runningAverage = 0;
threshContext.averagedOver = 2;


var is_running = false;
//Infinite loop, ends when script is cancelled
//Repeatedly, take a sample every 2 microseconds;
//find the average of 128 samples; and
//print a running graph of the averages

//function mictest(){
//    var buffer = new upmMicrophone.uint16Array(128);
//    var len = myMic.getSampledWindow(2, 128, buffer);
//    if (len)
//    {
//        var thresh = myMic.findThreshold(threshContext, 30, buffer, len);
////        myMic.printGraph(threshContext);
//        if (thresh)
////            console.log("Threshold is " + thresh);
//        if (thresh > 300) isUserAuthenticated = true;
//    }
//};
//
//micinterval = setInterval(mictest, 1000);



//------- functions
function auth(req, res, next) {
    isUserAuthenticated = true;
    interval = setInterval(readButtonValue, 1000);
    console.log("Authenticated.");
    res.send("success");
};

function respond(req, res, next)  {
    console.log("respond is working");
    var test = button.value();
    ledRed.on();
    res.send({button_value: test});
}

function devices(req, res, next)  {
    console.log("Get devices.");
    res.send({devices:[{device: "device 1"},
                       {device: "device_2"},
                       {device: "device_3"}]
            });
};

function devicescontroller(req, res, next)  {
    var device = req.params.device;
    var devicestatus = req.params.setStatus;
    console.log(device);
    console.log(devicestatus);

    if(device == "Optional(\"device_1\")"){
        if(devicestatus == "on") {
            console.log("turn on RED");
//            ledRed.on();
            isRedON = true;
        }
        else {
            console.log("turn off RED");
            ledRed.off();
            isRedON = false;
        }
    } else if (device == "Optional(\"device_2\")"){
        if(devicestatus == "on") {
            console.log("turn on Green");
//            ledGreen.on();
              isGreenON = true;
        }
        else {
            console.log("turn on Green");
            ledGreen.off();
              isGreenON = false;
        }
    } else if(device == "Optional(\"device_3\")"){
        if(devicestatus == "on"){
            console.log("turn on Blue")
//            ledBlue.on();
            isBlueON = true;
        }
        else {
            console.log("turn off Blue")
            ledBlue.off();
            isBlueON = false;
        }
    }else{
        console.log("error");
        res.send("error")
    }
    res.send("done")
};

function buzzer(){
    var chords = [];
    chords.push(upmBuzzer.DO);
    chords.push(upmBuzzer.RE);
    chords.push(upmBuzzer.MI);
    chords.push(upmBuzzer.FA);
    chords.push(upmBuzzer.SOL);
    chords.push(upmBuzzer.LA);
    chords.push(upmBuzzer.SI);
    chords.push(upmBuzzer.DO);
    chords.push(upmBuzzer.SI);
    var chordIndex = 0;

// Print sensor name
    console.log(myBuzzer.name());

    if (chords.length != 0)
    {
        //Play sound for one second
        console.log( myBuzzer.playSound(chords[chordIndex], 1000000) );
        chordIndex++;
        //Reset the sound to start from the beginning.
        if (chordIndex > chords.length - 1)
            chordIndex = 0;
    }
}

function devicestatus() {

}

//------- button callback

var interval = setInterval(readButtonValue, 1000);

function readButtonValue() {
    if(button.value()){
        console.log("button is press");
        isUserAuthenticated = false;
        clearInterval(interval);
        request(pythonServer + '/takeimage' , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('take an image');
            }
        })

        // run the buzzer after 3 seconds if user is not authenticated
        setTimeout(function(){
            if(!isUserAuthenticated){
                buzzer();
                request(pythonServer + '/sendtotwitter' , function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log('sent to twitter');
                        isGreenON = true;
                        isBlueON = true;
                        isRedON = true;
                    }
                })
            }
        }, 7000);
    }
}


var blueflag = false;
var redflag = false;
var greenflag = false;

function lightsController(){
    if(isGreenON){
        if(greenflag){
            ledGreen.on();
//            console.log('green is on');
            greenflag = false;
        }else{
            ledGreen.off();
//            console.log('green is off');
            greenflag = true;
        }
    }

    if(isRedON){
        if(redflag){
            ledRed.on();
//            console.log('red is on');
            redflag = false;
        }else{
            ledRed.off();
//            console.log('red is off');
            redflag = true;
        }
    }

    if(isBlueON){
        if(blueflag){
            ledBlue.on();
//            console.log('blue is on');
            blueflag = false;
        }else{
            ledBlue.off();
//            console.log('blue is off');
            blueflag = true;
        }
    }

}

setInterval(lightsController, 300);

function reset(req, res, next) {
    isUserAuthenticated = false;
    ledBlue.off();
    ledRed.off();
    ledGreen.off();
    isBlueON = false;
    isRedON = false;
    isGreenON = false;
    res.send('reset');
}

function authStatus(req, res, next){
    res.send({authStatus : isUserAuthenticated});
}


//------- routes
server.get('/test', respond);
server.get('/devices', devices);
server.post('/auth', auth);
server.post('/devices', devicescontroller);
server.get('/devicestatus', devicestatus);
server.post('/reset', reset);
server.get('/auth', authStatus);


var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});
