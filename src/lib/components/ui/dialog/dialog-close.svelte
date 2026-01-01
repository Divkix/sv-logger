<script lang="ts">
import type { Dialog as DialogPrimitive } from 'bits-ui';

const { ref = $bindable(null), ...restProps }: DialogPrimitive.CloseProps = $props();
</script>

<DialogPrimitive.Close bind:ref data-slot="dialog-close" {...restProps} />
