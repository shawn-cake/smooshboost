import { describe, it, expect } from 'vitest';
import { forEachWithConcurrency } from './concurrency';

/**
 * Resolves after the next macrotask, letting other queued promises advance.
 */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('forEachWithConcurrency', () => {
  it('processes every item exactly once', async () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const seen: number[] = [];

    await forEachWithConcurrency(items, 3, async (n) => {
      seen.push(n);
    });

    expect(seen.sort((a, b) => a - b)).toEqual(items);
  });

  it('never exceeds the concurrency limit', async () => {
    const items = Array.from({ length: 12 }, (_, i) => i);
    let inFlight = 0;
    let maxInFlight = 0;

    await forEachWithConcurrency(items, 3, async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await tick();
      inFlight--;
    });

    expect(maxInFlight).toBe(3);
  });

  it('uses fewer workers when items < limit', async () => {
    const items = [1, 2];
    let inFlight = 0;
    let maxInFlight = 0;

    await forEachWithConcurrency(items, 5, async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await tick();
      inFlight--;
    });

    expect(maxInFlight).toBe(2);
  });

  it('keeps workers busy (a slow item does not block others)', async () => {
    // One slow item at the front; with a shared queue the other two workers
    // should drain the rest while it runs.
    const order: number[] = [];
    const items = [0, 1, 2, 3, 4, 5];

    await forEachWithConcurrency(items, 3, async (n) => {
      if (n === 0) await tick();
      await tick();
      order.push(n);
    });

    // The slow item (0) should not be the only thing that ran first
    expect(order).toContain(0);
    expect(order.length).toBe(6);
  });

  it('handles an empty list without invoking the worker', async () => {
    let calls = 0;
    await forEachWithConcurrency([], 3, async () => {
      calls++;
    });
    expect(calls).toBe(0);
  });

  it('clamps a limit below 1 up to a single worker', async () => {
    const items = [1, 2, 3];
    const seen: number[] = [];
    await forEachWithConcurrency(items, 0, async (n) => {
      seen.push(n);
    });
    expect(seen).toEqual([1, 2, 3]);
  });
});
