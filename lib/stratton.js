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
	var gcmRegIds = [];
	var apnRegIds = [];
	var message;
	console.log(gcmRegIds);
	
	if (pushId[0].length > 1){
		for int (i = 0, i<pushId.length; i++){
			if (pushId[i].length>64)
				gcmRegIds.push(pushId[i]);
			else if (pushId[i].length === 64)
				apnRegIds.push(pushId[i]);
		}
	}
	else{
		if (pushId.length>64)
			gcmRegIds.push(pushId);
		else if (pushId.length === 64)
			apnRegIds.push(pushId);
	}
	
	if (gcmRegIds != undefined){
		message = new gcm.Message();
		message.addData('message', 'Powered by Stratton');
		message.addData('title', title);
		message.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		message.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');
		
		var datalength = data.length;				
		for (var i = 0; i<datalength; i++)
			message.addDataWithKeyValue(data[i], data[i][0]);
			
		GCMSender.send(message, gcmRegIds, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
			if (result.success == 1)
				callback(true);
			else
				callback((result.results)[0].error);
		});
	}

	else if (apnRegId != undefined){		
		message = new apn.Notification();
		message.expiry = Math.floor(Date.now() / 1000) + 3600; 	
		message.badge = SETTINGS.get('GCM_MSGCNT');
		message.sound = 'ping.aiff';
		message.alert = title;
		message.payload = data;
		
		var destionationDevices = new apn.Device(apnRegIds);
		apnConnection.pushNotification(message, destionationDevices);
		
		apnConnection.on('transmitted',callback(true));
		apnConnection.on('error', callback('error'));
		apnConnection.on('socketError', callback('socketError'));
		apnConnection.on('transmissionError', callback('transmissionError'));
		apnConnection.on('cacheTooSmall', callback('cacheTooSmall')); 	
	}
};

var saveLog = function (device, pushId, title, data, statusCode, result ){
	var log = {};
	log.date = Date();
	log.pushId = pushId;
	log.title = title;
	log.data = data;
	log.statusCode = statusCode;
	log.result = result;
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

