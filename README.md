Stratton
========

A Node.js module for interfacing with Apple Push Notification and Google Cloud Messaging services.

## Installation 
$ npm install stratton

#Features
<ul>
<li>Powerful and intuitive.</li>
<li>Multi platform push sends.</li>
<li>Automatically detects destination device type.</li>
<li>Unified error handling.</li>
</ul>

## Usage 
First of all:
```
IOS: replace cert.txt and key.txt files on stratton folder with your cert.pem and key.pem. 
ANDROID: Add to SETTINGS.js your API SERVER KEY  on stratton folder.
```
Import stratton module:
```
var stratton = requiere('stratton);
```

Define destination device ID. You can send to multiple devices, independently of platform, creating an array with different destination device IDs.
```
// Single destination
pushId = 'INSERT_YOUR_DEVICE_ID';

// Multiple destinations
pushId = [];
pushId.push('INSERT_YOUR_DEVICE_ID');
pushId.push('INSERT_OTHER_DEVICE_ID');
```

Next, create a JSON object witch MUST contain, at least, a title and message. 
```
data = {title: 'My First Push' , message: 'Powered by stratton', otherfields: 'add more fields if you want');
```
Finally send a push notificacion and catch response:
```
stratton.sendPush(pushId, data, function (result){
	console.log(result);
});
```
Result will contain 'true' or 'an error description'.
