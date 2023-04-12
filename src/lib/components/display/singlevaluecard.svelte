<script>
	export let name = '';
</script>

<div class="bg-white p-2 rounded-lg place-items-center">
	<div class="font-bold">{name}</div>
	<div class="text-lg"><slot /></div>
</div>

<style lang="postcss">
</style>
