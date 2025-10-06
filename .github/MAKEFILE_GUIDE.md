# 🛠️ Makefile Guide

This guide explains how to use the Makefile for managing your development environment with mise.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Available Commands](#-available-commands)
- [Installation](#-installation)
- [Information Commands](#-information-commands)
- [Maintenance](#-maintenance)
- [Troubleshooting](#-troubleshooting)

## 🚀 Quick Start

### First Time Setup

```bash
# Complete installation (Homebrew + mise + tools + dependencies)
make install

# Check system health
make doctor

# Show project information
make info
```

### Daily Development

```bash
# Run all checks (tests, linting, type checking)
make check

# Update all tools and dependencies
make update

# Clean build artifacts
make clean
```

## 📚 Available Commands

### Installation Commands

| Command | Description |
|---------|-------------|
| `make install-brew` | Install Homebrew (macOS only) |
| `make install-mise` | Install mise (modern runtime manager) |
| `make install-tools` | Install development tools via mise |
| `make install` | **Complete installation** (all-in-one) |
| `make setup` | Alias for `make install` |

### Information Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make doctor` | System health check |
| `make info` | Show project & environment info |
| `make requirements` | Check if requirements are met |

### Development Commands

| Command | Description |
|---------|-------------|
| `make check` | Run all checks (actionlint + type check + lint + tests) |

### Maintenance Commands

| Command | Description |
|---------|-------------|
| `make clean` | Clean build artifacts only |
| `make maintenance` | Deep clean (build + node_modules + cache + tools) |
| `make uninstall` | Uninstall all mise tools (keeps mise itself) |
| `make update` | Update mise, tools & npm dependencies |

## 🔧 Installation

### Step 1: Install Homebrew (macOS only)

```bash
make install-brew
```

This will:
- Check if Homebrew is already installed
- Install Homebrew if needed
- Skip if already installed

### Step 2: Install mise

```bash
make install-mise
```

This will:
- Install mise via Homebrew (if available) or curl
- Show shell configuration instructions
- Create alias `mr` for `mise run`

**Important**: After installing mise, add to your shell config:

```bash
# For Zsh (~/.zshrc)
eval "$(mise activate zsh)"
alias mr="mise run"

# For Bash (~/.bashrc)
eval "$(mise activate bash)"
alias mr="mise run"

# For Fish (~/.config/fish/config.fish)
mise activate fish | source
alias mr="mise run"
```

Then restart your shell:
```bash
source ~/.zshrc  # or your shell config
```

### Step 3: Install Development Tools

```bash
make install-tools
```

This will install all tools defined in `mise.toml`:
- actionlint (GitHub Actions linter)
- lazydocker (Docker TUI)
- lazygit (Git TUI)
- neovim (Editor)
- node (JavaScript runtime)
- @antfu/ni (Package manager wrapper)
- prettier (Code formatter)
- ripgrep (Fast search tool)

### All-in-One Installation

```bash
make install
```

This runs all installation steps in sequence:
1. Install mise
2. Install development tools
3. Install npm dependencies
4. Shows quick start guide

## 📊 Information Commands

### System Health Check

```bash
make doctor
```

Output example:
```
🩺 Running system health check...

📋 Homebrew:
  ✅ Installed: Homebrew 4.6.15

📋 mise:
  ✅ Installed: 2025.9.19 macos-x64

📋 Node.js:
  ✅ Installed: v24.8.0
  ✅ npm: 11.6.0

📋 Project:
  ✅ Dependencies installed
  ✅ Build exists
```

### Project Information

```bash
make info
```

Shows:
- Project name
- Installed tools with versions
- Node.js version
- npm version

### Check Requirements

```bash
make requirements
```

Verifies that all required tools are installed.

## 🧹 Maintenance

### Clean Build Artifacts

```bash
make clean
```

Removes:
- `dist/` directory
- Built files

### Deep Clean

```bash
make maintenance
```

Removes:
- Build artifacts
- `node_modules/`
- npm cache
- All mise tools

**Warning**: This is destructive. You'll need to reinstall everything.

### Update Everything

```bash
make update
```

Updates:
1. mise itself (`mise self-update`)
2. All mise tools (`mise upgrade`)
3. npm dependencies (`npm update`)

### Uninstall Tools

```bash
make uninstall
```

Removes all mise tools but keeps mise itself installed.

## 🐛 Troubleshooting

### mise command not found

**Problem**: After installing mise, the command is not found.

**Solution**:
1. Make sure you added the activation script to your shell config:
   ```bash
   eval "$(mise activate zsh)"  # or bash/fish
   ```
2. Restart your shell:
   ```bash
   source ~/.zshrc  # or your shell config
   ```

### npm not found

**Problem**: npm command is not available.

**Solution**:
1. Install Node.js via mise:
   ```bash
   mise install
   ```
2. Check if it's in your PATH:
   ```bash
   make doctor
   ```

### Tools not installing

**Problem**: `make install-tools` fails.

**Solution**:
1. Check mise is installed:
   ```bash
   mise --version
   ```
2. Try updating mise:
   ```bash
   make update
   ```
3. Check mise.toml is valid:
   ```bash
   cat mise.toml
   ```

### Homebrew issues (macOS)

**Problem**: Homebrew installation fails.

**Solution**:
1. Check Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
2. Try manual Homebrew installation:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

## 💡 Tips & Best Practices

### 1. Use Aliases

The Makefile creates a `mr` alias for `mise run`. Use it for quick task execution:

```bash
mr check      # Instead of: mise run check
mr info       # Instead of: mise run info
mr install    # Instead of: mise run install
```

### 2. Regular Updates

Keep your tools updated:

```bash
# Weekly or bi-weekly
make update
```

### 3. Health Checks

Run health checks when things seem off:

```bash
make doctor
```

### 4. Clean Builds

If you encounter build issues:

```bash
make clean
npm run build
```

### 5. Fresh Start

For a completely fresh environment:

```bash
make maintenance  # Clean everything
make install      # Reinstall everything
```

## 🔗 Related Documentation

- [mise Documentation](https://mise.jdx.dev/)
- [Homebrew Documentation](https://docs.brew.sh/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)

## 📝 Quick Reference

```bash
# Installation
make install              # Complete setup
make install-mise         # Install mise only
make install-tools        # Install dev tools

# Information
make help                 # Show all commands
make doctor              # System health check
make info                # Project info

# Development
make check               # Run all checks

# Maintenance
make clean               # Clean build
make update              # Update everything
make maintenance         # Deep clean

# Troubleshooting
make doctor              # Diagnose issues
make requirements        # Check requirements
```

---

**Happy coding! 🎉**
