<script lang="ts">
	interface Props {
		name?: string;
		children?: import('svelte').Snippet;
	}

	let { name = '', children }: Props = $props();
</script>

<div class="bg-white p-2 rounded-lg place-items-center">
	<div class="font-bold">{name}</div>
	<div class="text-lg">{@render children?.()}</div>
</div>

<style lang="postcss">
</style>
