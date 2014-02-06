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
	};
	return {
		get: function(name) { return private[name]; }
    };
})();

module.exports.get = SETTINGS.get;