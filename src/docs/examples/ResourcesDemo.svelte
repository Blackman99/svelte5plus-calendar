<script lang="ts">
	import { Calendar, type CalendarEvent, type Resource } from '$lib';

	let { locale = 'en' } = $props();

	// svelte-ignore state_referenced_locally
	const zh = locale.toLowerCase().startsWith('zh');

	const resources: Resource[] = [
		{ id: 'room-a', name: zh ? '会议室 A' : 'Room A', color: 'blue' },
		{ id: 'room-b', name: zh ? '会议室 B' : 'Room B', color: 'green' },
		{ id: 'room-c', name: zh ? '会议室 C' : 'Room C', color: 'purple' }
	];

	const at = (h: number, m = 0) => {
		const d = new Date();
		return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
	};

	// svelte-ignore state_referenced_locally
	let events = $state<CalendarEvent[]>([
		{ id: '1', title: zh ? '晨会' : 'Morning sync', start: at(9), end: at(10), resourceId: 'room-a' },
		{ id: '2', title: zh ? '客户演示' : 'Client demo', start: at(10, 30), end: at(12), resourceId: 'room-b' },
		{ id: '3', title: zh ? '设计评审' : 'Design review', start: at(14), end: at(15, 30), resourceId: 'room-a' },
		{ id: '4', title: zh ? '面试' : 'Interview', start: at(11), end: at(12), resourceId: 'room-c' },
		{ id: '5', title: zh ? '培训' : 'Training', start: at(15), end: at(17), resourceId: 'room-c' }
	]);
</script>

<!-- Drag an event sideways to move it to another room;
     drag empty space to book a slot in that room. -->
<Calendar
	bind:events
	{locale}
	{resources}
	view="resources"
	views={['resources', 'day', 'week']}
	dayStartHour={7}
	dayEndHour={20}
	scrollToHour={8}
	editable
	selectable
/>
