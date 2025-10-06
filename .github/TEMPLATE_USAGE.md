# 📦 Using This Package Template

This guide explains how to use this template to create a new Node.js package.

## 🚀 Quick Start

### 1. Create a New Repository from Template

1. Click "Use this template" on GitHub
2. Choose "Create a new repository"
3. Name your new package
4. Clone your new repository

### 2. Customize Your Package

Replace all placeholder values with your package-specific information:

#### Update `package.json`

```json
{
  "name": "@stephen-shopopop/<your-package-name>",
  "description": "Your package description",
  "version": "0.1.0",
  "keywords": ["your", "keywords"],
  "homepage": "https://github.com/stephen-shopopop/<your-package-name>#readme",
  "bugs": {
    "url": "https://github.com/stephen-shopopop/<your-package-name>/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/stephen-shopopop/<your-package-name>.git"
  }
}
```

#### Update `README.md`

Replace these placeholders throughout the README:

- `<package-name>` → your actual package name
- `<you-package-name>` → your package short name
- Update the description and features to match your package

#### Update `LICENSE`

- Update the year if needed
- Update the copyright holder name if different

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development

```bash
# Run tests in watch mode
npx tsx ./bin/test-runner.js **/*.test.ts -w

# Run linting
npm run lint

# Check types
npm run check
```

### 5. Write Your Code

1. Edit `src/index.ts` with your package logic
2. Add tests in `test/` directory
3. Update documentation as you go

### 6. Build and Test

```bash
# Type check and run tests with coverage
npm test

# Build the package
npm run build

# Preview package contents
npm run tarball:check
```

### 7. Publish

```bash
# Dry run first
npm run publish:dry-run

# Publish to npm
npm publish
```

## 📝 Checklist

Before publishing your package, ensure you've:

- [ ] Updated all placeholders in `package.json`
- [ ] Updated all placeholders in `README.md`
- [ ] Updated the package description
- [ ] Added your package code in `src/`
- [ ] Written tests for your code
- [ ] Achieved coverage thresholds (80% minimum)
- [ ] Updated LICENSE year/holder if needed
- [ ] Run `npm run check` successfully
- [ ] Run `npm test` successfully
- [ ] Run `npm run build` successfully
- [ ] Tested the package locally
- [ ] Added appropriate keywords
- [ ] Updated repository URLs
- [ ] Set correct npm access (public/private)

## 🔧 Configuration Files

### Files to Keep As-Is

- `biome.json` - Linting and formatting configuration
- `tsconfig.json` - TypeScript configuration
- `.editorconfig` - Editor configuration
- `.gitignore` - Git ignore patterns
- `.npmignore` - npm publish ignore patterns
- `.nvmrc` - Node version
- `mise.toml` - Mise configuration

### Files to Customize

- `package.json` - Package metadata and scripts
- `README.md` - Package documentation
- `LICENSE` - License file
- `src/index.ts` - Your package code

## 📚 Template Features

This template includes:

### Build System

- **tsup** - Fast TypeScript bundler
- Dual package (ESM + CJS) support
- TypeScript declarations generation

### Testing

- **node:test** - Native Node.js test runner
- **c8** - Code coverage
- Coverage thresholds enforcement
- Watch mode for development

### Code Quality

- **Biome** - Fast linting and formatting
- **TypeScript** - Type checking
- **simple-git-hooks** - Pre-commit checks

### Development Tools

- Test runner with custom options
- Documentation generation with TypeDoc
- Dependency update tools
- Package preview tools

## 🎯 Best Practices

1. **Keep dependencies minimal** - Only add what you need
2. **Write tests first** - TDD approach recommended
3. **Document as you code** - Update README with examples
4. **Use semantic versioning** - Follow semver for releases
5. **Run checks before commits** - Git hooks will help
6. **Test the built package** - Use `npm pack` to test locally

## 🆘 Common Tasks

### Add a New Dependency

```bash
# Production dependency
npm install package-name

# Development dependency
npm install -D package-name
```

### Update Dependencies

```bash
# Check for updates
npm run deps:update

# Find unused dependencies
npm run deps:unused
```

### Generate Documentation

```bash
npm run docs
```

### Test Locally in Another Project

```bash
# In your package directory
npm pack

# In another project
npm install /path/to/your-package-0.1.0.tgz
```

## 📖 Additional Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Biome Documentation](https://biomejs.dev/)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [tsup Documentation](https://tsup.egoist.dev/)

---

**Happy coding! 🎉**
