# Worker Benchmarks

Performance benchmarks for the Worker class using [Mitata](https://github.com/evanwashere/mitata).

## Running Benchmarks

```bash
npm run bench
```

## Benchmark Categories

The benchmark suite tests 8 key areas:

1. **Worker Instantiation** - Creating Worker instances
2. **Start/Stop Operations** - Lifecycle management
3. **Worker Execution** - Fetch function execution with different delays
4. **Error Handling** - Error processing overhead
5. **Concurrency** - Multiple workers running simultaneously (2, 5, 10 workers)
6. **State Transitions** - Lifecycle state changes and restarts
7. **Memory Management** - Resource cleanup and rapid create/dispose cycles
8. **Fetch Scenarios** - Different fetch function types (no-op, CPU work, Promise.all)

## Understanding Results

Mitata displays:
- **avg**: Average execution time per operation
- **min … max**: Range of execution times
- **p75 / p99**: 75th and 99th percentile

Example output:
```
benchmark                    avg (min … max) p75 / p99
new Worker()              4.68 µs/iter   4.00 µs
                     (3.68 µs … 3.20 ms)  10.35 µs
```

## Converting to Operations/Second

Quick conversion formula: `ops/sec = 1,000,000 / microseconds`

| Benchmark | Avg Time | Operations/sec |
|-----------|----------|----------------|
| Instantiation | ~5 µs | ~200,000 ops/sec |
| Start/Stop | ~30 µs | ~33,000 ops/sec |
| Fetch (no-op) | ~50 ms | ~20 ops/sec |

## Typical Performance (2.7GHz Intel i5)

- **Worker creation**: ~200K instances/sec
- **Lifecycle operations**: ~30K cycles/sec
- **Memory per worker**: ~2 KB baseline
- **Concurrency**: Linear scaling up to 10+ workers

## Notes

- First run may be slower due to JIT compilation
- Results vary based on CPU, memory, and system load
- Error messages in "default errorCallback" tests are expected
- Run on an idle system for consistent results

## Adding New Benchmarks

```typescript
import { bench, group } from 'mitata';

group('My Group', () => {
  bench('my test', async () => {
    const worker = new Worker({
      name: 'bench-worker',
      interval: 1000,
      fetch: async () => {}
    });
    
    worker.start();
    await setTimeout(50);
    worker.dispose();
  });
});
```

