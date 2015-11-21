var restify = require("restify");
var server = restify.createServer();

server.use(restify.queryParser());
server.use(restify.bodyParser());


function respond(req, res, next)  {
    console.log("respond works")
    res.send({hello: "itworks"});
}

//------- routes
server.get('/send', respond);

var port = process.env.PORT || 8080;
server.listen(port, function() {
    console.log("Listening on " + port);
});