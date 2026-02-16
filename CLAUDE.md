# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qooxdoo v8 (`@qooxdoo/framework`) is a universal JavaScript framework with an integrated compiler. The compiler is written in qooxdoo itself (self-hosting), requiring a bootstrap process to compile.

## Build Commands

### Initial Setup
```bash
npm ci
./bootstrap-compiler
```
This creates `./bootstrap/qx`, `./bin/source/qx` (debug), and `./bin/build/qx` (optimized).

If Node.js version changes, rebuild from scratch:
```bash
rm -rf ./node_modules ./known-good/node_modules
npm ci
./bootstrap-compiler
```

### Compiling the Compiler
```bash
./bootstrap/qx compile --watch              # Watch mode, recompiles on changes
./bootstrap/qx compile --app-name=compiler  # Compile only the compiler (faster)
```

### Running Tests
```bash
npm test                                    # Full suite (bootstrap + all tests)

# Framework tests only:
cd test/framework && ../../bin/source/qx test

# Compiler/CLI tests only:
cd test/tool && ../../bin/source/qx test

# Single test class:
cd test/framework && ../../bin/source/qx test --class=qx.test.Interface

# Single test method:
cd test/framework && ../../bin/source/qx test --class=qx.test.Interface --method=testMissingMemberVariable
```

## Architecture

### Self-Hosting Bootstrap
The compiler compiles itself. `known-good/` contains a pinned compiler version used to bootstrap: known-good → bootstrap → source → build.

### Class System
All framework code uses qooxdoo's OO class definition:
```javascript
qx.Class.define("my.namespace.ClassName", {
  extend: ParentClass,
  implement: [IInterface],
  include: [MMixin],
  construct() { super(); },
  properties: { myProp: { check: "String", event: "changeMyProp" } },
  members: { myMethod() { } },
  statics: { MY_CONST: 42 }
});
```
v8 requires `super()` at the beginning of constructors. Properties support native access (`obj.myProp`) and first-class property objects.

### Key Namespaces
- `qx.core` — Base classes (Object, Environment, Class, property system)
- `qx.ui` — Widget framework (desktop/mobile)
- `qx.data` — Data binding and marshalling
- `qx.event` — Event system
- `qx.io` — Network I/O
- `qx.tool.compiler` — Compiler (Analyser, ClassFile, makers, targets, cli)
- `qx.tool.cli` — CLI commands

### Directory Layout
- `source/class/` — All framework and compiler source (qooxdoo classes)
- `source/resource/` — Icons, fonts, SCSS, static assets
- `test/framework/` — Browser-based framework tests (qxl.testtapper)
- `test/tool/` — Node-based compiler tests (qxl.testnode)
- `bin/source/qx` and `bin/build/qx` — Compiled compiler binaries
- `compile.json` — Compiler configuration (targets, applications, ESLint config)

### Compilation Targets (compile.json)
Four applications are built from this repo:
- **compiler** — CLI tool (`qx` command)
- **compilerLibrary** — Node module for programmatic use
- **qx_server** — Server-side qooxdoo OO features
- **qxWeb** — Browser-based jQuery-like API

## Code Style

- Prettier: `printWidth: 140`, `trailingComma: "none"`, `arrowParens: "avoid"`
- EditorConfig: 2 spaces, UTF-8, LF line endings
- ESLint: qooxdoo-specific config (`@qooxdoo/qx`), many standard rules disabled for legacy compatibility
- `ecmaVersion: 2020`
- Node.js >= 20 required
