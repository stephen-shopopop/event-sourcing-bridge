# Package Template

<!-- Badges -->

[![npm version](https://img.shields.io/npm/v/@stephen-shopopop/pkg.svg)](https://www.npmjs.com/package/@stephen-shopopop/pkg)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.17.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> A professional Node.js package template with TypeScript, modern tooling, and best practices.

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [Development](#-development)
- [Scripts](#-scripts)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Building](#-building)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

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

- **Node.js** >= 20.17.0
- **npm** >= 10.0.0

## 📦 Installation

```bash
npm install @stephen-shopopop/<package-name>
```

## 🚀 Usage

### CommonJS

```javascript
const { yourFunction } = require("@stephen-shopopop/<package-name>");

// Use your package
yourFunction();
```

### ES Modules

```javascript
import { yourFunction } from "@stephen-shopopop/<package-name>";

// Use your package
yourFunction();
```

### TypeScript

```typescript
import { yourFunction } from "@stephen-shopopop/<package-name>";

// Full type support
yourFunction();
```

## 💻 Development

### Getting Started

1. Clone the repository:

```bash
git clone https://github.com/stephen-shopopop/<pkg>.git
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

- [GitHub Repository](https://github.com/stephen-shopopop/package-template)
- [Issue Tracker](https://github.com/stephen-shopopop/package-template/issues)
- [Documentation](https://github.com/stephen-shopopop/package-template#readme)

---

**Note:** This is a template repository. Replace `<package-name>` and `<pkg>` with your actual package name when using this template.
