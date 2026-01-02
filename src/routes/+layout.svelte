<script lang="ts">
import './layout.css';
import favicon from '$lib/assets/favicon.svg';
import { Toaster } from '$lib/components/ui/sonner';
import { ModeWatcher } from 'mode-watcher';

const { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
{@render children()}
<Toaster richColors closeButton position="top-right" />
