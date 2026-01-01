<script lang="ts">
import type { Dialog as DialogPrimitive } from 'bits-ui';

const { open = $bindable(false), ...restProps }: DialogPrimitive.RootProps = $props();
</script>

<DialogPrimitive.Root bind:open {...restProps} />
