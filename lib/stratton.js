var gcm = require('node-gcm');
var mongojs = require('mongojs');
var apn = require('apn');
var SETTINGS = require('../settings');

var GCMSender = new gcm.Sender(SETTINGS.get('GCM_ID'));
var apnOptions = {gateway: SETTINGS.get('APN_GATEWAY')};
var apnConnection = new apn.Connection(apnOptions);

var db = mongojs(SETTINGS.get('MONGO_CONNECTION_DIR'), ['mongojsdb']);
var logs = db.collection(SETTINGS.get('MONGO_CONNECTION_DIR'));

var sendPush = function(pushId, title, key1, value1, key2, value2, key3, value3, key4, value4, key5, value5) {    
	if (pushId.length>64){
		var message = new gcm.Message();
		message.addData('message', 'Powered by Stratto');
		message.addData('title', title);
		message.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		message.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');

		var numKeyValue = arguments.length - 2;   
		if (numKeyValue>3 && numKeyValue<13)
		{
			for (var i = 0; i<numKeyValue; i=i+2)
			{
				message.addDataWithKeyValue(arguments[i+2], arguments[i+3]);
			}
			
			var registrationIds = [];
			registrationIds.push(pushId);
			var pushResult;

			 GCMSender.send(message, registrationIds, 4, function (err, result) {
				if (result.success === 1)
					pushResult = 'OK';
				else
					pushResult = (result.results)[0].error);
			});
			return pushResult;
		}
		else
			return 'Invalid number of arguments';
	}

	else if (pushId.length === 64){		
		var message = new apn.Notification();
		message.expiry = Math.floor(Date.now() / 1000) + 3600; 	
		message.badge = SETTINGS.get('GCM_MSGCNT');
		message.sound = 'ping.aiff';
		message.alert = title;
		message.payload = {key1 :value1, key2: value2};

		var destionationDevice = new apn.Device(pushId);
		apnConnection.pushNotification(message, destionationDevice);

		return 'OK';
	}
};

var saveLog = function (device, pushId, title, message, key1, value1, key2, value2, statusCode, result ){
	var log = {};
	log.date = Date();
	log.pushId = pushId;
	log.title = title;
	log.message = message;
	log.key1 = key1;
	log.key2 = key2;
	log.value1 = value1;
	log.value2 = value2;
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
