var restify = require('restify');
var stratton = require('stratton');

var ip_addr = '127.0.0.1'; // 0.0.0.0 to allow external connections
var port = '8080';

var server = restify.createServer({
	name : 'Node RESTful Cross-Platform Push Server',
	version: '0.0.1'
});
 
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.post({path : '/push' , version: '0.0.1'}, sendPush);

function sendPush(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	var data = {'title' : req.params.title, 'message' : req.params.message};

	stratton.sendPush(req.params.pushId, data, function (result){
		if (result===true){
			res.send(201);
			console.log (new Date().toJSON().slice(0,10) + ' ' + new Date().toLocaleTimeString() + ' POST: /push ' + res.statusCode);
			return next();    
		}
		else{
			console.log (new Date().toJSON().slice(0,10) + ' ' + new Date().toLocaleTimeString() + ' POST: /push ' + '409');
			return next(new restify.InvalidArgumentError(result));
		}
	});
}

server.listen(port, ip_addr, function(){
    console.log('%s listening at %s ', server.name, server.url);
});
