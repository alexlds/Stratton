var SETTINGS = (function() {
	var private = {
		'GCM_ID': 'INSERT YOUT GCN_ID',	
		'GCM_MSGCNT': '1',
		'APN_GATEWAY': 'gateway.sandbox.push.apple.com',
		'GCM_TIMETOLIVE': 3000,	// Duration in seconds to hold in GCM and retry before timing out.
		'MONGO_CONNECTION_DIR' : '127.0.0.1:27017/mongojsdb',
		'MONGO_DB_NAME' : 'logs'
	};
	return {
		get: function(name) { return private[name]; }
    };
})();


module.exports.get = SETTINGS.get;


