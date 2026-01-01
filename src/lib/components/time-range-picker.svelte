<script lang="ts" module>
export type TimeRange = '15m' | '1h' | '24h' | '7d';

export const TIME_RANGES: readonly TimeRange[] = ['15m', '1h', '24h', '7d'] as const;

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '15m': 'Last 15 minutes',
  '1h': 'Last hour',
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
};
</script>

<script lang="ts">
import { Button } from '$lib/components/ui/button/index.js';

interface Props {
  value?: TimeRange;
  disabled?: boolean;
  onchange?: (value: TimeRange) => void;
}

let {
  value = $bindable('1h'),
  disabled = false,
  onchange,
}: Props = $props();

function handleClick(range: TimeRange) {
  if (range === value) return;
  value = range;
  onchange?.(range);
}
</script>

<div class="flex gap-1" role="group" aria-label="Time range selector">
  {#each TIME_RANGES as range}
    <Button
      variant={value === range ? 'default' : 'outline'}
      size="sm"
      {disabled}
      aria-pressed={value === range}
      aria-label={TIME_RANGE_LABELS[range]}
      data-selected={value === range}
      onclick={() => handleClick(range)}
    >
      {range}
    </Button>
  {/each}
</div>
