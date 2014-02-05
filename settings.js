var SETTINGS = (function() {
	var private = {
		'GCM_ID': 'AIzaSyCiWYVCwBJVfjg3Y9-CQm4VMe4eO1zsGgM',	//MUST be changed with you GCN_ID
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
