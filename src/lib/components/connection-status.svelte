<script lang="ts">
import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
import LoaderIcon from '@lucide/svelte/icons/loader';

interface Props {
  isConnecting: boolean;
  error: Error | null;
}

const { isConnecting, error }: Props = $props();
</script>

{#if isConnecting}
  <span data-testid="connection-connecting" class="flex items-center gap-1 text-xs text-muted-foreground">
    <LoaderIcon class="size-3 animate-spin" />
    Connecting...
  </span>
{:else if error}
  <span data-testid="connection-error" class="flex items-center gap-1 text-xs text-destructive" title={error.message}>
    <AlertCircleIcon class="size-3" />
    Connection error
  </span>
{/if}
