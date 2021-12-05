import websocket from "websocket";

export function sendCommand(
	socket: websocket.connection,
	type: string,
	data: any = null
) {
	socket.send(JSON.stringify({ type: type, data: data }));
}
