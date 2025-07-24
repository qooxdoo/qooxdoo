# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Qooxdoo JavaScript Framework repository - a universal JavaScript framework for creating rich interactive applications (RIAs), mobile apps, desktop applications, and server-side applications. Qooxdoo is a mature, object-oriented framework with its own class system, data binding, comprehensive widget set, and integrated toolchain.

## Development Commands

### Setup and Bootstrap
```bash
# Initial setup
npm ci
./bootstrap-compiler  # Creates bootstrap compiler needed for development

# If you change Node.js version, clean and rebuild:
rm -rf ./node_modules
rm -rf ./known-good/node_modules
npm ci
./bootstrap-compiler
```

### Building and Compilation
```bash
# Compile the compiler (for development on the compiler itself)
./bootstrap/qx compile --watch

# Compile only specific application
./bootstrap/qx compile --watch --app-name=compiler

# Deploy build (for production)
npm run prepack
```

### Testing
```bash
# Run all tests (lint, compiler, and framework tests)
npm test

# Run framework tests only
cd test/framework
../../bin/source/qx test

# Run compiler/CLI tests only  
cd test/tool
../../bin/source/qx test

# Run specific test class
cd test/framework
../../bin/source/qx test --class=qx.test.Interface

# Run specific test method
cd test/framework  
../../bin/source/qx test --class=qx.test.Interface --method=testMissingMemberVariable

# Quiet mode (for CI/automated testing)
node ./bin/build/qx test --colorize=false --quiet
```

### Development Tools
```bash
# Build development tools
npm run devtools

# Build website resources
npm run website
```

## Architecture Overview

### Core Framework Structure
- **source/class/qx/**: Main framework classes organized by namespace
  - `qx.core.*`: Core functionality (Object, Property, Environment, etc.)
  - `qx.ui.*`: Desktop widget toolkit (not present in this framework-only repo)
  - `qx.bom.*`: Browser Object Model abstraction layer
  - `qx.dom.*`: DOM manipulation utilities  
  - `qx.event.*`: Event system with unified event handling
  - `qx.data.*`: Data binding and model classes
  - `qx.io.*`: I/O operations (XHR, JSONP, WebSocket, etc.)
  - `qx.lang.*`: Language utilities and polyfills
  - `qx.util.*`: General utility classes
  - `qx.test.*`: Framework test classes

### Key Applications Built
The framework builds multiple applications (see compile.json):
1. **compiler**: CLI tool accessible via `./bin/(source|build)/qx`  
2. **compilerLibrary**: Node module with qx.tool namespace for server use
3. **qx_server**: Server-side qooxdoo OO features for Node.js (includes core, data, I/O, and testing utilities)
4. **qxWeb**: Lightweight jQuery-like library for browser use

### Build System
- **compile.json**: Main compilation configuration
- **Manifest.json**: Framework package metadata and dependencies
- **bootstrap-compiler**: Special bootstrap process for self-hosting compiler
- Uses Babel for modern JavaScript transpilation
- Supports both source (development) and build (production) targets
- ESLint configuration with qooxdoo-specific rules

### File Organization
- **source/class/**: Framework source code
- **source/resource/**: Static resources (CSS, images, fonts)
- **source/translation/**: I18n translation files
- **test/framework/**: Framework unit tests  
- **test/tool/**: Compiler and CLI integration tests
- **docs/**: Comprehensive documentation in Markdown format

## Development Notes

### Self-Hosting Architecture
The framework and compiler are compiled using the compiler itself (bootstrapping). The bootstrap process creates multiple compiler versions:
- `./bootstrap/qx`: Bootstrap compiler
- `./bin/source/qx`: Source-compiled version for development
- `./bin/build/qx`: Build-compiled version for production

### Class System
Qooxdoo uses its own class-based OOP system with:
- Classes defined via `qx.Class.define()`
- Interfaces via `qx.Interface.define()`  
- Mixins via `qx.Mixin.define()`
- Comprehensive property system with data binding
- Event system with bubbling and capture phases

### Testing Framework
- Unit tests extend `qx.dev.unit.TestCase`
- Framework tests in `qx.test.*` namespace
- Tool tests use Node.js with TAP (Test Anything Protocol)
- Sinon.js integration for mocking and stubbing

### Key Configuration Files
- **package.json**: NPM package with build scripts and dependencies
- **compile.json**: Qooxdoo compiler configuration with targets and applications
- **Manifest.json**: Framework metadata, dependencies, and environment checks
- **.eslintrc**: ESLint configuration with qooxdoo-specific rules

## Important Development Notes

When working on this codebase, remember:
- Changes to the compiler require recompilation with `./bootstrap/qx compile --watch`
- Always run `npm test` before submitting changes to ensure all tests pass
- The framework is self-hosting - the compiler compiles itself via bootstrapping
- Use `./bin/source/qx` for development and `./bin/build/qx` for production builds
- ESLint configuration in compile.json has many rules disabled due to legacy codebase constraints