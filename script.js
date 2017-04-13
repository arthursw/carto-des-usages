var spacebrew = null

let rennesLatMin = 48.076603
let rennesLatMax = 48.147877
let rennesLatHeight = rennesLatMax - rennesLatMin
let rennesLongMin = -1.753280
let rennesLongMax = -1.591461
let rennesLongWidth = rennesLongMax - rennesLongMin

// var tipiSocket = new WebSocket("ws://localhost:8025/tipibot");
var tipiSocket = null;

console.nativeLog = console.log;
console.nativeError = console.error;

console.log = function(message) {
	debugEl = document.getElementById("debug")
	debugEl.innerHTML += '<div>' + message + '</div>'
	console.nativeLog(message);
}

console.error = function(message) {
	debugEl = document.getElementById("debug")
	debugEl.innerHTML += '<div class="error">' + message + '</div>'
	console.nativeError(message);
}

window.onerror = function(error, url, line) {
	debugEl = document.getElementById("debug")
	debugEl.innerHTML += '<div class="error"><span class="line">' + line + '</span>: <span class="url">' + url + '</span>: ' + error + '</div>'
};

function connectWebsocket() {
	let url = document.getElementsByName('websocket-url')[0].value
	
	if(tipiSocket != null && tipiSocket.readyState == WebSocket.OPEN) {
		tipiSocket.close();
	}
	tipiSocket = new WebSocket("wss://"+url);
}

function sendSpacebrewCommand(data) {
	let json = JSON.stringify(data)
	console.log("Spacebrew: " + json)
	// spacebrew.send("command", "string", json)

	if(tipiSocket.readyState == WebSocket.OPEN){
		tipiSocket.send(json);
	}

}

function getLocation() {
    console.log("get location")
    if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(showPosition)
        // navigator.geolocation.watchPosition(showPosition, geo_error, {enableHighAccuracy:true, maximumAge:1000, timeout:1000});
    } else {
    	let info = document.getElementById("info");
        info.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
	console.log("position.coords: long: " + position.coords.longitude + ", lat: " + position.coords.latitude)
	sendSpacebrewGotoCommand(position.coords)
	let info = document.getElementById("info");
    info.innerHTML = "Latitude: " + position.coords.latitude +
    "<br>Longitude: " + position.coords.longitude;
}

var gpsOn = false;
var gpsTimerId = -1;

function GPSoffClicked() {
	let gpsOnBtn = document.getElementById("GPSon");
	let gpsOffBtn = document.getElementById("GPSoff");
	gpsOnBtn.className = '';
	gpsOffBtn.className = 'hidden';
	gpsOn = false;
	let gpsStatus = document.getElementById("gps-status");
	gpsStatus.innerHTML = "Not sending GPS locations."
	clearInterval(gpsTimerId);
}

function GPSonClicked() {
	let gpsOnBtn = document.getElementById("GPSon");
	let gpsOffBtn = document.getElementById("GPSoff");
	gpsOnBtn.className = 'hidden';
	gpsOffBtn.className = '';
	gpsOn = true;
	let gpsStatus = document.getElementById("gps-status");
	gpsStatus.innerHTML = "Sending GPS locations."
	gpsTimerId = setInterval(getLocation, 10000)
}

// function setBounds() {
// 	rennesLatMin = document.getElementsByName('min-lat')[0].value
// 	rennesLatMax = document.getElementsByName('max-lat')[0].value
// 	rennesLongMin = document.getElementsByName('min-long')[0].value
// 	rennesLongMax = document.getElementsByName('max-long')[0].value
// }

function sendSpacebrewPenCommand(direction) {

	data = {
		type: 'pen',
		direction: direction
	}
	sendSpacebrewCommand(data)
}
function sendSpacebrewPenDownCommand() {
	sendSpacebrewPenCommand('down')
}
function sendSpacebrewPenUpCommand() {
	sendSpacebrewPenCommand('up')
}

function sendSpacebrewLocation() {
	let long = parseFloat(document.getElementsByName('long')[0].value)
	let lat = parseFloat(document.getElementsByName('lat')[0].value)

	let p = { longitude: long, latitude: lat }
	sendSpacebrewGotoCommand(p)
}

