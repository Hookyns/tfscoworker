import * as $net from "net";

const msgPack = require('msgpack5')();

const client = new $net.Socket();

client.connect(10101, "127.0.0.1", function() {
	console.log("Connected");
	
	// Send handshake packet
	client.write(msgPack.encode({ 
		Type: 1,
		Identifier: [100, 100, 100],
		User: "User",
		Password: "pass*****"
	}));
});

client.on("data", function(data) {
	console.log("Received: ",  msgPack.decode(data));
	// client.destroy(); // kill client after server's response
});

client.on("close", function() {
	console.log("Connection closed");
});


const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on("line", (input : string)=> {
	client.write(msgPack.encode(input));
});