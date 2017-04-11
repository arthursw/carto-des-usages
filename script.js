var spacebrew = null

let rennesLatMin = 48.147877
let rennesLatMax = 48.076603
let rennesLatHeight = rennesLatMax - rennesLatMin
let rennesLongMin = -1.753280
let rennesLongMax = -1.591461
let rennesLongWidth = rennesLongMax - rennesLongMin

// var tipiSocket = new WebSocket("ws://localhost:8025/tipibot");
var tipiSocket = new WebSocket("wss://ff724879.ngrok.io/tipibot");

function sendSpacebrewCommand(data) {
	let json = JSON.stringify(data)
	console.log("Spacebrew: " + json)
	// spacebrew.send("command", "string", json)

	if(tipiSocket.readyState == WebSocket.OPEN){
		tipiSocket.send(json);
	}

}

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

function sendSpacebrewGotoCommand(coords) {
	// x = (coords.longitude - rennesLongMin) / rennesLongWidth
	// y = (coords.latitude - rennesLatMin) / rennesLatHeight
	data = {
		type: 'goTo',
		point: { x: coords.longitude, y: coords.latitude },
		bounds: { x: rennesLongMin, y: rennesLatMin, width: rennesLongWidth, height: rennesLatHeight },
		scale: 100
	}
	sendSpacebrewCommand(data)
}

$(document).ready( function() {
	var x = document.getElementById("info");

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

	function getLocation() {
	    console.log("get location")
	    if (navigator.geolocation) {
	    	navigator.geolocation.getCurrentPosition(showPosition)
	        // navigator.geolocation.watchPosition(showPosition, geo_error, {enableHighAccuracy:true, maximumAge:1000, timeout:1000});
	    } else {
	        x.innerHTML = "Geolocation is not supported by this browser.";
	    }



	}
	function showPosition(position) {
		console.log("position.coords: long: " + position.coords.longitude + ", lat: " + position.coords.latitude)
		sendSpacebrewGotoCommand(position.coords)
	    x.innerHTML = "Latitude: " + position.coords.latitude +
	    "<br>Longitude: " + position.coords.longitude;

	}
	function geo_error(error) {
		console.log("geo error: " + error.message)
	}

	// setInterval(getFakeLocation, 750)
	setInterval(getLocation, 10000)


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
		// tipiSocket.send("Here's some text that the server is urgently awaiting!");
	};
})
