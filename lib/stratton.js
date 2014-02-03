var gcm = require('node-gcm');
var mongojs = require('mongojs');
var apn = require('apn');
var Parallel = require('node-parallel');
var SETTINGS = require('../settings');

var GCMSender = new gcm.Sender(SETTINGS.get('GCM_ID'));
var apnOptions = {gateway: SETTINGS.get('APN_GATEWAY')};

var db = mongojs(SETTINGS.get('MONGO_CONNECTION_DIR'), ['mongojsdb']);
var logs = db.collection(SETTINGS.get('MONGO_CONNECTION_DIR'));

var sendPush = function(pushId, title, data, callback) {    
	var regIdsGCM = [];
	var regIdsAPN = [];
	
	var resultGCM = '';
	
	var messageGCM = '' ;
	var messageAPN = '';
	
	var apnConnection = new apn.Connection(apnOptions);

	if (pushId[0].length > 1){
		for (i = 0; i<pushId.length; i++){
			if (pushId[i].length>64)
				regIdsGCM.push(pushId[i]);
			else if (pushId[i].length === 64)
				regIdsAPN.push(pushId[i]);
		}
	}
	else{
		if (pushId.length>64)
			regIdsGCM.push(pushId);
		else if (pushId.length === 64)
			regIdsAPN.push(pushId);
	}	
	
	if ((regIdsGCM[0] != undefined) && (regIdsAPN[0] != undefined)){

		var parallel = new Parallel();	 
		
		messageGCM = new gcm.Message();
		messageGCM.addData('message', 'Powered by Stratton');
		messageGCM.addData('title', title);
		messageGCM.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		messageGCM.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');

		var datalength = data.length;				
		for (var i = 0; i<datalength; i++)
			messageGCM.addDataWithKeyValue(data[i], data[i][0]);
		
		var messageAPN = new apn.Notification();
		messageAPN.expiry = Math.floor(Date.now() / 1000) + 3600; 	
		messageAPN.badge = SETTINGS.get('GCM_MSGCNT');
		messageAPN.sound = 'ping.aiff';
		messageAPN.alert = title;
		
		messageAPN.payload = {'id' : 's'};

		parallel.add(function(done) {
			apnConnection.pushNotification(messageAPN, regIdsAPN);		
			GCMSender.send(messageGCM, regIdsGCM, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
				resultGCM = result;
				done(true);
			});			
		})
				
		parallel.done(function(err, results) {
			apnConnection.on('transmitted', function(){
				if (resultGCM.success === 1)
					callback(true);
				else 
					callback ('ANDROID: ' + (result.results)[0].error);
			})
			apnConnection.on('error', function(){
				if (resultGCM.success === 1)
					callback(true);
				else 
					callback ('ANDROID: ' + (result.results)[0].error + ' IOS: error');
			})
			apnConnection.on('socketError', function(){
				if (resultGCM.success === 1)
					callback(true);
				else 
					callback ('ANDROID: ' + (result.results)[0].error + ' IOS: socketError');
			})
			apnConnection.on('transmissionError', function(){
				if (resultGCM.success === 1)
					callback(true);
				else 
					callback ('ANDROID: ' + (result.results)[0].error + ' IOS: transmissionError');
			})
			apnConnection.on('cacheTooSmall', function(){
				if (resultGCM.success === 1)
					callback(true);
				else 
					callback ('ANDROID: ' + (result.results)[0].error + ' IOS: cacheTooSmall');
			})			
		})
	}

	else if (regIdsGCM[0] != undefined){
		messageGCM = new gcm.Message();
		messageGCM.addData('message', 'Powered by Stratton');
		messageGCM.addData('title', title);
		messageGCM.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		messageGCM.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');

		var datalength = data.length;				
		for (var i = 0; i<datalength; i++)
			messageGCM.addDataWithKeyValue(data[i], data[i][0]);

		GCMSender.send(messageGCM, regIdsGCM, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
			if (result.success == 1)
				callback(true);
			else
				callback((result.results)[0].error);
		});
	}

	else if (regIdsAPN[0] != undefined){		
		messageAPN = new apn.Notification();
		messageAPN.expiry = Math.floor(Date.now() / 1000) + 3600; 	
		messageAPN.badge = SETTINGS.get('GCM_MSGCNT');
		messageAPN.sound = 'ping.aiff';
		messageAPN.alert = title;
		messageAPN.payload = data;

		apnConnection.pushNotification(messageAPN, regIdsAPN);

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
