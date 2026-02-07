import { describe, it, expect } from 'vitest';
import { getStoreHealth, getRelativeTime, formatDate } from './helpers';

describe('helpers', () => {
    describe('getStoreHealth', () => {
        it('returns red for no last visit', () => {
            expect(getStoreHealth(null)).toBe('red');
        });

        it('returns green for recent visit', () => {
            const recentDate = new Date().toISOString();
            expect(getStoreHealth(recentDate)).toBe('green');
        });

        it('returns amber for mid-range visit', () => {
            const midDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();
            expect(getStoreHealth(midDate)).toBe('amber');
        });

        it('returns red for old visit', () => {
            const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
            expect(getStoreHealth(oldDate)).toBe('red');
        });
    });

    describe('getRelativeTime', () => {
        it('returns Today for today', () => {
            expect(getRelativeTime(new Date().toISOString())).toBe('Today');
        });

        it('returns Yesterday for yesterday', () => {
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            expect(getRelativeTime(yesterday)).toBe('Yesterday');
        });

        it('returns weeks ago for older dates', () => {
            const twoWeeksAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
            expect(getRelativeTime(twoWeeksAgo)).toBe('2 weeks ago');
        });
    });
});
