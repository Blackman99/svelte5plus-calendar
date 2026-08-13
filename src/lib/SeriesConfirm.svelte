<script lang="ts">
	import { getCalendarContext } from './context.js';
	import Popover from './Popover.svelte';

	interface Props {
		anchor: DOMRect;
		onconfirm: () => void;
		onclose: () => void;
	}
	let { anchor, onconfirm, onclose }: Props = $props();

	const ctx = getCalendarContext();
</script>

<Popover {anchor} {onclose} label={ctx.messages.editRecurring}>
	<div class="s5c-popover-head">
		<span class="s5c-detail-title">↻ {ctx.messages.editRecurring}</span>
	</div>
	<div class="s5c-popover-actions">
		<button type="button" class="s5c-btn" onclick={onclose}>
			{ctx.messages.cancel}
		</button>
		<button type="button" class="s5c-btn s5c-btn-accent" onclick={onconfirm}>
			{ctx.messages.thisEvent}
		</button>
	</div>
</Popover>
