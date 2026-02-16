# CLAUDE.md

## Project Overview

Qooxdoo v8 (`@qooxdoo/framework`) — universal JavaScript framework with self-hosting compiler. The compiler compiles itself via bootstrap chain: `known-good/` → `bootstrap/` → `bin/source/qx` → `bin/build/qx`.

## Critical Conventions

### File Path Mapping
Class `qx.foo.Bar` → `source/class/qx/foo/Bar.js` (each dot = directory separator). `__init__.js` files contain only namespace documentation, no executable code.

### Naming Conventions
- `I` prefix = Interface (e.g., `IDisposable`)
- `M` prefix = Mixin (e.g., `MEvent`)
- `__` prefix = private members, `_` = protected, no prefix = public
- `$$` prefix = internal system variables (e.g., `$$hash`, `$$disposed`) — never use directly

### Compiler-Processed Annotations (in JSDoc)
These are NOT just documentation — the compiler extracts and processes them:
- `@require(className)` — hard dependency, loaded before this class
- `@use(className)` — soft dependency
- `@ignore(symbolName)` — suppresses undefined symbol warnings (e.g., `@ignore(process)`)
- `@asset(path/pattern)` — declares asset dependencies

### Class System
```javascript
qx.Class.define("my.namespace.ClassName", {
  extend: ParentClass,
  implement: [IInterface],
  include: [MMixin],
  construct() { super(); },
  properties: {
    myProp: { check: "String", event: "changeMyProp", apply: "_applyMyProp" }
  },
  members: { myMethod() { } },
  statics: { MY_CONST: 42 },
  destruct() { }  // NOT "destructor"
});
```

**Gotchas:**
- Constructor MUST call `super()` at the beginning (v8 requirement)
- Destructor key is `destruct`, not `destructor`
- Override inherited property → MUST set `refine: true` or you get an error
- Property event naming: always `change` + CamelCase property name (e.g., `active` → `changeActive`)
- Property access: `obj.myProp` (modern, preferred) or `obj.getMyProp()` / `obj.setMyProp(value)`
- Conditional mixin includes use `qx.core.Environment.filter({...})`

### Do NOT Modify
- `known-good/` — pinned bootstrap compiler, only update intentionally
- ESLint config is inside `compile.json` (not a separate file), and most rules are disabled (`no-undef: off`, etc.) — do not rely on ESLint to catch errors

## Build & Test Commands

```bash
# Initial setup
npm ci && ./bootstrap-compiler

# Compile (watch mode)
./bootstrap/qx compile --watch
./bootstrap/qx compile --app-name=compiler  # compiler only (faster)

# Tests
npm test                                    # Full suite
cd test/framework && ../../bin/source/qx test                          # Framework only
cd test/tool && ../../bin/source/qx test                               # Compiler/CLI only
cd test/framework && ../../bin/source/qx test --class=qx.test.Interface                    # Single class
cd test/framework && ../../bin/source/qx test --class=qx.test.Interface --method=testFoo   # Single method

# Rebuild from scratch (after Node.js version change)
rm -rf ./node_modules ./known-good/node_modules && npm ci && ./bootstrap-compiler
```

## Code Style

- Prettier: `printWidth: 140`, `trailingComma: "none"`, `arrowParens: "avoid"`
- 2 spaces, UTF-8, LF line endings
- `ecmaVersion: 2020`, Node.js >= 20
