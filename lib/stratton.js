var gcm = require('node-gcm');
var apn = require('apn');
var Parallel = require('node-parallel');
var SETTINGS = require('../settings');

var GCMSender = new gcm.Sender(SETTINGS.get('GCM_ID'));
var apnOptions = {gateway: SETTINGS.get('APN_GATEWAY')};

var sendPush = function(pushId, title, data, callback) {   
	var regIdsGCM = [];
	var regIdsAPN = [];
	
	var messageGCM = '' ;
	var messageAPN = '';

	var apnConnection = new apn.Connection(apnOptions);
	var parallel = new Parallel();	

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
			messageAPN.expiry = Math.floor(Date.now() / 1000) + 3600; 	
			messageAPN.badge = SETTINGS.get('GCM_MSGCNT');
			messageAPN.sound = 'ping.aiff';
			messageAPN.alert = title;
			messageAPN.payload = {'id' : 's'};
	}

	if (regIdsGCM[0] != undefined){	
		messageGCM = new gcm.Message();
		messageGCM.addData('message', 'Powered by Stratton');
		messageGCM.addData('title', title);
		messageGCM.addData('msgcnt', SETTINGS.get('GCM_MSGCNT'));
		messageGCM.timeToLive = SETTINGS.get('GCM_TIMETOLIVE');

		var datalength = data.length;				
		for (var i = 0; i<datalength; i++)
			messageGCM.addDataWithKeyValue(data[i], data[i][0]);
		
		parallel.add(function(done){
			GCMSender.send(messageGCM, regIdsGCM, SETTINGS.get('GCM_RETRIES'), function (err, result) {	
				if (regIdsAPN[0] != undefined){
					apnConnection.pushNotification(messageAPN, regIdsAPN);		
				}
				done(err, result);
			});			
		})
	}
	else if (regIdsAPN[0] != undefined)
	{	parallel.add(function(done){
			apnConnection.pushNotification(messageAPN, regIdsAPN);	
			done('Powered by','Stratton');
		})
	}

	parallel.done(function(err, results){
		if (regIdsAPN[0] != undefined){
			apnConnection.on('transmitted', function(){
				if (regIdsGCM[0] != undefined){
					if (results[0].success === 1)
						callback(true);
					else
						callback ('ANDROID: ' + (result.results)[0].error);
				}
				else
					callback(true);
			})
			apnConnection.on('error', function(){
				if (regIdsGCM[0] != undefined){
					if (resultGCM.success === 1)
						callback('IOS: error');
					else
						callback ('ANDROID: ' + (result.results)[0].error + ' IOS: error');
				}
				else
					callback('IOS: error');
			})
			apnConnection.on('socketError', function(){
				if (regIdsGCM[0] != undefined){
					if (resultGCM.success === 1)
						callback('IOS: socketError');
					else
						callback ('ANDROID: ' + (result.results)[0].error + ' IOS: socketError');
				}
				else
					callback('IOS: socketError');
			})
			apnConnection.on('transmissionError', function(){
				if (regIdsGCM[0] != undefined){
					if (resultGCM.success === 1)
						callback('IOS: transmissionError');
					else
						callback ('ANDROID: ' + (result.results)[0].error + ' IOS: transmissionError');
				}
				else
					callback('IOS: transmissionError');
			})
			apnConnection.on('cacheTooSmall', function(){
				if (regIdsGCM[0] != undefined){
					if (resultGCM.success === 1)
						callback('IOS: cacheTooSmall');
					else
						callback ('ANDROID: ' + (result.results)[0].error + ' IOS: cacheTooSmall');
				}
				else
					callback('IOS: cacheTooSmall');
			})	
		}
		else{
			if (results[0].success === 1)
				callback(true);
			else
				callback ('ANDROID: ' + (result.results)[0].error);
		}
	})
};

exports.sendPush = sendPush;
