<script lang="ts">
/**
 * Logwell Logo Component
 * Automatically switches between dark/light variants based on theme
 */
interface Props {
  size?: number;
  class?: string;
}

const { size = 24, class: className = '' }: Props = $props();
</script>

<!-- Logo glyph - shows white bars on dark bg, black bars on light bg -->
<svg
  viewBox="0 0 512 512"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  class={className}
  aria-label="Logwell logo"
>
  <!-- Dark mode: white bars, Light mode: black bars -->
  <rect x="128" y="148" width="256" height="48" rx="24" class="fill-foreground" />
  <rect x="128" y="228" width="256" height="48" rx="24" class="fill-foreground/60" />
  <rect x="128" y="308" width="160" height="48" rx="24" class="fill-foreground/25" />
</svg>
