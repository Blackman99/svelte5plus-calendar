import { describe, expect, it } from 'vitest';
import { colorVars } from './context.js';

describe('colorVars', () => {
	it('maps the 10 palette names to CSS variables', () => {
		expect(colorVars('teal')).toBe('--s5c-event-color:var(--s5c-teal, var(--s5c-blue));');
		expect(colorVars('blue')).toBe('--s5c-event-color:var(--s5c-blue, var(--s5c-blue));');
	});

	it('passes arbitrary CSS colors through untouched', () => {
		expect(colorVars('#e4572e')).toBe('--s5c-event-color:#e4572e;');
		expect(colorVars('rgb(1, 2, 3)')).toBe('--s5c-event-color:rgb(1, 2, 3);');
		expect(colorVars('var(--brand)')).toBe('--s5c-event-color:var(--brand);');
	});

	it('does not treat named CSS keywords as palette colors', () => {
		expect(colorVars('coral')).toBe('--s5c-event-color:coral;');
		expect(colorVars('tomato')).toBe('--s5c-event-color:tomato;');
		expect(colorVars('white')).toBe('--s5c-event-color:white;');
	});
});
