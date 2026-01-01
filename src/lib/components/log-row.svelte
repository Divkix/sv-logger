<script lang="ts">
import type { Log } from '$lib/server/db/schema';
import { cn } from '$lib/utils';
import { formatTimestamp } from '$lib/utils/format';
import LevelBadge from './level-badge.svelte';

interface Props {
  log: Log;
  onclick?: (log: Log) => void;
  class?: string;
}

const { log, onclick, class: className }: Props = $props();

const formattedTimestamp = $derived(
  log.timestamp ? formatTimestamp(log.timestamp) : '--:--:--.---',
);

const sourceInfo = $derived.by(() => {
  if (!log.sourceFile) return null;
  if (log.lineNumber === null || log.lineNumber === undefined) {
    return log.sourceFile;
  }
  return `${log.sourceFile}:${log.lineNumber}`;
});

function handleClick() {
  onclick?.(log);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onclick?.(log);
  }
}
</script>

<div
  data-testid="log-row"
  class={cn(
    'flex items-center gap-4 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border',
    className
  )}
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <span
    data-testid="log-timestamp"
    class="font-mono text-sm text-muted-foreground whitespace-nowrap"
  >
    {formattedTimestamp}
  </span>

  <LevelBadge level={log.level} />

  <span
    data-testid="log-message"
    class="flex-1 text-sm truncate max-w-md"
    title={log.message}
  >
    {log.message}
  </span>

  {#if sourceInfo}
    <span class="text-xs text-muted-foreground font-mono whitespace-nowrap">
      {sourceInfo}
    </span>
  {/if}
</div>
