<script lang="ts">
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import { goto } from '$app/navigation';
import { navigating } from '$app/stores';
import LevelChart from '$lib/components/level-chart.svelte';
import StatsSkeleton from '$lib/components/stats-skeleton.svelte';
import TimeRangePicker, { type TimeRange } from '$lib/components/time-range-picker.svelte';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();

// Local state
let selectedRange = $state<TimeRange>((data.filters.range as TimeRange) || '24h');
let loading = $state(false);

// Show skeleton when navigating TO this page
const isNavigating = $derived($navigating?.to?.url.pathname.endsWith('/stats') ?? false);

function handleTimeRangeChange(range: TimeRange) {
  selectedRange = range;
  updateFilters();
}

async function updateFilters() {
  loading = true;

  const params = new URLSearchParams();
  params.set('range', selectedRange);

  const queryString = params.toString();
  const url = `/projects/${data.project.id}/stats?${queryString}`;

  await goto(url, { replaceState: true, noScroll: true });
  loading = false;
}

// Prepare chart data
const chartData = $derived({
  levelCounts: data.stats.levelCounts,
  levelPercentages: data.stats.levelPercentages,
});
</script>

{#if isNavigating}
  <StatsSkeleton />
{:else}
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <a
          href="/projects/{data.project.id}"
          class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to logs"
        >
          <ArrowLeftIcon class="size-4" />
          <span class="sr-only">Logs</span>
        </a>
        <h1 class="text-2xl font-bold">{data.project.name}</h1>
      </div>
    </div>

    <!-- Stats Header -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold">Log Level Distribution</h2>
        <p class="text-sm text-muted-foreground">
          Statistics for the selected time range
        </p>
      </div>

      <TimeRangePicker value={selectedRange} onchange={handleTimeRangeChange} disabled={loading} />
    </div>

    <!-- Chart Section -->
    <div class="flex justify-center py-8">
      {#if loading}
        <div class="flex flex-col gap-4">
          <div class="h-[200px] w-[200px] rounded-full bg-accent animate-pulse"></div>
          <div class="flex flex-col gap-2">
            {#each Array(5) as _}
              <div class="flex items-center gap-2">
                <div class="h-3 w-3 rounded-sm bg-accent animate-pulse"></div>
                <div class="h-4 w-24 bg-accent animate-pulse rounded-md"></div>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <LevelChart data={chartData} />
      {/if}
    </div>

    <!-- Summary Stats -->
    <div class="text-center text-muted-foreground">
      {#if data.stats.totalLogs > 0}
        <p>
          Viewing <span class="font-medium text-foreground">{data.stats.totalLogs.toLocaleString()}</span> logs
          from the last
          {#if selectedRange === '15m'}
            15 minutes
          {:else if selectedRange === '1h'}
            hour
          {:else if selectedRange === '24h'}
            24 hours
          {:else if selectedRange === '7d'}
            7 days
          {/if}
        </p>
      {:else}
        <p>No logs found in the selected time range</p>
      {/if}
    </div>
  </div>
{/if}
