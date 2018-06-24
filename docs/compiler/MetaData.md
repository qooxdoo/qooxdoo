# Meta Data

Every time a javascript source file is transpiled, meta data about the class, it's properties, methods, inheritance etc are also serialised into a corresponding `.json` file; for example, where the transpiled code for `qx.core.Object` is output to `transpiled/qx/core/Object.js`, the meta data is in `transpiled/qx/core/Object.json`.

The meta data provides information about the structure of the class as it as written, but also to a large extent provides a description of the class at runtime - it will list as methods property accessors (ie `getXxx`, `setXxx` etc), and the abstract methods which are required because of interfaces, and methods and properties which have been included via mixins.

Another useful feature is that when documentation is missing for a method or property and that method/property is defined in a super class, a mixin, or an interface, then the missing documentation (including JSDoc `@param` and `@return` tags) are copied into the meta data.  

## Common Fields

Many of the objects in the meta data have a set of standard, useful fields; for example:

```json
  "methods": {
    "_createOkButton": {
      "location": {
        "start": {
          "line": 480,
          "column": 4
        },
        "end": {
          "line": 490,
          "column": 5
        }
      },
      "jsdoc": {
        "@description": [
          {
            "name": "@description",
            "body": "Create a cancel button"
          }
        ],
        "@return": [
          {
            "name": "@return",
            "body": "{qx.ui.form.Button}",
            "type": "qx.ui.form.Button",
            "desc": "Returns a new OK button"
          }
        ]
      },
      "type": "function",
      "access": "protected",
      "overriddenFrom": null,
      "appearsIn": [],
      "abstract": false,
      "mixin": false
    }
```

The `location` and `jsdoc` objects appear in just about every meta data object; the `jsdoc` information may be copied from super class, mixin, or interface so that it is readily available.

- `access` - {String} This can be one of "public", "protected", or "private"
- `overriddenFrom` - {String?} The super class where this is most recently overridden from
- `appearsIn` - {String[]?} The superclasses and interfaces where this exists
- `abstract`- {Boolean?} Whether this is an abstract method, ie it is declared in an interface but has not yet been defined in this class
- `mixin` - {Boolean?} Whether this exists only because it was brought in from a mixin



## Class Definition

A typical meta data example looks like this:

```json
{
  "className": "myapp.some.package.MyClass",
  "packageName": "myapp.some.package",
  "name": "MyClass",
  "type": "class",
  "superClass": "qx.ui.container.Composite",
  "interfaces": [ myapp.some.interfaces.IMyInterface ],
  "mixins": [ myapp.some.mixins.MMyMixin ],
  "abstract": true,
  "descendants": [
    "myapp.some.package.MyOtherClass
  ],
  "clazz": { },
  "construct": { },
  "destruct": { },
  "defer": { },
  "properties": { },
  "events": { },
  "members": { }
}  
```

- `className` - {String} the fully qualified name of the class
- `packageName` - {String} the package name of the class
- `name` - {String} the name of the class, without a package name prefix
- `type` - {String} one of "class", "interface", "mixin", or "theme"
- `superClass` - {String?} immediate super class
- `interfaces` - {String[]?} names of interfaces
- `mixins` - {String[]?} names of mixins
- `abstract` - {Boolean?} whether the class is abstract (ie has abstract methods)
- `descendants` - {String[]?} list of classes that have this class as a superclass
- `clazz` - {Object} properties about the class, ie `location` and `jsdoc`
- `construct`, `destruct`, `defer` - {Object} method descriptions (see below)
- `properties` - list of properties, where the key is the property name
- `members` - list of members (not just methods) where the key is the member name

Entries in `members` differ in that their `type` field can be "method" or "variable", but other than that they share the common fields listed above.

## Working example
A good working example is the [TypeScript target](https://github.com/qooxdoo/qooxdoo-compiler/blob/master/lib/qxcompiler/targets/TypeScriptTarget.js) in qooxdoo-compiler.







