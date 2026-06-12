/**
 * Runs an async worker over `items` with a bounded number of workers running
 * at once. Uses a shared work queue (work-stealing): each worker pulls the
 * next item as soon as it finishes its current one, so a slow item never
 * blocks the others.
 *
 * The worker is responsible for its own error handling — a worker that
 * rejects will abort the whole run (mirrors `Promise.all`), so callers that
 * want per-item resilience should catch inside the worker.
 *
 * @param items   Items to process (a snapshot is taken; the input is not mutated).
 * @param limit   Maximum workers in flight at once (clamped to [1, items.length]).
 * @param worker  Async function invoked once per item.
 */
export async function forEachWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  const queue = [...items];
  const workerCount = Math.max(1, Math.min(limit, queue.length));

  const runners = Array.from({ length: workerCount }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) break;
      await worker(item);
    }
  });

  await Promise.all(runners);
}
