<script lang="ts">
import type { Select as SelectPrimitive } from 'bits-ui';

const { ref = $bindable(null), ...restProps }: SelectPrimitive.GroupProps = $props();
</script>

<SelectPrimitive.Group data-slot="select-group" {...restProps} />
