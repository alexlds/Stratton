var SETTINGS = (function() {
	var private = {
		'GCM_ID': 'PUT-YOUR-GCM-SERVER-API-KEY',	
		'GCM_MSGCNT': '1',
		'GCM_RETRIES': 4,
		'GCM_TIMETOLIVE': 3000,	// Duration in seconds to hold in GCM and retry before timing out.
		'GCM_DELAYWHILEIDLE' : false,
		'APN_GATEWAY': 'gateway.sandbox.push.apple.com',
		'APN_EXPIRY' : 3600, // Duration in seconds before expiry
		'APN_SOUND': 'ping.aiff',
		'BB10_APPID' : 'PUT-YOUR-BB10-APP-ID',
		'BB10_PASSWORD' : 'PUT-YOUR-BB10-APP-BB10_PASSWORD',
		'BB10_CPID' : 'PUT-YOUR-BB10-APP-CPID',
		'BB10_APPNAME' : 'PUT-YOUR-BB10-APP-NAME',
		'BB10_DELIVERYMETHOD' : 'unconfirmed'
	};
	return {
		get: function(name) { return private[name]; }
    };
})();

module.exports.get = SETTINGS.get;
