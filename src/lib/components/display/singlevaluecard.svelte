<script>
	export let name = '';
	export let value = '';
</script>

<div class="bg-white rounded-2xl shadow-lg px-8 py-4 flex flex-col justify-center">
	<h4 class="text-2xl font-bold">{name}</h4>
	<p class="text-4xl font-bold"><slot /></p>
</div>
