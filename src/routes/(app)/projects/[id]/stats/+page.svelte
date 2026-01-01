<script lang="ts">
import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
import { goto } from '$app/navigation';
import LevelChart from '$lib/components/level-chart.svelte';
import TimeRangePicker, { type TimeRange } from '$lib/components/time-range-picker.svelte';
import type { PageData } from './$types';

const { data }: { data: PageData } = $props();

// Local state
let selectedRange = $state<TimeRange>((data.filters.range as TimeRange) || '24h');
let loading = $state(false);

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
      <div class="flex items-center justify-center h-[200px]">
        <div class="text-muted-foreground">Loading...</div>
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
