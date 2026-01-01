<script lang="ts">
import type { Dialog as DialogPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';

const {
  ref = $bindable(null),
  class: className,
  ...restProps
}: DialogPrimitive.TitleProps = $props();
</script>

<DialogPrimitive.Title
	bind:ref
	data-slot="dialog-title"
	class={cn("text-lg leading-none font-semibold", className)}
	{...restProps}
/>
