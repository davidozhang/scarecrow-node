var restify = require("restify");
var groveSensor = require('jsupm_grove');
var upmBuzzer = require("jsupm_buzzer");
var server = restify.createServer();
var schedule = require('node-schedule');

server.use(restify.queryParser());
server.use(restify.bodyParser());

//-------- Input and Output
var button = new groveSensor.GroveButton(4);
var ledRed = new groveSensor.GroveLed(8); //device 1
var ledGreen = new groveSensor.GroveLed(3); //device 2
var ledBlue = new groveSensor.GroveLed(2); //device 3
var myBuzzer = new upmBuzzer.Buzzer(6);




function auth(req, res, next) {
	console.log("Authenticated.");
};

//------- functions
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
    var deviceNumber = req.params.device;
    var devicestatus = req.params.setStatus;

    if(deviceNumber == "device 1"){
        if(devicestatus == "on") {
            console.log("turn on RED");
            ledRed.on();
        }
        else {
            console.log("turn off RED");
            ledRed.off();
        }
    }else if (deviceNumber == "device 2"){
        if(devicestatus == "on") {
            console.log("turn on Green");
            ledGreen.on();
        }
        else {
            console.log("turn on Green");
            ledGreen.off();
        }
    }else if( deviceNumber == "device 3" ){
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
    buzzer();
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


//------- routes
server.get('/test', respond);
server.get('/devices', devices);
server.post('/auth', auth);
server.post('/devices', devicescontroller);
server.get('/devicestatus', devicestatus);

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});