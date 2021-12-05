<template>
	<div>
		<h1>Direct Play</h1>
		<img alt="MTGA Logo" src="./assets/logo.png" height="100" />
		<quick-play />
		<div class="footer">More information: <a href="https://discord.gg/dZeBZXh7" target="_blank"><img src="./assets/icon_clyde_blurple_RGB.svg" class="logo" /> F.I.R.E. Arena Vintage Discord server</a></div>
	</div>
</template>

<script setup>
import QuickPlay from "./components/QuickPlay.vue";
</script>

<script>
export default {
	inject: ["socket"],
};
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

a, a:visited {
	text-decoration: none;
}

a:hover {
	color: #2994ff;
}

.footer {
	margin-top: 2em;
}

.logo {
	height: 1em;
	vertical-align: middle;
}
</style>