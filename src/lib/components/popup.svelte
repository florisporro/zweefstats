<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	export let open: boolean = false;

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (target.classList.contains('popupcontainer')) {
			close();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="popupcontainer" on:click={handleClickOutside}>
		<div class="popup">
			<div class="header">
				<div class="closebutton selectable" on:click={close}>❌</div>
			</div>
			<div class="body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.popupcontainer {
		@apply z-50 fixed top-0 left-0 w-full h-full bg-opacity-50 bg-gray-500 flex flex-col justify-start;
		overflow-y: auto;
	}

	.popup {
		@apply w-5/6 h-5/6 mt-12 mx-auto bg-white rounded-lg;
	}

	.header {
		@apply flex flex-row justify-end;
	}

	.closebutton {
		@apply text-right text-2xl inline p-6;
	}

	.body {
		@apply overflow-scroll  h-full;
	}

	.popup > * {
		@apply pointer-events-auto;
	}

	.selectable {
		@apply cursor-pointer;
	}
</style>
