import { Format, FormatStructure } from "./formats";
import { Player } from "./player.interface";
import { Players } from "./players";

export class Match {
	players: Array<string>;
	format: Format;
	formatStructure: FormatStructure;
	accepted: { [id: string]: boolean };

	constructor(
		p0: string,
		p1: string,
		format: Format,
		formatStructure: FormatStructure
	) {
		this.players = [p0, p1];
		this.accepted = {};
		this.format = format;
		this.formatStructure = formatStructure;
		this.accepted[p0] = this.accepted[p1] = false;
	}

	accept(pid: string) {
		this.accepted[pid] = true;
		if (Object.values(this.accepted).every((b) => b)) this.launch();
	}

	decline(pid: string) {
		const other = this.players.find((p) => p !== pid);
		if (other) Players[other].send("matchdeclined");
	}

	launch() {
		for (let pid of this.players) Players[pid].send("launchmatch");
		//TEMP!!!!
		this.done();
	}

	done() {
		Matches.splice(Matches.indexOf(this), 1);
	}

	summary() {
		return {
			players: [
				Players[this.players[0]].name,
				Players[this.players[1]].name,
			],
			format: Format[this.format],
			formatStructure: FormatStructure[this.formatStructure],
		};
	}
}

export function findMatch(p: Player) {
	return Matches.find((m) => m.players[0] === p.id || m.players[1] === p.id);
}

export const Matches: Array<Match> = [];
