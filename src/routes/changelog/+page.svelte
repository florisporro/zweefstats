<script lang="ts">
	import { marked } from 'marked';
	import changelog from '../../../CHANGELOG.md?raw';

	const html = marked.parse(changelog, { async: false });
</script>

<section>
	<article class="prose mx-auto mt-[2em]">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- repo-owned, release-please generated -->
		{@html html}
	</article>
</section>
