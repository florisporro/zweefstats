<script lang="ts">
	interface Props {
		value?: number;
		showMinutes?: boolean;
	}

	let { value = 0, showMinutes = true }: Props = $props();

	let hours = $derived(Math.floor(value / 60));
	let minutes = $derived(Math.round(value) % 60);
</script>

{#if showMinutes}
	<span class="text-[0.8em]">{hours} uur en {minutes} minuten</span>
{:else}
	<span class="text-[0.8em]">{hours} uur</span>
{/if}
