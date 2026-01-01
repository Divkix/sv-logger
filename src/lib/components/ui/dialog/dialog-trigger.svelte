<script lang="ts">
import type { Dialog as DialogPrimitive } from 'bits-ui';

const { ref = $bindable(null), ...restProps }: DialogPrimitive.TriggerProps = $props();
</script>

<DialogPrimitive.Trigger bind:ref data-slot="dialog-trigger" {...restProps} />
