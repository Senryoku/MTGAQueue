<template>
	<div>
		<h1>Quick Match</h1>
		<form @submit="queue" :class="{disabled: inQueue}">
			<fieldset :disabled="inQueue">
				<span class="label-container">
					<label for="select-format">Arena Username</label>
					<input
						type="text"
						v-model="username"
						placeholder="Username#1234"
						required
						title="Username should be a valid Arena username: Name#12345"
						pattern="^[^#]+#\d{5}$"
					/>
				</span>
				<span class="label-container">
					<label for="select-format">Format</label>
					<select id="select-format" v-model="format">
						<option v-for="f in formats" :key="f">{{ f }}</option>
					</select>
				</span>
				<span class="label-container">
					<label for="select-format-length">Structure</label>
					<select id="select-format-length" v-model="formatStructure">
						<option v-for="f in formatStructures" :key="f">{{ f }}</option>
					</select>
				</span>
				<button type="submit">Queue</button>
			</fieldset>
		</form>
		<div class="status">
			<div v-if="inQueue">
				<font-awesome-icon icon="spinner" pulse /> Searching for an opponent...
				<button @click="cancelQueue">Cancel</button>
			</div>
		</div>
		<div>
			<p v-for="e in errors" :key="e">{{ e }}</p>
		</div>
		<template v-if="match">
			<modal v-if="match.declined" title="Match Declined">
				<h2>
					<span @click="copyOpponentName"
						>{{ match.playerName }} declined the match.</span
					>
				</h2>
				<button @click="match = null">Ok</button>
			</modal>
			<modal v-else-if="match.launched" title="Match Accepted!">
				<h2>
					<span @click="copyOpponentName" class="clickable">Against {{ match.playerName }}</span>
				</h2>
				<div>Format: {{ match.info.format }}</div>
				<div>Structure: {{ match.info.formatStructure }}</div>
				<div class="instructions">Now go to MTG: Arena > Direct challenge and enter your opponent name there (you can click on it to copy it to your clipboard and paste it in Arena).</div>
				<button class="accept-button" @click="endMatch">Done!</button>
			</modal>
			<modal v-else title="Match Found!">
				<h2>
					<span @click="copyOpponentName" class="clickable"
						>{{ match.playerName }} wants to battle!</span
					>
				</h2>
				<div>Format: {{ match.info.format }}</div>
				<div>Structure: {{ match.info.formatStructure }}</div>
				<template v-if="match.accepted">
					<font-awesome-icon icon="spinner" pulse /> Waiting for your
					opponent...
				</template>
				<template v-else>
					<button class="decline-button" @click="declineMatch">Decline</button>
					<button class="accept-button" @click="acceptMatch">Accept</button>
				</template>
			</modal>
		</template>
	</div>
</template>

<script>
import Modal from "./Modal.vue";
import { ServerHost } from "../config";

export default {
	components: { Modal },
	data() {
		return {
			username: localStorage.getItem("mtgaqueue-username", ""),
			format: localStorage.getItem("mtgaqueue-format", "Arena Vintage"),
			formatStructure: localStorage.getItem(
				"mtgaqueue-format-structure",
				"Any"
			),
			errors: [],
			inQueue: false,
			formats: [],
			formatStructures: [],
			match: null,
		};
	},
	inject: ["socket"],
	mounted() {
		fetch(`${window.location.protocol}//${ServerHost}/formats/`)
			.then((data) => data.json())
			.then((json) => {
				this.formats = json;
			});
		fetch(`${window.location.protocol}//${ServerHost}/formats/structures`)
			.then((data) => data.json())
			.then((json) => {
				this.formatStructures = json;
			});

		this.setupWS();
		this.socket.addOnReconnect(this.setupWS);
	},
	unmounted() {
		this.socket.remOnReconnect(this.setupWS);
		this.cleanWS();
	},
	methods: {
		setupWS() {
			this.socket.ws.addEventListener("message", this.handleSocketMessage);
		},
		cleanWS() {
			this.socket.ws.removeEventListener("message", this.handleSocketMessage);
		},
		queue(event) {
			event.preventDefault();

			if (!this.validateForm()) return false;
			localStorage.setItem("mtgaqueue-username", this.username);

			this.$socketEmit("queue", {
				username: this.username,
				format: this.format,
				formatStructure: this.formatStructure,
			});
			return true;
		},
		cancelQueue() {
			this.$socketEmit("cancelQueue");
		},
		validArenaUsername(str) {
			return /^[^#]+#\d{5}$/.test(str);
		},
		validateForm() {
			this.errors = [];
			if (!this.validArenaUsername(this.username)) {
				this.errors.push("Please enter a valid Arena username (Name#12345).");
				return false;
			}
			return true;
		},
		handleSocketMessage(message) {
			console.log("QuickPlay::handleSocketMessage");
			try {
				const json = JSON.parse(message.data);
				console.log(json);
				switch (json.type) {
					case "inqueue":
						this.inQueue = json.data;
						break;
					case "matchfound":
						this.matchFound(json.data);
						break;
					case "launchmatch":
						this.match.launched = true;
						break;
					case "matchdeclined":
						this.match.declined = true;
						break;
				}
			} catch (e) {
				console.error(e);
			}
		},
		matchFound(data) {
			console.log("Match Found", data);
			this.inQueue = false;
			this.match = data;
		},
		acceptMatch() {
			this.$socketEmit("acceptMatch");
			this.match.accepted = true;
		},
		declineMatch() {
			this.match = null;
			this.$socketEmit("declineMatch");
		},
		endMatch() {
			this.match = null;
		},
		copyOpponentName() {
			if(this.match?.playerName)
  				navigator.clipboard.writeText(this.match.playerName);
		},
	},
	watch: {
		format() {
			localStorage.setItem("mtgaqueue-format", this.format);
		},
		formatStructure() {
			localStorage.setItem("mtgaqueue-format-structure", this.formatStructure);
		},
	},
};
</script>

<style scoped>
fieldset {
	border: 0;
}

fieldset > * {
	margin: 0 0.5em;
}

input,
select,
option,
button {
	padding: 0.25em 0.5em;
	border-radius: 0 5px;
	border: 1px #555 solid;
}

button:hover {
	background-color: #fff;
	cursor: pointer;
}

button:active {
	background-color: #ddd;
}

.disabled {
	pointer-events: none;
}

.clickable {
	cursor: pointer;
}

.status {
	min-height: 2em;
}

.label-container {
	position: relative;
}

.label-container label {
	position: absolute;
	top: -1rem;
	left: 0;
	font-variant: small-caps;
	font-size: 0.8em;
	user-select: none;
}

.decline-button,
.accept-button {
	padding: 0.5em 3em;
	margin: 1em;
	background-color: rgb(148, 182, 97);
	border: 1px rgb(123, 153, 77) solid;
}
.accept-button {
	background-color: rgb(148, 182, 97);
	border: 1px rgb(123, 153, 77) solid;
}

.decline-button {
	background-color: rgb(194, 141, 141);
	border: 1px rgb(146, 65, 65) solid;
}

.instructions {
	max-width: 70%;
	margin:  1em auto;
}
</style>