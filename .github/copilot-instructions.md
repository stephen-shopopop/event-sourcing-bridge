# Project Overview

Professional Node.js package template with TypeScript, modern tooling, and best practices.

## Project Type

This is a **package template** designed for creating publishable Node.js libraries with dual package support (ESM + CommonJS).

## Folder Structure

- `/src`: Contains the TypeScript source code for the package
- `/test`: Contains test files and test setup/teardown scripts
- `/bin`: Contains CLI scripts and custom test runner
- `/dist`: Build output directory (generated, gitignored)
- `/docs`: Generated TypeDoc documentation (gitignored)
- `/coverage`: Code coverage reports (generated, gitignored)
- `/.github`: GitHub configuration, templates, and workflows

## Libraries and Frameworks

### Core Dependencies
- **Node.js** >= 20.17.0
- **TypeScript** 5.9+ for type-safe development
- **tsup** for fast bundling and dual package output
- **tsx** for running TypeScript files directly

### Development Tools
- **node:test** - Native Node.js test runner
- **c8** - Code coverage reporting
- **Biome** - Fast linting and formatting
- **simple-git-hooks** - Git hooks management
- **TypeDoc** - API documentation generation
- **@reporters/github** - GitHub Actions reporter

## Coding Standards

- Use semicolons at the end of each statement
- Use single quotes for strings
- Use arrow functions for callbacks
- Follow TypeScript strict mode
- Maintain 80% minimum code coverage (lines, functions, branches)
- Use meaningful variable and function names
- Write tests for all new features

## Development Commands

### Primary Commands

- `npm run test` - Run unit tests with type checking and coverage
- `npm run lint` - Run Biome linter
- `npm run format` - Run Biome formatter and auto-fix issues
- `npm run check` - Run TypeScript type checking and linting
- `npm run build` - Build the package for production (dual ESM + CJS)

### Additional Commands

- `npm run coverage` - Generate detailed coverage report (lcov, text, html)
- `npm run clean` - Remove build artifacts
- `npm run docs` - Generate TypeDoc documentation
- `npm run deps:update` - Check for dependency updates with taze
- `npm run deps:unused` - Find unused dependencies with knip
- `npm run tarball:check` - Preview npm package contents
- `npm run publish:dry-run` - Test package publishing
- `npm run maintenance` - Clean build, node_modules, and npm cache
- `npm run biome:migrate` - Update Biome to latest version

## Architecture

### Core Structure

```
package-template/
├── src/
│   └── index.ts          # Main entry point for the package
├── test/
│   ├── setup.js          # Test environment setup
│   ├── setup.test.ts     # Setup verification tests
│   └── teardown.js       # Test environment cleanup
├── bin/
│   └── test-runner.js    # Custom test runner with CLI options
└── dist/                 # Build output
    ├── index.js          # ESM bundle
    ├── index.cjs         # CommonJS bundle
    ├── index.d.ts        # ESM type definitions
    └── index.d.cts       # CommonJS type definitions
```

### Package Exports

The package supports dual module formats through package.json exports:
- **ESM**: `import` with `.js` and `.d.ts` files
- **CommonJS**: `require` with `.cjs` and `.d.cts` files

### Key Features

- **Dual Package Support**: Generates both ESM and CommonJS outputs
- **Type Definitions**: Automatic TypeScript declaration generation
- **Multiple Reporter Support**: spec, tap, dot, junit, github
- **Code Coverage**: Via node:test with customizable thresholds
- **Watch Mode**: Development mode with auto-reload
- **Git Hooks**: Pre-commit checks for type safety and linting
- **Documentation**: Auto-generated API docs with TypeDoc

### Test Structure

- Tests use native `node:test` runner
- Test files follow `*.test.{js|ts}` pattern
- Support for setup and teardown scripts
- Coverage thresholds: 80% for lines, functions, and branches
- Custom test runner with advanced CLI options

### TypeScript Support

- **tsx** for running TypeScript files directly
- Supports both ESM and CJS module formats
- Strict type checking enabled
- Type definitions generated for both formats

### Build System

- **tsup** for bundling
- Platform: Node.js
- Formats: ESM (`.js`) and CommonJS (`.cjs`)
- TypeScript declarations: `.d.ts` and `.d.cts`
- Source maps: disabled for production
- Minification: disabled for better debugging

## Configuration

### Test Runner CLI Options

The custom test runner (`bin/test-runner.js`) supports the following options:

#### Execution Options
- `--concurrency` or `-c` - Number of concurrent tests (default: CPUs - 1)
- `--timeout` or `-t` - Test timeout in milliseconds (default: 30000)
- `--only` or `-o` - Only run tests marked with `only` (default: false)
- `--forceExit` or `-F` - Force exit after tests complete (default: false)

#### Coverage Options
- `--coverage` or `-C` - Enable code coverage (default: false)
- `--lines` - Coverage lines threshold (default: 80)
- `--functions` - Coverage functions threshold (default: 80)
- `--branches` - Coverage branches threshold (default: 80)

#### Watch & Development
- `--watch` or `-w` - Re-run tests on file changes (default: false)
- `--expose-gc` - Expose gc() function to tests (default: false)

#### Test Selection
- `--pattern` or `-p` - Test file glob pattern (default: `*.test.{js|ts}`)
- `--name` - Filter tests by name pattern (e.g., `--name="#myTag"`)

#### Reporting
- `--reporter` or `-r` - Set reporter (spec, tap, dot, junit, github)

#### Setup & Teardown
- `--rootDir` - Root directory for setup and teardown scripts

### Examples

```bash
# Run tests with coverage
npm test

# Run tests in watch mode
npx tsx ./bin/test-runner.js **/*.test.ts -w

# Run tests with custom concurrency
npx tsx ./bin/test-runner.js **/*.test.ts -c 4

# Run specific tests by name
npx tsx ./bin/test-runner.js **/*.test.ts --name="#integration"

# Run with GitHub Actions reporter
npx tsx ./bin/test-runner.js **/*.test.ts -r github
```

## Publishing Workflow

1. **Pre-publish checks**: Type checking, linting, tests
2. **Build**: Automatic via `prepack` hook
3. **Package validation**: `npm run tarball:check`
4. **Dry run**: `npm run publish:dry-run`
5. **Publish**: `npm publish`

## Git Hooks

Pre-commit hook runs automatically:
- TypeScript type checking (`tsc --noEmit`)
- Biome linting

## Documentation

- **README.md**: Main package documentation
- **TEMPLATE_USAGE.md**: Guide for using this template
- **TypeDoc**: Auto-generated API documentation (`npm run docs`)

## Best Practices

1. Write tests before or alongside code (TDD)
2. Maintain minimum 80% code coverage
3. Run `npm run check` before committing
4. Use semantic versioning for releases
5. Document public APIs with JSDoc comments
6. Keep dependencies minimal and up to date
7. Test both ESM and CJS usage of your package
