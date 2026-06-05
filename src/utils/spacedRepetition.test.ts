import { describe, it, expect } from 'vitest';
import {
    createNewItem,
    scheduleReview,
    isReviewDue,
    getReviewStatus,
} from './spacedRepetition';

describe('spacedRepetition', () => {
    describe('createNewItem', () => {
        it('creates item with default SM-2 parameters', () => {
            const item = createNewItem();
            expect(item.repetitions).toBe(0);
            expect(item.interval).toBe(1);
            expect(item.easeFactor).toBe(2.5);
            expect(item.lastReviewedAt).toBeNull();
            expect(item.nextReviewAt).toBeTruthy();
        });
    });

    describe('scheduleReview', () => {
        it('resets on failed review (quality < 3)', () => {
            const item = createNewItem();
            // First do a couple good reviews to build up
            const after1 = scheduleReview(item, 4);
            const after2 = scheduleReview(after1, 4);
            expect(after2.repetitions).toBe(2);

            // Now fail
            const failed = scheduleReview(after2, 2);
            expect(failed.repetitions).toBe(0);
            expect(failed.interval).toBe(1);
        });

        it('sets interval to 1 day on first successful review', () => {
            const item = createNewItem();
            const reviewed = scheduleReview(item, 4);
            expect(reviewed.interval).toBe(1);
            expect(reviewed.repetitions).toBe(1);
        });

        it('sets interval to 6 days on second successful review', () => {
            const item = createNewItem();
            const first = scheduleReview(item, 4);
            const second = scheduleReview(first, 4);
            expect(second.interval).toBe(6);
            expect(second.repetitions).toBe(2);
        });

        it('multiplies interval by ease factor on subsequent reviews', () => {
            const item = createNewItem();
            const first = scheduleReview(item, 5);
            const second = scheduleReview(first, 5);
            const third = scheduleReview(second, 5);
            // Third review: interval = round(6 * easeFactor)
            expect(third.interval).toBeGreaterThan(6);
            expect(third.repetitions).toBe(3);
        });

        it('never lets ease factor drop below 1.3', () => {
            let item = createNewItem();
            // Repeatedly give lowest passing grade
            for (let i = 0; i < 20; i++) {
                item = scheduleReview(item, 3);
            }
            expect(item.easeFactor).toBeGreaterThanOrEqual(1.3);
        });

        it('increases ease factor for perfect quality', () => {
            const item = createNewItem();
            const reviewed = scheduleReview(item, 5);
            expect(reviewed.easeFactor).toBeGreaterThan(2.5);
        });

        it('decreases ease factor for barely-passing quality', () => {
            const item = createNewItem();
            const reviewed = scheduleReview(item, 3);
            expect(reviewed.easeFactor).toBeLessThan(2.5);
        });

        it('sets nextReviewAt in the future', () => {
            const item = createNewItem();
            const reviewed = scheduleReview(item, 4);
            const nextReview = new Date(reviewed.nextReviewAt);
            expect(nextReview.getTime()).toBeGreaterThan(Date.now());
        });

        it('sets lastReviewedAt to now', () => {
            const item = createNewItem();
            const before = Date.now();
            const reviewed = scheduleReview(item, 4);
            const after = Date.now();
            const reviewedAt = new Date(reviewed.lastReviewedAt!).getTime();
            expect(reviewedAt).toBeGreaterThanOrEqual(before);
            expect(reviewedAt).toBeLessThanOrEqual(after);
        });

        it('clamps quality to valid range', () => {
            const item = createNewItem();
            // Should not throw for out-of-range values
            const tooLow = scheduleReview(item, -1);
            expect(tooLow.repetitions).toBe(0); // treated as fail
            const tooHigh = scheduleReview(item, 10);
            expect(tooHigh.repetitions).toBe(1); // treated as success
        });
    });

    describe('isReviewDue', () => {
        it('returns true when nextReviewAt is in the past', () => {
            const item = createNewItem();
            item.nextReviewAt = new Date(Date.now() - 1000).toISOString();
            expect(isReviewDue(item)).toBe(true);
        });

        it('returns false when nextReviewAt is in the future', () => {
            const item = createNewItem();
            item.nextReviewAt = new Date(Date.now() + 86400000).toISOString();
            expect(isReviewDue(item)).toBe(false);
        });
    });

    describe('getReviewStatus', () => {
        it('returns "Never reviewed" for unreviewed items', () => {
            const item = createNewItem();
            item.lastReviewedAt = null;
            expect(getReviewStatus(item)).toBe('Never reviewed');
        });

        it('returns "Due for review" for overdue items', () => {
            const item = createNewItem();
            item.lastReviewedAt = new Date(Date.now() - 86400000).toISOString();
            item.nextReviewAt = new Date(Date.now() - 1000).toISOString();
            expect(getReviewStatus(item)).toBe('Due for review');
        });

        it('returns future-looking string for items not yet due', () => {
            const item = createNewItem();
            item.lastReviewedAt = new Date().toISOString();
            item.nextReviewAt = new Date(Date.now() + 2 * 86400000).toISOString();
            const status = getReviewStatus(item);
            expect(status).toContain('Review');
        });
    });
});
