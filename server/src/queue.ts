import { Format, FormatStructure as FormatStructure } from "./formats";
import { Match, Matches } from "./match";
import { Player, QueuedPlayer } from "./player.interface";
import { Players } from "./players";

export const PlayerQueue: Array<QueuedPlayer> = [];

function areCompatible(p0: QueuedPlayer, p1: QueuedPlayer) {
	return (
		p0.format === p1.format &&
		(p0.formatStructure === p1.formatStructure ||
			p0.formatStructure === FormatStructure.Any ||
			p1.formatStructure === FormatStructure.Any)
	);
}

function choose(candidates: Array<QueuedPlayer>) {
	return candidates.reduce((prev, curr) =>
		prev.created < curr.created ? prev : curr
	);
}

function startMatch(p0: QueuedPlayer, p1: QueuedPlayer) {
	const format = p0.format;
	const formatStructure =
		p0.formatStructure === p1.formatStructure
			? p0.formatStructure
			: p0.formatStructure === FormatStructure.Any
			? p1.formatStructure
			: p0.formatStructure;
	const match = new Match(p0.playerID, p1.playerID, format, formatStructure);
	Matches.push(match);

	Players[p0.playerID].send("matchfound", {
		playerName: Players[p1.playerID].name,
		info: match.summary(),
	});
	Players[p1.playerID].send("matchfound", {
		playerName: Players[p0.playerID].name,
		info: match.summary(),
	});
}

export function addPlayer(player: Player, data: any) {
	let newPlayer: QueuedPlayer = {
		playerID: player.id,
		created: new Date(),
		format: Format[data.format],
		formatStructure: FormatStructure[data.formatStructure],
	};

	let candidates: Array<QueuedPlayer> = [];
	for (let p of PlayerQueue) {
		if (areCompatible(newPlayer, p)) candidates.push(p);
	}

	if (candidates.length > 0) {
		const otherPlayer = choose(candidates);
		PlayerQueue.splice(PlayerQueue.indexOf(otherPlayer), 1);
		startMatch(newPlayer, otherPlayer);
		return false;
	} else {
		PlayerQueue.push(newPlayer);
		return true;
	}
}

export function remPlayer(player: Player) {
	const idx = PlayerQueue.findIndex((q) => q.playerID === player.id);
	if (idx !== -1) PlayerQueue.splice(idx, 1);
	console.log(PlayerQueue);
}
