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

### Benchmark Results Summary

Complete results from a typical run on 2.7GHz Intel i5:

| Category | Benchmark | Avg Time | Operations/sec |
|----------|-----------|----------|----------------|
| **Instantiation** | | | |
| | new Worker() | ~4 µs | ~250,000 ops/sec |
| | with custom interval | ~7 µs | ~143,000 ops/sec |
| | with fetchProcessingTimeout | ~6 µs | ~167,000 ops/sec |
| | with errorCallback | ~7 µs | ~143,000 ops/sec |
| **Start/Stop** | | | |
| | start() | ~34 µs | ~29,000 ops/sec |
| | dispose() | ~27 µs | ~37,000 ops/sec |
| | start() → dispose() cycle | ~40 µs | ~25,000 ops/sec |
| | multiple dispose() (idempotent) | ~28 µs | ~36,000 ops/sec |
| **Execution** | | | |
| | 1 iteration @ 1000ms interval | ~51.6 ms | ~19 ops/sec |
| | fetch with 10ms delay | ~51.5 ms | ~19 ops/sec |
| | fetch with 50ms delay | ~101 ms | ~10 ops/sec |
| **Error Handling** | | | |
| | with custom errorCallback | ~51.7 ms | ~19 ops/sec |
| | with default errorCallback | ~51.3 ms | ~19 ops/sec |
| | fetch timeout abort | ~51.2 ms | ~20 ops/sec |
| **Concurrency** | | | |
| | 2 concurrent workers | ~51.4 ms | ~19 ops/sec |
| | 5 concurrent workers | ~51.8 ms | ~19 ops/sec |
| | 10 concurrent workers | ~52.1 ms | ~19 ops/sec |
| **State Transitions** | | | |
| | created → stopped lifecycle | ~253 ms | ~4 ops/sec |
| | restart after stop | ~505 ms | ~2 ops/sec |
| | 3 restart cycles | ~757 ms | ~1.3 ops/sec |
| **Memory Management** | | | |
| | rapid create/dispose (100x) | ~385 µs | ~2,600 ops/sec |
| | rapid start/dispose (50x) | ~1.58 ms | ~633 ops/sec |
| **Fetch Scenarios** | | | |
| | lightweight (no-op) | ~51.6 ms | ~19 ops/sec |
| | with CPU work | ~51.5 ms | ~19 ops/sec |
| | with Promise.all | ~51.7 ms | ~19 ops/sec |

**Notes:**
- Execution times include the 50ms wait time in benchmarks
- Concurrency shows similar performance (no contention)
- Memory operations scale well (100 creates in ~385 µs)
- State transitions include deliberate waits for cleanup

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

