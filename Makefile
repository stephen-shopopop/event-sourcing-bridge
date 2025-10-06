#!make

## Set 'bash' as default shell
SHELL := $(shell which bash)

## Set 'help' target as the default goal
.DEFAULT_GOAL := help

## Test if the dependencies we need to run this Makefile are installed
MISE := $(shell command -v mise)
NPM := $(shell command -v npm)
BREW := $(shell command -v brew)

## Versions
NODE ?= $(shell cat $(PWD)/.nvmrc 2> /dev/null || echo v24)
MISE_VERSION ?= 2025.7.7

.PHONY: help
help: ## Show this help
	@echo 'Usage: make [target] ...'
	@echo ''
	@echo 'targets:'
	@egrep -h '^[a-zA-Z0-9_\/-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort -d | awk 'BEGIN {FS = ":.*?## "; printf "Usage: make \033[0;34mTARGET\033[0m \033[0;35m[ARGUMENTS]\033[0m\n\n"; printf "Targets:\n"}; {printf "  \033[33m%-25s\033[0m \033[0;32m%s\033[0m\n", $$1, $$2}'

.PHONY: requirements
requirements: ## Check if the requirements are satisfied
ifndef MISE
	@echo "❌ mise is not available. Please install mise first with: make install-mise"
	@exit 1
endif
ifndef NPM
	@echo "❌ npm is not available. Please install Node.js first with: mise install"
	@exit 1
endif
	@echo "✅ All necessary dependencies are already installed!"

.PHONY: install-brew
install-brew: ## Install Homebrew (macOS only)
ifndef BREW
	@echo "🍺 Installing Homebrew..."
	@/bin/bash -c "$$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
	@echo "✅ Homebrew is already installed"
endif

.PHONY: install-mise
install-mise: ## Install mise (modern runtime manager)
ifndef MISE
	@echo "🚀 Installing mise..."
ifdef BREW
	@echo "📦 Installing via Homebrew..."
	@brew install mise
else
	@echo "📦 Installing via curl..."
	@curl https://mise.run | sh
endif
	@echo ""
	@echo "🔰 Setup Instructions:"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Add the following to your shell configuration:"
	@echo ""
	@echo "  # For Zsh (~/.zshrc):"
	@echo "  eval \"\$$(mise activate zsh)\""
	@echo "  alias mr=\"mise run\""
	@echo ""
	@echo "  # For Bash (~/.bashrc):"
	@echo "  eval \"\$$(mise activate bash)\""
	@echo "  alias mr=\"mise run\""
	@echo ""
	@echo "  # For Fish (~/.config/fish/config.fish):"
	@echo "  mise activate fish | source"
	@echo "  alias mr=\"mise run\""
	@echo ""
	@echo "Then restart your shell or run: source ~/.zshrc (or your shell config)"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
	@echo "✅ mise is already installed (version: $$(mise --version))"
endif

.PHONY: install-tools
install-tools: ## Install development tools via mise
	@echo "🔧 Installing development tools..."
	@mise install
	@echo "✅ All tools installed successfully!"
	@mise list

.PHONY: install
install: install-mise install-tools ## Complete installation (mise + tools + dependencies)
	@echo ""
	@echo "📦 Installing project dependencies..."
	@mise run install
	@echo ""
	@echo "✅ Installation complete!"
	@echo ""
	@echo "📚 Quick Start:"
	@echo "  mise run check     - Run checks (actionlint + npm check + tests)"
	@echo "  mise run info      - Show project information"
	@echo "  npm test           - Run tests with coverage"
	@echo "  npm run build      - Build the package"

.PHONY: setup
setup: install ## Complete project setup (alias for install)
	@echo "✅ Project setup complete!"

.PHONY: update
update: ## Update all tools and dependencies
	@echo "🔄 Updating mise..."
	@mise self-update
	@echo ""
	@echo "🔄 Updating tools..."
	@mise upgrade
	@echo ""
	@echo "🔄 Updating npm dependencies..."
	@npm update
	@echo ""
	@echo "✅ All updates complete!"

.PHONY: info
info: ## Show project and environment information
	@mise run info
	@echo ""
	@echo "📦 Installed Tools:"
	@mise list
	@echo ""
	@echo "📋 Node.js Version:"
	@node --version
	@echo ""
	@echo "📋 npm Version:"
	@npm --version

.PHONY: check
check: requirements ## Run all checks (actionlint + type check + lint + tests)
	@mise run check

.PHONY: clean
clean: ## Clean build artifacts and dependencies
	@echo "🧹 Cleaning build artifacts..."
	@npm run clean
	@echo "✅ Clean complete!"

.PHONY: maintenance
maintenance: ## Deep clean (build + node_modules + cache + mise tools)
	@echo "🧹 Running deep maintenance..."
	@mise run maintenance
	@echo "✅ Maintenance complete!"

.PHONY: doctor
doctor: ## Check system health and requirements
	@echo "🩺 Running system health check..."
	@echo ""
	@echo "📋 Homebrew:"
ifdef BREW
	@echo "  ✅ Installed: $$(brew --version | head -1)"
else
	@echo "  ❌ Not installed (run: make install-brew)"
endif
	@echo ""
	@echo "📋 mise:"
ifdef MISE
	@echo "  ✅ Installed: $$(mise --version)"
else
	@echo "  ❌ Not installed (run: make install-mise)"
endif
	@echo ""
	@echo "📋 Node.js:"
ifdef NPM
	@echo "  ✅ Installed: $$(node --version)"
	@echo "  ✅ npm: $$(npm --version)"
else
	@echo "  ❌ Not installed (run: mise install)"
endif
	@echo ""
	@echo "📋 Project:"
	@if [ -d "node_modules" ]; then \
		echo "  ✅ Dependencies installed"; \
	else \
		echo "  ❌ Dependencies not installed (run: npm install)"; \
	fi
	@if [ -d "dist" ]; then \
		echo "  ✅ Build exists"; \
	else \
		echo "  ⚠️  Build not found (run: npm run build)"; \
	fi

.PHONY: uninstall
uninstall: ## Uninstall all mise tools (keeps mise itself)
	@echo "🗑️  Uninstalling all mise tools..."
	@mise uninstall --all
	@echo "✅ All tools uninstalled!"
