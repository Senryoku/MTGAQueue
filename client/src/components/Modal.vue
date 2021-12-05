<template>
	<div class="modal">
		<div class="modal-content">
			<h1>{{ title }}</h1>
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	props: { title: { type: String, default: "Default Title" } },
	setup() {},
};
</script>

<style scoped>
.modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
}

.modal-content {
	background: white;
	margin: 2em 0;
	padding: 1em 2em 2em 2em;
}
</style>