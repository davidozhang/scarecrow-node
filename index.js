var restify = require("restify");
var groveSensor = require('jsupm_grove');
var upmBuzzer = require("jsupm_buzzer");
var server = restify.createServer();
var request = require('request');

server.use(restify.queryParser());
//server.use(restify.bodyParser());
server.use(restify.bodyParser({ mapParams: true }));

//-------- Input and Output
var button = new groveSensor.GroveButton(4);
var ledRed = new groveSensor.GroveLed(8); //device 1
var ledGreen = new groveSensor.GroveLed(3); //device 2
var ledBlue = new groveSensor.GroveLed(2); //device 3
var myBuzzer = new upmBuzzer.Buzzer(6);


//----- global vars
var isUserAuthenticated = false;
var pythonServer = "http://192.168.65.220:5000";
//var isRedON = false;
//var isGreenON = false;
//var isBlueON = false;

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
            ledRed.on();
        }
        else {
            console.log("turn off RED");
            ledRed.off();
        }
    } else if (device == "Optional(\"device_2\")"){
        if(devicestatus == "on") {
            console.log("turn on Green");
            ledGreen.on();
        }
        else {
            console.log("turn on Green");
            ledGreen.off();
        }
    } else if(device == "Optional(\"device_3\")"){
        if(devicestatus == "on"){
            console.log("turn on Blue")
            ledBlue.on();
        }
        else {
            console.log("turn off Blue")
            ledBlue.off();
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
                    }
                })
            }
        }, 7000);
    }
}


//var blueflag = false;
//var redflag = false;
//var greenflag = false;


//function lightsController(){
//    if(isGreenON){
//        if(greenflag){
//            ledGreen.off();
//            console.log('greenoff');
//            greenflag == false;
//        }else{
//            ledGreen.on();
//            console.log('greentrue');
//            greenflag == true;
//        }
//    }
//    if(isRedON){
//        if(redflag){
//            ledRed.off();
//            redflag == false;
//        }else{
//            ledRed.on();
//            redflag == false;
//        }
//    }
//    if(isBlueON){
//        if(blueflag){
//            ledBlue.off();
//            blueflag == false;
//        }else{
//            ledBlue.on();
//            blueflag == true;
//        }
//    }
//}

//setInterval(lightsController, 1000);

function reset(req, res, next) {
    isUserAuthenticated = false;
    res.send('reset');
}

//------- routes
server.get('/test', respond);
server.get('/devices', devices);
server.post('/auth', auth);
server.post('/devices', devicescontroller);
server.get('/devicestatus', devicestatus);
server.post('/reset', reset);


var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});