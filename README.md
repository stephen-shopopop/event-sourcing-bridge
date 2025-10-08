# event-sourcing-bridge

<!-- Badges -->

[![npm version](https://img.shields.io/npm/v/@stephen-shopopop/event-sourcing-bridge.svg)](https://www.npmjs.com/package/@stephen-shopopop/event-sourcing-bridge)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.17.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> A unified, high-performance abstraction layer for Event Sourcing and Job Queue systems in Node.js

**event-sourcing-bridge** provides a consistent, strongly-typed interface to work with multiple event sourcing and message queue systems. It eliminates vendor lock-in and simplifies switching between different messaging backends.

## 🎯 What is Event Sourcing Bridge?

Instead of directly coupling your application to a specific messaging system (like RabbitMQ or Kafka), this bridge provides:

- **Unified API**: Write code once, use with any supported backend
- **Abstraction Layer**: Switch between pg-boss, RabbitMQ, ZeroMQ, or Kafka without changing your business logic
- **Type Safety**: Full TypeScript support with strict typing
- **Flexibility**: Mix and match different systems for different use cases

### Supported Systems

| System       | Type                       | Use Case                                   |
| ------------ | -------------------------- | ------------------------------------------ |
| **pg-boss**  | Job Queue (PostgreSQL)     | Simple job queues with ACID guarantees     |
| **RabbitMQ** | Message Broker (AMQP)      | Enterprise messaging, complex routing      |
| **ZeroMQ**   | High-performance Messaging | Ultra-low latency, distributed systems     |
| **Kafka**    | Event Streaming Platform   | High-throughput event logs, real-time data |
| **SQLite**   | Local Job Queue (Bonus)    | Lightweight task scheduling, development   |

📖 **[See detailed backend comparison guide →](./BACKEND_COMPARISON.md)** | **[Version française →](./BACKEND_COMPARISON.fr.md)**

## ✨ Key Features

🧑‍💻 **100% TypeScript** - ESM & CJS compatible with full type safety
🔌 **Pluggable** - Easy to switch between different messaging backends
🧪 **Battle-tested** - Comprehensive test suite with 80%+ coverage
📦 **Zero Config** - Sensible defaults, customize when needed
🎨 **Clean API** - Simple, robust interface for all Node.js projects

## 📋 Table of Contents

- [What is Event Sourcing Bridge?](#-what-is-event-sourcing-bridge)
- [Why Use This Bridge?](#-why-use-this-bridge)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
- [API Reference](#-api-reference)
- [Development](#-development)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Building](#-building)
- [Contributing](#-contributing)
- [License](#-license)

## 💡 Why Use This Bridge?

### Problem

Modern applications often need to:

- Process background jobs
- Handle asynchronous events
- Scale message processing
- Ensure reliable message delivery

But choosing a specific messaging system creates **vendor lock-in** and makes migration difficult.

### Solution [WIP]

**event-sourcing-bridge** provides:

```typescript
// Write your code once
const queue = createQueue("my-queue");
await queue.send({ task: "process-payment", amount: 100 });

// Switch backends without changing code
// - Development: SQLite
// - Staging: pg-boss
// - Production: Kafka
```

### Benefits

✅ **No Vendor Lock-in** - Switch backends without code changes
✅ **Consistent Interface** - Same API across all systems
✅ **Easy Testing** - Use SQLite in tests, production system in prod
✅ **Gradual Migration** - Migrate between systems incrementally
✅ **Best Tool for Job** - Use RabbitMQ for some queues, Kafka for others

## 🎯 Use Cases [WIP]

### 1. **Background Job Processing**

```typescript
// Send jobs to queue
await jobQueue.send({
  type: "send-email",
  to: "user@example.com",
  template: "welcome",
});

// Process jobs
jobQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

### 2. **Event-Driven Microservices**

```typescript
// Service A: Publish events
await eventBus.publish("order.created", {
  orderId: "123",
  userId: "user-456",
  total: 99.99,
});

// Service B: Subscribe to events
eventBus.subscribe("order.created", async (event) => {
  await updateInventory(event.data);
});
```

### 3. **Task Scheduling**

```typescript
// Schedule recurring tasks
await scheduler.schedule("cleanup-old-data", {
  cron: "0 2 * * *", // Every day at 2 AM
  handler: async () => {
    await deleteOldRecords();
  },
});
```

### 4. **Multi-Backend Strategy**

```typescript
// Use different backends for different needs
const criticalQueue = createQueue("critical", { backend: "kafka" }); // High reliability
const bulkQueue = createQueue("bulk", { backend: "rabbitmq" }); // High throughput
const devQueue = createQueue("dev", { backend: "sqlite" }); // Local development
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     Your Application Code               │
│  (Business Logic - Vendor Agnostic)     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   event-sourcing-bridge (This Library)  │
│   - Unified API                         │
│   - Type Safety                         │
│   - Abstraction Layer                   │
└─────────────┬───────────────────────────┘
              │
      ┌───────┼───────┬───────┬──────┐
      ▼       ▼       ▼       ▼      ▼
  ┌─────┐ ┌──────┐ ┌─────┐ ┌─────┐ ┌──────┐
  │pg-  │ │Rabbit│ │Zero │ │Kafka│ │SQLite│
  │boss │ │MQ    │ │MQ   │ │     │ │      │
  └─────┘ └──────┘ └─────┘ └─────┘ └──────┘
```

## ✨ Technical Features

- 🚀 **TypeScript** - Full TypeScript support with strict type checking
- 📦 **Dual Package** - Supports both ESM and CommonJS
- 🧪 **Native Testing** - Built-in testing with `node:test` and coverage
- 🎨 **Biome** - Fast linting and formatting
- 📊 **Coverage** - Code coverage with c8
- 🔄 **Watch Mode** - Development with hot reload
- 🏗️ **tsup** - Fast bundling with TypeScript declarations
- 🪝 **Git Hooks** - Pre-commit checks with simple-git-hooks
- 📝 **Documentation** - Auto-generated docs with TypeDoc

## 📋 Prerequisites

- **Node.js** >= 22.20.0
- **npm** >= 10.0.0

## 📦 Installation

```bash
npm install @stephen-shopopop/event-sourcing-bridge
```

## 🚀 Quick Start [WIP]

### Basic Example

```typescript
import { createQueue } from "@stephen-shopopop/event-sourcing-bridge";

// Create a queue (auto-detects best available backend)
const queue = await createQueue("tasks");

// Send a message
await queue.send({
  action: "process-order",
  orderId: "12345",
  items: ["item1", "item2"],
});

// Process messages
await queue.process(async (message) => {
  console.log("Processing:", message.data);
  // Your business logic here
});
```

## 📚 Usage Examples

### Example 1: Job Queue with pg-boss

```typescript
import { PgBossQueue } from "@stephen-shopopop/event-sourcing-bridge";

// Initialize pg-boss queue
const queue = new PgBossQueue({
  connectionString: "postgres://localhost/mydb",
  queueName: "email-jobs",
});

await queue.start();

// Send job
await queue.send({
  type: "welcome-email",
  recipient: "user@example.com",
  data: { name: "John Doe" },
});

// Process jobs with retry logic
await queue.process(
  async (job) => {
    await sendEmail(job.data);
  },
  {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
  },
);
```

### Example 2: Event Bus with RabbitMQ

```typescript
import { RabbitMQBridge } from "@stephen-shopopop/event-sourcing-bridge";

// Initialize RabbitMQ
const eventBus = new RabbitMQBridge({
  url: "amqp://localhost",
  exchange: "events",
});

await eventBus.connect();

// Publish events
await eventBus.publish("user.registered", {
  userId: "123",
  email: "user@example.com",
  timestamp: Date.now(),
});

// Subscribe to events
await eventBus.subscribe("user.registered", async (event) => {
  console.log("New user:", event.data);
  await sendWelcomeEmail(event.data);
});

// Subscribe with pattern matching
await eventBus.subscribe("user.*", async (event) => {
  console.log("User event:", event.type, event.data);
});
```

### Example 3: High-Performance Messaging with ZeroMQ

```typescript
import { ZeroMQBridge } from "@stephen-shopopop/event-sourcing-bridge";

// Publisher
const publisher = new ZeroMQBridge({
  type: "pub",
  endpoint: "tcp://127.0.0.1:5555",
});

await publisher.send("sensor.temperature", {
  sensor: "sensor-01",
  value: 22.5,
  unit: "celsius",
});

// Subscriber
const subscriber = new ZeroMQBridge({
  type: "sub",
  endpoint: "tcp://127.0.0.1:5555",
  topics: ["sensor.temperature", "sensor.humidity"],
});

subscriber.on("message", (topic, data) => {
  console.log(`${topic}:`, data);
});
```

### Example 4: Event Streaming with Kafka

```typescript
import { KafkaBridge } from "@stephen-shopopop/event-sourcing-bridge";

// Producer
const producer = new KafkaBridge({
  brokers: ["localhost:9092"],
  clientId: "my-app",
});

await producer.connect();

await producer.send("orders", {
  key: "order-123",
  value: {
    orderId: "123",
    status: "pending",
    items: ["item1", "item2"],
  },
});

// Consumer
const consumer = new KafkaBridge({
  brokers: ["localhost:9092"],
  groupId: "order-processors",
});

await consumer.subscribe("orders", async (message) => {
  console.log("Processing order:", message.value);
  await processOrder(message.value);
});
```

### Example 5: Local Development with SQLite

```typescript
import { SQLiteQueue } from "@stephen-shopopop/event-sourcing-bridge";

// Perfect for development and testing
const queue = new SQLiteQueue({
  filename: "./dev-queue.db",
  queueName: "tasks",
});

await queue.init();

// Schedule periodic tasks
await queue.schedule("cleanup", {
  cron: "*/5 * * * *", // Every 5 minutes
  handler: async () => {
    console.log("Running cleanup...");
    await cleanupTempFiles();
  },
});

// One-time delayed task
await queue.sendDelayed(
  {
    action: "send-reminder",
    userId: "123",
  },
  {
    delay: 3600000, // 1 hour
  },
);
```

### Example 6: Multi-Backend Strategy

```typescript
import { QueueFactory } from "@stephen-shopopop/event-sourcing-bridge";

// Configure different backends for different environments
const factory = new QueueFactory({
  development: {
    backend: "sqlite",
    config: { filename: "./dev.db" },
  },
  staging: {
    backend: "pg-boss",
    config: { connectionString: process.env.DATABASE_URL },
  },
  production: {
    backend: "kafka",
    config: { brokers: process.env.KAFKA_BROKERS.split(",") },
  },
});

// Automatically uses correct backend based on NODE_ENV
const queue = await factory.createQueue("notifications");

await queue.send({ type: "email", to: "user@example.com" });
```

## Backend-Specific Configuration

Each backend has its own configuration options. See the full documentation for details:

- [pg-boss Configuration](./docs/backends/pg-boss.md)
- [RabbitMQ Configuration](./docs/backends/rabbitmq.md)
- [ZeroMQ Configuration](./docs/backends/zeromq.md)
- [Kafka Configuration](./docs/backends/kafka.md)
- [SQLite Configuration](./docs/backends/sqlite.md)

## 💻 Development

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/stephen-shopopop/event-sourcing-bridge.git
cd <pkg>
```

2. Install dependencies:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

4. Build the package:

```bash
npm run build
```

### Setting Up Git Hooks

Git hooks are automatically installed via `simple-git-hooks` when you run `npm install`. The pre-commit hook runs type checking and linting.

## 📜 Scripts

### Primary Commands

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm test`       | Run tests with coverage (type check + tests) |
| `npm run build`  | Build the package for production             |
| `npm run lint`   | Lint code with Biome                         |
| `npm run format` | Format and fix code with Biome               |
| `npm run check`  | Run type checks and linting                  |

### Additional Commands

| Command                   | Description                       |
| ------------------------- | --------------------------------- |
| `npm run coverage`        | Generate detailed coverage report |
| `npm run clean`           | Remove build artifacts            |
| `npm run docs`            | Generate TypeDoc documentation    |
| `npm run deps:update`     | Check for dependency updates      |
| `npm run deps:unused`     | Find unused dependencies          |
| `npm run tarball:check`   | Preview npm package contents      |
| `npm run publish:dry-run` | Test package publishing           |

### Maintenance Commands

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm run maintenance`   | Clean build and node_modules   |
| `npm run biome:migrate` | Update Biome to latest version |

## 📁 Project Structure

```
.
├── bin/                  # CLI and test runner scripts
├── src/                  # Source code
│   └── index.ts         # Main entry point
├── test/                # Test files
│   ├── setup.js         # Test setup
│   ├── setup.test.ts    # Setup tests
│   └── teardown.js      # Test teardown
├── dist/                # Built files (generated)
├── docs/                # Generated documentation
├── coverage/            # Coverage reports (generated)
├── biome.json          # Biome configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Package manifest
└── README.md           # This file
```

## ⚙️ Configuration

### TypeScript

The project uses strict TypeScript configuration. See `tsconfig.json` for details.

### Biome

Biome is used for both linting and formatting. Configuration in `biome.json`:

- Enforces consistent code style
- Validates code quality
- Auto-fixes issues when possible

### tsup

Build configuration in `package.json`:

- Generates both ESM and CJS outputs
- Creates TypeScript declarations (.d.ts)
- Supports Node.js platform
- Preserves source structure

### Package Exports

The package supports dual module formats:

```json
{
  "exports": {
    "require": {
      "types": "./dist/index.d.cts",
      "default": "./dist/index.cjs"
    },
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

## 🧪 Testing

This project uses Node.js native test runner (`node:test`).

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npx tsx ./bin/test-runner.js **/*.test.ts -w

# Run only specific tests
npx tsx ./bin/test-runner.js **/*.test.ts --name="#myTag"

# Generate detailed coverage report
npm run coverage
```

### Test Runner Options

- `--concurrency`, `-c` - Number of concurrent tests (default: CPUs - 1)
- `--coverage`, `-C` - Enable code coverage (default: false)
- `--watch`, `-w` - Re-run tests on changes (default: false)
- `--only`, `-o` - Run only tests marked with `only` (default: false)
- `--forceExit`, `-F` - Force exit after tests (default: false)
- `--expose-gc` - Expose gc() function (default: false)
- `--reporter`, `-r` - Set reporter (spec, tap, dot, junit, github)
- `--pattern`, `-p` - Test file pattern (default: `*.test.{js|ts}`)
- `--name` - Filter tests by name (e.g., `--name="#myTag"`)
- `--timeout`, `-t` - Test timeout in ms (default: 30000)
- `--lines` - Coverage lines threshold (default: 80)
- `--functions` - Coverage functions threshold (default: 80)
- `--branches` - Coverage branches threshold (default: 80)
- `--rootDir` - Root directory for setup/teardown

### Coverage Thresholds

Default coverage thresholds:

- Lines: 80%
- Functions: 80%
- Branches: 80%

## 🏗️ Building

Build the package for production:

```bash
npm run build
```

This creates:

- `dist/index.js` - ESM bundle
- `dist/index.cjs` - CommonJS bundle
- `dist/index.d.ts` - ESM type definitions
- `dist/index.d.cts` - CommonJS type definitions

### Pre-publish Checks

Before publishing, the package automatically:

1. Runs the build process (`prepack` hook)
2. Validates the package contents

Preview what will be published:

```bash
npm run tarball:check
npm run publish:dry-run
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run check && npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass
- Maintain code coverage above thresholds

### Pre-commit Hooks

The project uses `simple-git-hooks` to run checks before commits:

- TypeScript type checking
- Biome linting

## 📄 License

[ISC](https://opensource.org/licenses/ISC) © [Stephen Deletang](https://github.com/stephen-shopopop)

## 🔗 Links

- [GitHub Repository](https://github.com/stephen-shopopop/event-sourcing-bridge)
- [Issue Tracker](https://github.com/stephen-shopopop/event-sourcing-bridge/issues)
- [Documentation](https://github.com/stephen-shopopop/event-sourcing-bridge#readme)
- [npm Package](https://www.npmjs.com/package/@stephen-shopopop/event-sourcing-bridge)

## 🎓 Learning Resources

### Event Sourcing Concepts

- [Martin Fowler - Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Event-Driven Architecture](https://aws.amazon.com/event-driven-architecture/)
- [CQRS Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)

### Supported Technologies

- [pg-boss Documentation](https://github.com/timgit/pg-boss)
- [RabbitMQ Tutorial](https://www.rabbitmq.com/getstarted.html)
- [ZeroMQ Guide](https://zeromq.org/get-started/)
- [Apache Kafka Docs](https://kafka.apache.org/documentation/)

## ⚖️ Comparison with Other Solutions

| Feature           | event-sourcing-bridge | Direct Integration | Other Libraries |
| ----------------- | --------------------- | ------------------ | --------------- |
| Unified API       | ✅                    | ❌                 | ⚠️ Partial      |
| Type Safety       | ✅                    | ⚠️ Varies          | ⚠️ Varies       |
| Multi-Backend     | ✅                    | ❌                 | ❌              |
| No Vendor Lock-in | ✅                    | ❌                 | ❌              |
| Production Ready  | ✅                    | ✅                 | ⚠️ Varies       |
| Learning Curve    | Low                   | High               | Medium          |

## 🗺️ Roadmap

### Current (v0.3.0)

- ✅ Core abstraction layer
- ✅ TypeScript support
- ✅ Dual package (ESM/CJS)

### Planned

- 🔄 pg-boss implementation
- 🔄 RabbitMQ implementation
- 🔄 ZeroMQ implementation
- 🔄 Kafka implementation
- 🔄 SQLite scheduler
- 📅 Redis backend support
- 📅 Monitoring & metrics
- 📅 Circuit breaker pattern
- 📅 Dead letter queues

## 💬 FAQ

### Q: Which backend should I use?

**A:** It depends on your use case:

- **SQLite**: Development, testing, small apps
- **pg-boss**: Simple job queues with PostgreSQL
- **RabbitMQ**: Complex routing, enterprise messaging
- **ZeroMQ**: Ultra-low latency, high throughput
- **Kafka**: Event streaming, high-volume data

### Q: Can I use multiple backends in one app?

**A:** Yes! You can use different backends for different queues based on requirements.

### Q: Is this production-ready?

**A:** The abstraction layer is stable. Backend implementations are in progress. Check the roadmap for current status.

### Q: How does this compare to BullMQ?

**A:** BullMQ is Redis-specific. This library provides a unified interface across multiple backends, avoiding vendor lock-in.

### Q: Does it support message priorities?

**A:** Yes, through the `SendOptions.priority` parameter (where supported by the backend).

### Q: Can I migrate between backends?

**A:** Yes! That's the main purpose. Just change the configuration without changing your business logic.

---

**Made with ❤️ by [Stephen Deletang](https://github.com/stephen-shopopop)**
