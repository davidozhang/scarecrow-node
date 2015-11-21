var restify = require("restify");
var server = restify.createServer();

server.use(restify.queryParser());
server.use(restify.bodyParser());

function auth(req, res, next) {
	console.log("Authenticated.");
};

function devices(req, res, next)  {
    console.log("Get devices.");
    res.send({device_1: "device 1", device_2: "device_2"});
};

//------- routes
server.get('/devices', devices);
server.post('/auth', auth)

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});