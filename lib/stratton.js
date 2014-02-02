var gcm = require('node-gcm');
var mongojs = require('mongojs');
var apn = require('apn');
var SETTINGS = require('../settings');

var GCMSender = new gcm.Sender(SETTINGS.get('GCM_ID'));
var apnOptions = {gateway: SETTINGS.get('APN_GATEWAY')};
var apnConnection = new apn.Connection(apnOptions);

var db = mongojs(SETTINGS.get('MONGO_CONNECTION_DIR'), ['mongojsdb']);
var logs = db.collection(SETTINGS.get('MONGO_CONNECTION_DIR'));

var sendPush = function(pushId, title, data, callback) {    
	if (pushId.length>64){
		var message = new gcm.Message();
		message.addData('message', 'Powered by Stratton');
		message.addData('title', title);
		message.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		message.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');
		
		var datalength = data.length;				
		for (var i = 0; i<datalength; i++)
			message.addDataWithKeyValue(data[i], data[i][0]);
			
		var registrationIds = [];
		registrationIds.push(pushId);
		GCMSender.send(message, registrationIds, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
			if (result.success == 1)
				callback(true);
			else
				callback((result.results)[0].error);
		});
	}

	else if (pushId.length === 64){		
		var message = new apn.Notification();
		message.expiry = Math.floor(Date.now() / 1000) + 3600; 	
		message.badge = SETTINGS.get('GCM_MSGCNT');
		message.sound = 'ping.aiff';
		message.alert = title;
		message.payload = {'Key' : 'Value', 'Key': 'Value'};
		
		var destionationDevice = new apn.Device(pushId);
		apnConnection.pushNotification(message, destionationDevice);
		
		apnConnection.on('transmitted',callback(true));
		apnsConnection.on('error', callback('error'));
		apnsConnection.on('socketError', callback('socketError'));
		apnsConnection.on('transmissionError', callback('transmissionError'));
		apnsConnection.on('cacheTooSmall', callback('cacheTooSmall')); 	
	}
};

var saveLog = function (device, pushId, title, message, data, statusCode, result ){
	var log = {};
	log.date = Date();
	log.pushId = pushId;
	log.title = title;
	log.message = message;
	log.data = data;
	log.statusCode = statusCode;
	log.result = result;
	if(pushId[0].length === 1)
		log.device = 'MULTIPUSH';
	else if(pushId.length === 64)
		log.device = 'IOS';
	else
		log.device = 'ANDROID';
	logs.save(log);
};

var getAllLogs = function(){
    logs.find().limit(500).sort({postedOn : -1} , function(err, success){
		return ([err, success]);
    });
}


exports.sendPush = sendPush;
exports.saveLog = saveLog;
exports.getAllLogs = getAllLogs;
