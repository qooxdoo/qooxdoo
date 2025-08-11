# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

qooxdoo is a universal JavaScript framework that enables developers to create applications for multiple platforms (browser, mobile, server). It uses an object-oriented programming model with a comprehensive class system and includes a powerful compiler/toolchain.

Key characteristics:
- Object-oriented JavaScript framework with classes, interfaces, mixins
- Self-contained compiler and CLI toolchain
- Multi-platform support (browser, mobile, server)
- Comprehensive widget system for desktop applications
- Data binding and MVC architecture support

## Common Development Commands

### Build and Compilation
```bash
# Bootstrap the compiler (must be run first after cloning)
node ./bootstrap-compiler

# Run tests
npm test

# Build for development
node ./bin/build/qx compile

# Build for production
node ./bin/build/qx compile --target=build

# Clean build
node ./bin/build/qx compile --clean

# Run with development server
node ./bin/build/qx serve
```

### Testing
```bash
# Run all tests (after pretest bootstrap)
npm test

# Run a single test (example)
node ./bin/build/qx test --class=qx.test.core.Object

# Run tests for specific namespace
node ./bin/build/qx test --namespace=qx.test.bom
```

### Linting
ESLint is configured via the `eslintConfig` section in `compile.json`. Most formatting rules are disabled to focus on logical errors.

## Architecture Overview

### Core Framework Structure

The framework is organized into several key namespaces under `source/class/qx/`:

**Core Foundation (`qx.Bootstrap`, `qx.Class`)**
- `qx.Bootstrap`: Minimal bootstrapping system that enables the class system
- `qx.Class`: Full-featured class system with inheritance, mixins, interfaces
- Object-oriented features: `qx.core.Object` as base class for most framework classes

**Platform Abstraction (`qx.bom.*`)**
- Browser Object Model abstraction layer
- Cross-browser compatibility utilities
- Client detection and feature detection
- DOM manipulation and event handling

**Core Infrastructure (`qx.core.*`)**
- Base object system with properties, events, data binding
- Memory management and object lifecycle
- Environment settings and feature detection
- Assertion and validation systems

**UI System (`qx.ui.*`)**
- Complete widget toolkit for desktop applications
- Layout managers (Grid, VBox, HBox, etc.)
- Form controls, containers, and complex widgets
- Theming and appearance system
- Event handling and focus management

**Data Layer (`qx.data.*`)**
- Data binding system
- Model-View-Controller patterns
- Data stores (JSON, JSONP, REST, Offline)
- Array and object data structures

**Mobile Support (`qx.mobile.*`)**
- Mobile-optimized widgets and layouts
- Touch event handling
- Mobile-specific UI patterns

**Development Tools (`qx.dev.*`, `qx.test.*`)**
- Unit testing framework
- Debugging and profiling tools
- Test infrastructure and utilities

### Compiler Architecture (`qx.tool.compiler.*`)

The qooxdoo compiler is a Node.js-based toolchain that:
- Analyzes JavaScript class dependencies
- Transpiles modern JavaScript to target environments
- Optimizes and minifies code
- Handles resource management (images, translations, themes)
- Supports multiple output targets (browser, Node.js)

Key components:
- `qx.tool.compiler.Analyser`: Dependency analysis and class metadata
- `qx.tool.compiler.targets.*`: Different compilation targets
- `qx.tool.compiler.app.Application`: Application definitions

### Class System Features

qooxdoo uses a sophisticated class system with:

**Class Definition**:
```javascript
qx.Class.define("my.package.MyClass", {
  extend: BaseClass,
  implement: [Interface1, Interface2],
  include: [Mixin1, Mixin2],
  
  construct() {
    super();
  },
  
  properties: {
    myProperty: {
      check: "String",
      init: "default",
      event: "changeMyProperty"
    }
  },
  
  members: {
    myMethod() {
      // Instance methods
    }
  },
  
  statics: {
    MY_CONSTANT: "value"
  }
});
```

**Key Features**:
- Property system with automatic getters/setters, validation, and events
- Multiple inheritance via mixins
- Interface contracts
- Base method calling with `this.base(arguments)`
- Static vs instance members

### Configuration Files

**`compile.json`**: Main compiler configuration
- Defines build targets (source/build for browser/node)
- Application definitions and entry points
- Library dependencies and exclusions
- Babel configuration for transpilation
- ESLint configuration

**`Manifest.json`**: Library metadata
- Namespace and resource paths
- Font definitions and icon fonts
- Environment check mappings
- Version and author information

**`package.json`**: NPM configuration
- Framework dependencies
- Build scripts and CLI commands
- Development tools and transpilers

## File Organization Patterns

- Each class in its own `.js` file matching the namespace
- `__init__.js` files define namespace loading order
- Tests mirror source structure in `qx/test/` namespace
- Resources organized by type (themes, fonts, icons, images)

## Testing Infrastructure

Tests use qooxdoo's built-in testing framework:
- Tests extend `qx.dev.unit.TestCase`
- Organized to mirror source code structure
- Support for async testing, mocking (Sinon.js), and performance tests
- Browser and Node.js test execution

When running tests, use the qx CLI tool rather than calling test runners directly, as it handles the proper compilation and setup.

## Development Workflow

1. **Bootstrap**: Always run `node ./bootstrap-compiler` after cloning
2. **Development**: Use `node ./bin/build/qx compile` for development builds
3. **Testing**: Run `npm test` for full test suite
4. **Changes**: Framework changes require recompilation to take effect

## Key Concepts for Development

- **Class-based OOP**: Use `qx.Class.define()` for all new classes
- **Property System**: Prefer properties over direct member variables
- **Event System**: Use qooxdoo's event system rather than DOM events directly
- **Cross-platform**: Consider browser/mobile/server compatibility
- **Dependencies**: Framework handles automatic dependency resolution
- **Theming**: Use the appearance system rather than direct CSS
- benutze qx aus /bin/source
- die tests in test/tool/integrationstest sind eigenständig keine nativen qooxdoo tests