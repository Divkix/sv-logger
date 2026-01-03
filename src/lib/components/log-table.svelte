<script lang="ts">
import type { Log } from '$lib/server/db/schema';
import { cn } from '$lib/utils';
import LogCard from './log-card.svelte';
import LogRow from './log-row.svelte';

interface Props {
  logs: Log[];
  loading?: boolean;
  hasFilters?: boolean;
  onLogClick?: (log: Log) => void;
  class?: string;
  newLogIds?: Set<string>;
}

const {
  logs,
  loading = false,
  hasFilters,
  onLogClick,
  class: className,
  newLogIds,
}: Props = $props();

const SKELETON_ROW_COUNT = 8;

// Determine empty state message and test id based on hasFilters
const emptyStateMessage = $derived(hasFilters ? 'No logs match your filters' : 'No logs yet');
const emptyStateTestId = $derived(hasFilters ? 'log-table-no-results' : 'log-table-empty');
</script>

<div data-testid="log-table" class={cn('w-full', className)}>
  <!-- Mobile: Card-based layout (< 640px) -->
  <div class="space-y-2 sm:hidden">
    {#if loading}
      {#each Array(SKELETON_ROW_COUNT) as _}
        <div data-testid="log-card-skeleton" class="p-3 border rounded-lg animate-pulse">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="h-5 w-14 bg-accent rounded-md" role="presentation"></div>
            <div class="h-4 w-20 bg-accent rounded-md" role="presentation"></div>
          </div>
          <div class="h-4 w-full bg-accent rounded-md" role="presentation"></div>
          <div class="h-4 w-3/4 bg-accent rounded-md mt-1" role="presentation"></div>
        </div>
      {/each}
    {:else if logs.length === 0}
      <div data-testid={emptyStateTestId} class="text-center py-8 text-muted-foreground">
        {emptyStateMessage}
      </div>
    {:else}
      {#each logs as log (log.id)}
        <LogCard {log} onclick={onLogClick} isNew={newLogIds?.has(log.id)} />
      {/each}
    {/if}
  </div>

  <!-- Tablet/Desktop: Table layout (>= 640px) -->
  <table class="hidden sm:table w-full caption-bottom text-sm">
    <thead data-testid="log-table-header" class="border-b">
      <tr class="border-b transition-colors">
        <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-32">
          Time
        </th>
        <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground w-20">
          Level
        </th>
        <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">
          Message
        </th>
      </tr>
    </thead>
    <tbody>
      {#if loading}
        {#each Array(SKELETON_ROW_COUNT) as _}
          <tr data-testid="log-table-skeleton-row" class="border-b">
            <td class="px-4 py-2">
              <div class="h-4 w-24 bg-accent animate-pulse rounded-md" role="presentation"></div>
            </td>
            <td class="px-4 py-2">
              <div class="h-5 w-14 bg-accent animate-pulse rounded-md" role="presentation"></div>
            </td>
            <td class="px-4 py-2">
              <div class="h-4 w-full max-w-md bg-accent animate-pulse rounded-md" role="presentation"></div>
            </td>
          </tr>
        {/each}
      {:else if logs.length === 0}
        <tr data-testid={emptyStateTestId} class="text-muted-foreground">
          <td colspan="3" class="h-32 text-center">
            {emptyStateMessage}
          </td>
        </tr>
      {:else}
        {#each logs as log (log.id)}
          <LogRow {log} onclick={onLogClick} isNew={newLogIds?.has(log.id)} />
        {/each}
      {/if}
    </tbody>
  </table>
</div>
