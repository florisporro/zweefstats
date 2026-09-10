<script lang="ts">
	let files = $state<FileList | undefined>();
	interface Props {
		contents: string;
	}

	let { contents = $bindable() }: Props = $props();

	function printFile(file: File) {
		const reader = new FileReader();
		reader.onload = (evt) => {
			if (evt?.target?.result) {
				contents = evt.target.result as string;
			}
		};
		reader.readAsText(file);
	}

	$effect(() => {
		if (files?.length) printFile(files[0]);
	});
</script>

<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_input"
	>Kies CSV bestand om te analyseren</label
>
<input bind:files type="file" accept=".csv" aria-describedby="file_input_help" class="file-input" />
