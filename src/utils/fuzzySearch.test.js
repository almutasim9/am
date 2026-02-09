import { describe, it, expect } from 'vitest';
import { fuzzySearch, highlightMatch } from './fuzzySearch';

describe('Fuzzy Search Utility', () => {
    const items = [
        { id: '1', name: 'Baghdad Store', city: 'Baghdad' },
        { id: '2', name: 'Basra Market', city: 'Basra' },
        { id: '3', name: 'Al-Mansour Supermarket', city: 'Baghdad' },
        { id: '4', name: 'Erbil Mall', city: 'Erbil' },
    ];

    describe('fuzzySearch', () => {
        it('returns exact matches first', () => {
            const results = fuzzySearch(items, 'Baghdad', ['name', 'city']);
            expect(results[0].item.city).toBe('Baghdad');
            expect(results[0].score).toBe(1);
        });

        it('finds items based on name', () => {
            const results = fuzzySearch(items, 'Mansour', ['name']);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].item.name).toContain('Mansour');
        });

        it('handles case-insensitive search by default', () => {
            const results = fuzzySearch(items, 'ERBIL', ['name']);
            expect(results[0].item.name).toBe('Erbil Mall');
        });

        it('returns multiple results for general queries', () => {
            const results = fuzzySearch(items, 'Store', ['name']);
            expect(results.length).toBeGreaterThan(0);
        });

        it('handles typos (fuzzy matching)', () => {
            // "Bashra" instead of "Basra"
            const results = fuzzySearch(items, 'Bashra', ['city']);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].item.city).toBe('Basra');
        });

        it('returns empty array if no match found above threshold', () => {
            const results = fuzzySearch(items, 'xyzabc', ['name'], { threshold: 0.8 });
            expect(results.length).toBe(0);
        });
    });

    describe('highlightMatch', () => {
        it('highlights exact matching part', () => {
            const result = highlightMatch('Baghdad Store', 'Baghdad');
            expect(result).toEqual([
                { text: 'Baghdad', highlight: true },
                { text: ' Store', highlight: false }
            ]);
        });

        it('highlights middle part', () => {
            const result = highlightMatch('Supermarket', 'market');
            expect(result).toEqual([
                { text: 'Super', highlight: false },
                { text: 'market', highlight: true }
            ]);
        });

        it('handles no match gracefully', () => {
            const result = highlightMatch('Hello', 'World');
            expect(result.some(p => p.highlight)).toBe(false);
        });
    });
});
