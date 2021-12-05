import { createApp, ref } from 'vue'
import App from './App.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);
library.add(faSpinner)

export const socket = {
	install: function(Vue, options) {

		function connectWS() {
			const socket = new WebSocket(`ws://senryoku.tk:7000`);
			Vue.config.globalProperties.$socket = {
				ws: socket,
				socketAutoReconnect: true,
				onReconnect: [], 
				addOnReconnect: function(f) { this.onReconnect.push(f)},
				remOnReconnect: function(f) {
					let idx = this.onReconnect.findIndex(v => v === f);
					if(idx !== -1) this.onReconnect.splice(idx, 1);
				} 
			};

			socket.addEventListener("open", (event) => {
				console.log("Socket connected.");
			});
			
			socket.addEventListener("close", function closeSocket(event) {
				console.log("Socket disconnected.");
				if(Vue.config.globalProperties.$socket.socketAutoReconnect)
					setTimeout(() => { 
						for(let f of Vue.config.globalProperties.$socket.onReconnect)
							f();
						connectWS();
					}, 500);
			});

			socket.addEventListener("error", (event) => {
				console.log("Socket errored.");
				socket.close();
			});

			socket.addEventListener("message", (message) => {
				try {
					const json = JSON.parse(message.data);
					switch (json.type) {
						case "setID":
							document.cookie = `mtgaqueue-uuid=${json.data};SameSite=Strict`
							break;
						case "doNotReconnect":
							Vue.config.globalProperties.$socket.socketAutoReconnect = false;
							break;
					}
				} catch (e) {
					console.error(e);
				}
			});
		} 
		
		connectWS();

		Vue.config.globalProperties.$socketEmit = (command, data) => {
			Vue.config.globalProperties.$socket.ws.send(JSON.stringify({type: command, data: data}));
		};
		Vue.provide("socket", Vue.config.globalProperties.$socket);
	},
};

app.use(socket);
app.mount('#app');
