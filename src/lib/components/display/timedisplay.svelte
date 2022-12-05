<script lang="ts">
	export let value = 0;

	let hours = 0;
	let minutes = 0;

	$: {
		hours = Math.floor(value / 60);
		minutes = value % 60;
	}
</script>

<span class="text-[0.8em]">{hours} uur en {minutes} minuten</span>
