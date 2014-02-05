var assert = require('assert');
var restify = require('restify');

var client = restify.createJsonClient({
	url: 'http://localhost:8080',
	version: '0.0.1'
});

client.post('/push', {title: 'My First Push', message: 'Powered By Stratton',  
pushId:'INSERT-YOUR-PUSH-KEY'
}, function(err, req, res, data) {
	assert.ifError(err); 
	console.log (new Date().toJSON().slice(0,10) + '  ' + new Date().toLocaleTimeString()  + '  POST: /push ' + res.statusCode);
});
