Stratton
========

A Node.js module for interfacing with Apple Push Notification and Google Cloud Messaging services.

<h3>Installation </h3>
$ npm install stratton

Features
•	Powerful and intuitive.
•	Multi platform push sends.
•	Automatically detects destination device type.
•	Unified error handling.

Usage

First of all:

IOS: replace cert.txt and key.txt files on stratton folder with your cert.pem and key.pem. 
ANDROID: Add to SETTINGS.js your API SERVER KEY  on stratton folder.

Import stratton module:

var stratton = requiere('stratton);

Define destination device ID. You can send to multiple devices, independently of platform, creating an array with different destination device IDs.

// Single destination
pushId = 'INSERT_YOUR_DEVICE_ID';

// Multiple destinations
pushId = [];
pushId.push('INSERT_YOUR_DEVICE_ID');
pushId.push('INSERT_OTHER_DEVICE_ID');


Next, create a JSON object witch MUST contain, at least, a title and message. 

data = {title: 'My First Push' , message: 'Powered by stratton', otherfields: 'add more fields if you want');

Finally send a push notificacion and catch response:

stratton.sendPush(pushId, data, function (result){
	console.log(result);
});

result will contain 'true' or 'an error description'.

