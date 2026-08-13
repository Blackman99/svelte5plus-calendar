/**
 * Pure layout algorithms:
 *  - time-grid column packing for overlapping timed events (week/day views)
 *  - row ("slot") assignment for multi-day segments (month view & all-day row)
 */
import type { EventInstance } from './types.js';
import { daysBetween, minutesOfDay, startOfDay } from './date.js';

/** Placement of a timed event within one day column. */
export interface TimedPlacement {
	instance: EventInstance;
	/** Minutes since midnight where the block starts (clipped to the day). */
	startMin: number;
	/** Minutes since midnight where the block ends (clipped to the day, ≥ startMin + 1). */
	endMin: number;
	/** Column index within its overlap cluster. */
	col: number;
	/** Total columns in the overlap cluster. */
	cols: number;
}

/**
 * Packs the timed instances of a single day into columns.
 * Classic cluster algorithm: sort by start (longer first on ties), place each
 * event in the leftmost column free at its start; events connected by overlap
 * form a cluster and share the cluster's total column count.
 */
export function layoutDay(instances: EventInstance[], day: Date): TimedPlacement[] {
	const dayStart = startOfDay(day);
	const dayEnd = new Date(dayStart.getTime() + 86_400_000);

	const items = instances
		.map((instance) => {
			const s = Math.max(instance.start.getTime(), dayStart.getTime());
			const e = Math.min(instance.end.getTime(), dayEnd.getTime());
			const startMin = Math.floor((s - dayStart.getTime()) / 60_000);
			const endMin = Math.max(startMin + 1, Math.ceil((e - dayStart.getTime()) / 60_000));
			return { instance, startMin, endMin, col: 0, cols: 1 };
		})
		.sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

	// Assign columns greedily; track cluster membership.
	const colEnds: number[] = []; // per column: end minute of the last event placed
	let clusterStart = 0; // index of first item in current cluster
	let clusterMaxEnd = -1;
	let clusterCols = 0;

	const closeCluster = (endIdx: number) => {
		for (let i = clusterStart; i < endIdx; i++) items[i].cols = clusterCols;
	};

	items.forEach((item, idx) => {
		if (item.startMin >= clusterMaxEnd && idx > 0) {
			// No overlap with anything before → previous cluster is complete.
			closeCluster(idx);
			clusterStart = idx;
			clusterCols = 0;
			colEnds.length = 0;
		}
		let placed = false;
		for (let c = 0; c < colEnds.length; c++) {
			if (item.startMin >= colEnds[c]) {
				item.col = c;
				colEnds[c] = item.endMin;
				placed = true;
				break;
			}
		}
		if (!placed) {
			item.col = colEnds.length;
			colEnds.push(item.endMin);
		}
		clusterCols = Math.max(clusterCols, colEnds.length);
		clusterMaxEnd = Math.max(clusterMaxEnd, item.endMin);
	});
	closeCluster(items.length);

	return items;
}

/** A horizontal bar spanning one or more day cells within a single week row. */
export interface WeekSegment {
	instance: EventInstance;
	/** Column of the first cell (0–6). */
	startCol: number;
	/** Number of cells covered (≥ 1). */
	span: number;
	/** Assigned stacking row (0 = topmost). */
	row: number;
	/** Whether the event continues before/after this week row. */
	continuesBefore: boolean;
	continuesAfter: boolean;
}

export interface WeekRowLayout {
	segments: WeekSegment[];
	/** Per day column: number of hidden events (drives the “+N more” link). */
	hiddenCounts: number[];
	/** Per day column: total rows used before truncation. */
	usedRows: number;
}

/**
 * Lays out the given instances across one week row (`days` = 7 consecutive
 * midnights, but any length works). Multi-day and all-day events become
 * spanning bars; timed single-day events (month view) occupy one cell.
 *
 * `maxRows` limits visible rows per day (Infinity = no limit). When a day
 * exceeds it, segments in overflowing rows are dropped and counted in
 * `hiddenCounts`. A dropped segment hides in ALL its cells (like Google
 * Calendar, a bar never partially disappears).
 */
export function layoutWeekRow(
	instances: EventInstance[],
	days: Date[],
	maxRows = Infinity
): WeekRowLayout {
	const rowStart = days[0];
	const rowEnd = new Date(startOfDay(days[days.length - 1]).getTime() + 86_400_000);

	type Seg = Omit<WeekSegment, 'row'> & { row: number; sortStart: number; sortSpan: number };
	const segs: Seg[] = [];

	for (const instance of instances) {
		// Clip to the row; all-day events use day precision with exclusive end.
		const s = instance.start.getTime() < rowStart.getTime() ? rowStart : instance.start;
		let endDay = startOfDay(new Date(Math.min(instance.end.getTime(), rowEnd.getTime()) - 1));
		if (instance.end.getTime() <= instance.start.getTime()) endDay = startOfDay(instance.start);
		const startCol = Math.max(0, daysBetween(rowStart, s));
		const endCol = Math.min(days.length - 1, Math.max(startCol, daysBetween(rowStart, endDay)));
		if (startCol >= days.length || endCol < 0) continue;
		segs.push({
			instance,
			startCol,
			span: endCol - startCol + 1,
			row: -1,
			continuesBefore: instance.start.getTime() < rowStart.getTime(),
			continuesAfter: instance.end.getTime() > rowEnd.getTime(),
			sortStart: instance.start.getTime(),
			sortSpan: endCol - startCol + 1
		});
	}

	// Google-style ordering: longer spans first, then earlier start, then title.
	segs.sort(
		(a, b) =>
			b.sortSpan - a.sortSpan ||
			a.sortStart - b.sortStart ||
			minutesOfDay(a.instance.start) - minutesOfDay(b.instance.start) ||
			a.instance.event.title.localeCompare(b.instance.event.title)
	);

	// Greedy row assignment: first row where all covered cells are free.
	const rows: boolean[][] = []; // rows[r][col] = occupied
	for (const seg of segs) {
		let r = 0;
		for (; ; r++) {
			if (!rows[r]) rows[r] = new Array(days.length).fill(false);
			let free = true;
			for (let c = seg.startCol; c < seg.startCol + seg.span; c++) {
				if (rows[r][c]) {
					free = false;
					break;
				}
			}
			if (free) break;
		}
		seg.row = r;
		for (let c = seg.startCol; c < seg.startCol + seg.span; c++) rows[r][c] = true;
	}

	const usedRows = rows.length;
	const hiddenCounts = new Array(days.length).fill(0);
	let visible = segs;

	if (usedRows > maxRows) {
		// Reserve the last visible row for the "+N more" link ⇒ show maxRows - 1 event rows.
		const cutoff = Math.max(0, maxRows - 1);
		visible = [];
		for (const seg of segs) {
			if (seg.row < cutoff) {
				visible.push(seg);
			} else {
				for (let c = seg.startCol; c < seg.startCol + seg.span; c++) hiddenCounts[c] += 1;
			}
		}
	}

	return {
		segments: visible.map(({ sortStart: _s, sortSpan: _p, ...seg }) => seg),
		hiddenCounts,
		usedRows
	};
}
