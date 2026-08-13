<script lang="ts">
	import { getCalendarContext } from './context.js';
	import Popover from './Popover.svelte';

	interface Props {
		anchor: DOMRect;
		onconfirm: () => void;
		onsplit: () => void;
		onclose: () => void;
	}
	const { anchor, onconfirm, onsplit, onclose }: Props = $props();

	const ctx = getCalendarContext();
</script>

<Popover {anchor} {onclose} label={ctx.messages.editRecurring}>
	<div class="s5c-popover-head">
		<span class="s5c-detail-title">↻ {ctx.messages.editRecurring}</span>
	</div>
	<div class="s5c-popover-actions s5c-popover-actions-stack">
		<button type="button" class="s5c-btn s5c-btn-accent" onclick={onconfirm}>
			{ctx.messages.thisEvent}
		</button>
		<button type="button" class="s5c-btn" onclick={onsplit}>
			{ctx.messages.thisAndFollowing}
		</button>
		<button type="button" class="s5c-btn" onclick={onclose}>
			{ctx.messages.cancel}
		</button>
	</div>
</Popover>
