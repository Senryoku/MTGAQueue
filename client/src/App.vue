<template>
	<div>
		<h1>Direct Play</h1>
		<img alt="Vue logo" src="./assets/logo.png" height="100" />
		<quick-play />
	</div>
</template>

<script setup>
import { inject, onBeforeUnmount } from "vue";
import QuickPlay from "./components/QuickPlay.vue";

// This starter template is using Vue 3 experimental <script setup> SFCs
// Check out https://github.com/vuejs/rfcs/blob/script-setup-2/active-rfcs/0000-script-setup.md
</script>

<script>
import { reactive } from "vue";
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
</style>