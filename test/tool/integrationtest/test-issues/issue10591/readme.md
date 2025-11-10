# issue10591

Test for GitHub issue #10591: Compiler generates warning on map entry `get(x)` but not `get : function(x)`

## Problem

The qooxdoo compiler was generating spurious "Unresolved use of symbol" warnings when using ES6 shorthand method syntax in delegate objects:

```javascript
delegate: {
  get(property) {  // Warning: Unresolved use of symbol property
    return this[property];
  }
}
```

While traditional function syntax worked without warnings:

```javascript
delegate: {
  get: function(property) {  // No warning
    return this[property];
  }
}
```

## Fix

Added explicit handling for the `delegate` property in the compiler's `ObjectProperty` visitor to ensure proper traversal of ES6 shorthand methods (ObjectMethod nodes).

## Test

This test creates a class with a `delegate` object using ES6 shorthand method syntax. The compilation should succeed without any "Unresolved use of symbol" warnings for the method parameters (`property`, `value`).

Run the test with:
```
qx compile
```

The test passes if compilation completes without warnings about unresolved symbols in the delegate methods.
