var gcm = require('node-gcm');
var apn = require('apn');
var Parallel = require('node-parallel');
var SETTINGS = require('../settings');

var GCMSender = new gcm.Sender(SETTINGS.get('GCM_ID'));
var apnOptions = {gateway: SETTINGS.get('APN_GATEWAY')};

var sendPush = function(pushId, data, callback) {   
	var regIdsGCM = [];
	var regIdsAPN = [];

	var messageGCM = '' ;
	var messageAPN = '';

	var apnConnection = new apn.Connection(apnOptions);
	var parallel = new Parallel();	
	parallel.timeout(3000);

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

	if (regIdsAPN[0] != undefined){
			messageAPN = new apn.Notification();
			messageAPN.expiry = Math.floor(Date.now() / 1000) +  SETTINGS.get('APN_EXPIRY'); 	// 1 hour
			messageAPN.badge = SETTINGS.get('GCM_MSGCNT');
			messageAPN.sound = SETTINGS.get('APN_SOUND');
			messageAPN.alert = data.title;
			messageAPN.payload = data;
	}

	if (regIdsGCM[0] != undefined){	
		var messageGCM = new gcm.Message({
			delayWhileIdle: SETTINGS.get('GCM_DELAYWHILEIDLE'),
			timeToLive: SETTINGS.get('GCM_TIMETOLIVE'),
			data: data
		});
		messageGCM.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));

		parallel.add(function(done){
			GCMSender.send(messageGCM, regIdsGCM, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
			if (result.success === 1)
				done(0,1);
			else
				done(0, ' ANDROID: ' + (result.results)[0].error);
			});			
		})
	}
	
	if (regIdsAPN[0] != undefined){
		apnConnection.pushNotification(messageAPN, regIdsAPN);	

		parallel.add(function(done){
			apnConnection.on('error', function(){
				done(0,' IOS: error');
			});
			apnConnection.on('socketError', function(){
				done(0,' IOS: socketError');
			});
			apnConnection.on('transmissionError', function(){
				done(0,' IOS: transmissionError' );
			});
			apnConnection.on('cacheTooSmall', function(){
				done(0,' IOS: cacheTooSmall');
			});
		})
	}

	parallel.done(function(err, results){
		var pushResult ='';
		for (i=0; i<results.length; i++){
			if (results[i] != 1)
				pushResult = pushResult + results[i];
		}
		if (pushResult.length > 1)
			callback(pushResult);
		else
			callback(true);
	})
};

exports.sendPush = sendPush;
