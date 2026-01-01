<script lang="ts">
import type { Dialog as SheetPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: SheetPrimitive.DescriptionProps = $props();
</script>

<SheetPrimitive.Description
	bind:ref
	data-slot="sheet-description"
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
/>
