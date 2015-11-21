var restify = require("restify");
var groveSensor = require('jsupm_grove');
var server = restify.createServer();

server.use(restify.queryParser());
server.use(restify.bodyParser());

//-------- Input and Output
var button = new groveSensor.GroveButton(4);
var ledRed = new groveSensor.GroveLed(8);
var ledGreen = new groveSensor.GroveLed(3);
var ledBlue = new groveSensor.GroveLed(2);



//------- functions
function respond(req, res, next)  {
    console.log("respond is working");
    var test = button.value();
    ledRed.on();
    res.send({button_value: test});
}

//------- routes
server.get('/test', respond);

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});
