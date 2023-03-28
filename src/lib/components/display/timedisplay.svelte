<script lang="ts">
	export let value = 0;
	export let showMinutes = true;

	let hours = 0;
	let minutes = 0;

	$: {
		hours = Math.floor(value / 60);
		minutes = Math.round(value) % 60;
	}
</script>

{#if showMinutes}
	<span class="text-[0.8em]">{hours} uur en {minutes} minuten</span>
{:else}
	<span class="text-[0.8em]">{hours} uur</span>
{/if}
