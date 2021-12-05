import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { Player } from "./player.interface";
import { Players, playerRouter } from "./players";
import { addPlayer, remPlayer } from "./queue";
import { createServer } from "http";
import websocket from "websocket";
import { formatRouter } from "./formats";
import { findMatch, Match } from "./match";

dotenv.config();

const port: number = process.env.PORT
	? parseInt(process.env.PORT as string, 10)
	: 7000;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/players", playerRouter);
app.use("/formats", formatRouter);

const httpServer = createServer(app);

const wsServer = new websocket.server({
	httpServer: httpServer,
});

const WSCommands: { [id: string]: Function } = {
	setUsername: (player: Player, data: any) => {
		console.log("Command::setUsername");
		player.name = data;
	},
	queue: (player: Player, data: any) => {
		console.log("Command::queue");
		player.name = data.username;
		if (addPlayer(player, data)) player.send("inqueue", true);
	},
	cancelQueue: (player: Player, data: any) => {
		console.log("Command::cancelQueue");
		remPlayer(player);
		player.send("inqueue", false);
	},
	acceptMatch: (player: Player, data: any) => {
		findMatch(player)?.accept(player.id);
	},
	declineMatch: (player: Player, data: any) => {
		findMatch(player)?.decline(player.id);
	},
};

wsServer.on("request", function (request) {
	console.log(`${new Date()} Connection from origin ${request.origin}.`);
	const connection = request.accept(undefined, request.origin);

	// Get existing uuid from cookie if present or generate a new one and transmit it to the client.
	let cookieID = request.cookies.filter((o) => o.name === "mtgaqueue-uuid");
	let id = cookieID.length > 0 ? cookieID[0].value : uuidv4();
	if (id in Players) {
		// Disconnect previous socket if player is already connected.
		Players[id].send("doNotReconnect");
		Players[id].socket.close();
	}
	Players[id] = new Player(id, "name", connection);
	if (cookieID.length === 0) Players[id].send("setID", id);

	connection.on("message", (message) => {
		if (message.type === "utf8" && message.utf8Data) {
			try {
				const json = JSON.parse(message.utf8Data);
				console.log(json);
				if (json.type in WSCommands)
					WSCommands[json.type](Players[id], json.data);
				else console.warn(`Unknown command type '${json.type}'`);
			} catch (e) {
				console.error(e);
			}
		}
	});

	connection.on("close", (data) => {
		remPlayer(Players[id]);
		console.log(`${new Date()} Peer ${data} disconnected.`);
	});
});

httpServer.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
