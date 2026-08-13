<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';

	onMount(() => {
		const zh = (navigator.language || '').toLowerCase().startsWith('zh');
		goto(zh ? `${base}/zh/` : `${base}/en/`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>svelte5plus-calendar</title>
	<noscript><meta http-equiv="refresh" content="0; url=en/" /></noscript>
</svelte:head>

<p style="font-family: sans-serif; padding: 2rem">
	<a href="{base}/en/">English</a> · <a href="{base}/zh/">中文</a>
</p>
