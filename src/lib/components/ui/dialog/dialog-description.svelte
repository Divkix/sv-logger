<script lang="ts">
import type { Dialog as DialogPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	data-slot="dialog-description"
	class={cn("text-muted-foreground text-sm", className)}
	{...restProps}
/>
