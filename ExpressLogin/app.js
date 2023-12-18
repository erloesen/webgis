var express = require("express")
var app = express();
app.get('/', function(req, res){
	res.send('Hello World, Express is ok!');
});
var server = app.listen(1680, function(){
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listen at http://%s:%s', host, port);
});