function sendSpacebrewGotoCommand(coords) {
	// x = (coords.longitude - rennesLongMin) / rennesLongWidth
	// y = (coords.latitude - rennesLatMin) / rennesLatHeight

	let newRennesLatMin = parseFloat(document.getElementsByName('min-lat')[0].value)
	let newRennesLatMax = parseFloat(document.getElementsByName('max-lat')[0].value)
	let newRennesLongMin = parseFloat(document.getElementsByName('min-long')[0].value)
	let newRennesLongMax = parseFloat(document.getElementsByName('max-long')[0].value)

	rennesLatMin = Number.isFinite(newRennesLatMin) ? newRennesLatMin : rennesLatMin
	rennesLatMax = Number.isFinite(newRennesLatMax) ? newRennesLatMax : rennesLatMax
	rennesLongMin = Number.isFinite(newRennesLongMin) ? newRennesLongMin : rennesLongMin
	rennesLongMax = Number.isFinite(newRennesLongMax) ? newRennesLongMax : rennesLongMax

	rennesLongWidth = rennesLongMax - rennesLongMin
	rennesLatHeight = rennesLatMax - rennesLatMin

	if(!Number.isFinite(coords.longitude) || coords.longitude < rennesLongMin) {
		coords.longitude = rennesLongMin;
	}
	if(coords.longitude > rennesLongMax) {
		coords.longitude = rennesLongMax;
	}
	if(!Number.isFinite(coords.latitude) || coords.latitude < rennesLatMin) {
		coords.latitude = rennesLatMin;
	}
	if(coords.latitude > rennesLatMax) {
		coords.latitude = rennesLatMax;
	}
	data = {
		type: 'goTo',
		point: { x: coords.longitude, y: coords.latitude },
		bounds: { x: rennesLongMin, y: rennesLatMin, width: rennesLongWidth, height: rennesLatHeight },
		scale: { x: 1, y: -1 },
		offset: { x: 0, y: -rennesLatHeight }
	}
	sendSpacebrewCommand(data)
}

function closeConsole(event) {
	let console = document.getElementById('console');
	if(console.className == 'hidden') {
		console.setAttribute( 'class', '' );
	} else {
		console.setAttribute( 'class', 'hidden' );
	}
}

$(document).ready( function() {

	connectWebsocket();

	function getFakeLocation() {
		// sendSpacebrewGotoCommand({ longitude: rennesLongMin + Math.random() * rennesLongWidth, latitude: rennesLatMin + Math.random() * rennesLatHeight })
		let r = Math.random()
		let p = { longitude: 0, latitude: 0 }
		if(r<0.25) {
			p.longitude = rennesLongMin
			p.latitude = rennesLatMin
		} else if(r<0.5) {
			p.longitude = rennesLongMax
			p.latitude = rennesLatMin
		}else if(r<0.75) {
			p.longitude = rennesLongMax
			p.latitude = rennesLatMax
		} else {
			p.longitude = rennesLongMin
			p.latitude = rennesLatMax
		}
		sendSpacebrewGotoCommand(p)
	}

	function geo_error(error) {
		console.log("geo error: " + error.message)
	}

	// setInterval(getFakeLocation, 750)
	


	// // server = "272d6640.ngrok.io"
	// server = "localhost"
	// // server = "109.8.223.17"
	// // server = "sandbox.spacebrew.cc"
	// name = "cartoDesUsages"
	// description = "Tipibot commands."

	// spacebrew = new Spacebrew.Client(server, name, description, {port: 9000})

	// spacebrew.onOpen = function() {
	// 	console.log("Connected as " + spacebrew.name() + ".")
	// 	sendSpacebrewPenDownCommand()
	// 	return
	// }
	// spacebrew.onClose = function() {
	// 	console.log("Connected closed .")
	// 	return
	// }
	// spacebrew.onStringMessage = function(m) {
	// 	console.log("Connected sm :"+ m)
	// 	return
	// }
	// spacebrew.onCustomMessage = function(m) {
	// 	console.log("Connected cm: " + m)
	// 	return
	// }
	// spacebrew.connect()

	// spacebrew.addPublish("commands", "string", "")
	// spacebrew.addPublish("command", "string", "")


	tipiSocket.onopen = function (event) {
		console.log("Websocket connection opened: ");
		console.log(event);
	};

    tipiSocket.onclose = function (event) {
        var reason;
        // See http://tools.ietf.org/html/rfc6455#section-7.4.1
        if (event.code == 1000)
            reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
        else if(event.code == 1001)
            reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
        else if(event.code == 1002)
            reason = "An endpoint is terminating the connection due to a protocol error";
        else if(event.code == 1003)
            reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
        else if(event.code == 1004)
            reason = "Reserved. The specific meaning might be defined in the future.";
        else if(event.code == 1005)
            reason = "No status code was actually present.";
        else if(event.code == 1006)
           reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
        else if(event.code == 1007)
            reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
        else if(event.code == 1008)
            reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
        else if(event.code == 1009)
           reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
        else if(event.code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
            reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
        else if(event.code == 1011)
            reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
        else if(event.code == 1015)
            reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
        else
            reason = "Unknown reason";

        console.log("Websocket error #" + event.code);
        console.log(reason);
    };
	tipiSocket.onmessage = function (event) {
		console.log("Websocket message:")
		console.log(event.data)
    };
    tipiSocket.onerror = function (event) {
    	console.error("Websocket error")
    };


})
