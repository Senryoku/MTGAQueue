import websocket from "websocket";
import { sendCommand } from "./socketUtils";
import { Format, FormatStructure } from "./formats";

export class Player {
	id: string;
	name: string;
	socket: websocket.connection;

	constructor(id: string, name: string, socket: websocket.connection) {
		this.id = id;
		this.name = name;
		this.socket = socket;
	}

	send(type: string, data: any = null) {
		sendCommand(this.socket, type, data);
	}
}

export type QueuedPlayer = {
	playerID: string;
	created: Date;
	format: Format;
	formatStructure: FormatStructure;
};
