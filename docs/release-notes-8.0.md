# Qooxdoo Release Notes

## Notable changes and new features in v8.0
- **New property system**: Qooxdoo version 8.0 includes a nearly completely rewritten class and
  property system. The benefits of this rewrite include easier
  debugging into internals of properties when unexpected behavior is
  anticipated, and some new, exciting property features:

  - Properties are now native. Whereas previously you
    would assign a new value to a property with a setter function,
    e.g., for property `myProp`, `this.setMyProp(23);`, and you can
    still do that, you can now also simply assign to the property as
    if it were a normal member variable, e.g., `myProp = 23;`... while
    still having all of the capabilities of properties, such as the
    `check`, `validate`, and `apply` methods, etc. Similarly, in
    addition too the traditional getter, `let value =
    this.getMyProp();`, you can use the native nature of the
    property, `let value = myProp;`

  - Properties can now be initialized with reference values, using the
    new `initFunction` feature instead of `init`. `initFunction` must
    point to, as its name implies, a function. That function is called
    with each new instantiation of the class, so it may return a new
    reference type for each instance. (With `init`, the reference is
    evaluated when the class is created, so there is one and only one
    reference object shared among all instances of the class. Using
    `initFunction` eliminates the need to assign initial values of
    properties storing reference types in the constructor. They can
    now be specified within the definition of the property, and the
    `initFunction` will be called to initialize the value each time a
    new instance of the class is instantiated.

  - Properties can be configured as immutable. There are two types of
    immutability:
    - Any property's configuration can specify `immutable :
      "readonly"` so that its value is set by its `init` or
      `initFunction` and can not otherwise be altered.
    - Properties with `check : "Array"` or `check : "Object"` can be
      marked as `immutable : "replace"`. Doing so will ensure that the
      initially allocated array or object, created in the property's
      `initFunction`, continues to be used, so that when a new array
      or object is provided to the setter, the *values* in the
      original array or object are replaced by those in the array or
      object passed to the setter, rather than replacing the entire
      array with what's specified in the setter. In other words, the
      initialized array or object becomes immutable, and its values
      are replaced by those in the argument to a setter call.

  - Storage of property values can be completely replaced. In addition
    to developers being able to create their own storage mechanism,
    there are some built-in storage mechanisms:
    - `qx.core.propertystorage.Default` is (duh!) the default one. It
      stores values in the object containing the property.
    - `qx.core.propertystorage.ImmutableArray` is used for `check :
      Array` properties. It intercepts set operations, replacing all
      elements in the existing array with the elements in the given
      array. This is how `immutable : "replace"` is implemented for
      `check : "Array"` properties.
    - `qx.core.propertystorage.ImmutableObject` is used for native
      Object properties. It intercepts set operations, replacing all
      members of the existing object with the elements in the given
      object. This is how `immutable : "replace"` is implemented for
      `check : "Object"` properties.

  - Properties are maintained in a Property Registry. This allows
    retrieving a Property Descriptor for a property, and accessing its
    methods. For example, you might set a property value via the
    descriptor like so:
   
    ```
      let propDesc = myClassInstance.getPropertyDescriptor("myProp");
      propDesc.set(2);
    ```
    
  - Async properties can now provide a `get` function, in addition to
    the `apply` function.

  - A class can specify an (experimental) `delegate` which intercepts
    attempts to set or get values on an instance that are not
    properties.

  - `qx.data.Array` has experimental support, using the new class
    `delegate` feature, for native access to array items. An instance of
    `qx.data.Array` now intercepts access to numeric properties, so that
    the following code would work as intuitively expected:

    ```
    let arr = new qx.data.Array( [ 10, 11, 12 ] );

    arr.setItem(0, 20); // traditional way to change values
    arr[1] = 21;        // new expermental way to change values
    delete arr[1];      // identical to arr.removeAt(1)
    ```

  -  v8 introduces the ability to automatically call property `apply` methods during object construction when properties have `init` values. 
       - This is **disabled by default** to maintain backward compatibility with v7 behavior.
       - **Default behavior (v7 compatible):**
    `apply` methods are NOT called during initialization (same as v7)<br/>
       - **How to enable new behavior (opt-in):** If you want apply methods to execute during construction, set this environment variable in your `compile.json`:

        ```
        "environment": {
        "qx.core.property.Property.applyDuringConstruct": true
        }
        ```
    
        **Note:** When enabled, qooxdoo framework classes (starting with `qx.`) are excluded by default. This primarily affects user-defined classes.

- **New CLI Architecture**: The CLI system has been modernized by
  moving from yargs to a custom CLI class-based architecture. This
  provides better maintainability, more flexibility for extensions, and
  improved type safety. The new system uses dedicated classes like
  `qx.tool.cli.Flag`, `qx.tool.cli.Argument`, and `qx.tool.cli.Command`
  for building command-line interfaces. While this is a breaking change
  for projects using `compile.js` to extend commands, the new
  architecture provides a cleaner and more powerful API.

- **ESLint 9 Support with Flat Config**: Qooxdoo v8 migrates to ESLint
  9, which uses the new "Flat Config" format. Key improvements include:
  - More intuitive configuration structure using arrays of config objects
  - Better file pattern matching with the `files` property
  - Clearer separation of concerns with dedicated `ignores` configurations
  - More flexible plugin system with direct imports
  - **Automatic Migration**: Existing `eslintConfig` in `compile.json`
    is automatically converted to the new format, ensuring a smooth
    transition. All Qooxdoo-specific ESLint rules are retained.
  - **Node.js 20+**: This upgrade requires Node.js >= 20.0.0, bringing
    the compiler up to date with modern JavaScript tooling standards.

- **Significantly Reduced Package Size**: The `qx.locale` classes have
  been reimplemented using the native [Internationalization
  API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
  instead of bundling the extensive [Common Locale Data
  Repository](http://cldr.unicode.org) npm package with its numerous
  CLDR XML files. This change:
  - Dramatically reduces the installed Qooxdoo package size
  - Improves installation speed
  - Leverages browser-native internationalization capabilities
  - Maintains compatibility with minimal differences (e.g., date format
    patterns may vary slightly in some locales)
  - Provides better performance by using optimized native implementations

- **Automatic Migration Tool**: Qooxdoo v8 includes a comprehensive
  automatic migration tool (`qx migrate`) to help upgrade applications
  from v7 to v8. The migration tool:
  - Automatically updates Manifest.json and dependencies
  - Replaces deprecated API patterns (e.g., `instance.name` →
    `instance.classname`)
  - Upgrades installed packages to v8-compatible versions
  - Provides detailed warnings and guidance for manual changes
  - Supports dry-run mode to preview changes before applying them
  - Offers verbose mode for detailed migration logs

  This significantly simplifies the upgrade process and ensures that
  developers are aware of all necessary changes.

- **Improved Developer Experience**:
  - **Better Debugging**: The rewritten class and property system makes
    it much easier to debug property internals when investigating
    unexpected behavior. Property values and their lifecycle are more
    transparent.
  - **More Intuitive API**: Native properties allow direct assignment
    and access, making code more readable and closer to standard
    JavaScript patterns while maintaining all property system benefits.
  - **Enhanced Type Safety**: The new architecture provides better
    opportunities for TypeScript integration and type checking.
  - **Clearer Error Messages**: Property check validation now provides
    more helpful error messages at class load time rather than at
    runtime.

## Breaking changes in v8.0

- The new class/property system is implemented using the JavaScript
  feature `Proxy`, so a new requirement of the JavaScript engine being
  used, with qooxdoo 8.0+, is that it supports `Proxy`. This,
  unfortunately, means that support for the Rhino runtime is no longer
  available.

- Properties and members are now in the same namespace. Formerly, a
  class could have a member variable and a property with the same
  name, and there was no conflict. Now, since properties are
  native and can be manipulated as normal members, the properties
  and members use the same namespace, so a single name can not be
  defined in both.
  
- Refining a property in a subclass used to modify it in place. It now
  adds it to the subclass' prototype, so it ends up in the prototype
  chain twice.
  
- The predefined `instance.name` variable is no longer predefined
  because, with native properties, it conflicts with the commonly
  used property name `name`. Use `instance.classname` instead.
  
- Defining a property `check` pseudo-function as a string is no longer
  supported. Doing so will now generate an error at class load time.

- It was formerly technically possible to define the same class twice,
  and have the configurations merged. That could only be done by
  defining classes within classes, since otherwise, it is required
  that the path name match the class name. Merging of configurations
  is no longer supported. Each class must be defined only once. A
  class can be redefined by undefining it and then redefining it.

- Fixed an inconsistency where setting an appearance and then setting
  a font color, in some cases, would continue to use the appearance's
  font color. Now, setting a font after setting an appearance uses the
  specified font's color.
  
- The following properties have been renamed to avoid conflicts with
  members of the same names, now that properties and members are in
  the same namespace:
  - `qx.event.handler.Focus`, property `focus`, renamed to `focusedElement`
  - `qx.ui.form.Button`, property `capture`, renamed to `captureCamera`
  - `qx.io.jsonrpc.protocol.Error`, property `error`, renamed to `errorDetail`
  - `qx.ui.form.SplitButton`, property `show`, renamed to `showFeatures`
  - `qx.ui.menubar.Button`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.FleSelectorButton`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.Part`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.CheckBox`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.Button`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.ToolBar`, property `show`, renamed to `showFeatures`
  - `qx.ui.toolbar.PartContainer`, property `show`, renamed to `showFeatures`
  - `qx.ui.basic.Atom`, property `show`, renamed to `showFeatures`
  - `qx.ui.mobile.basic.Atom`, property `show`, renamed to `showFeatures`

- Classes that extend `qx.core.Object` (or any subclass) MUST call `super()` in their constructor before accessing properties or setting property values. If `super()` is not called, you will see warnings like `"No $$propertyValues on [ClassName]: possibly missing call to super() in the constructor"`. Make sure all your constructors include a `super()` call at the beginning.

  Example:
  ```javascript
  construct() {
    super();  // Required in v8!
    this.setMyProperty("value");
  }
  ```

- Any property setters called BEFORE `super()` or `this.base(arguments)` will be reset when the parent constructor executes. You must move all property setter calls to occur after the parent constructor invocation.

  v7 (worked but now broken in v8):
  ```javascript
  construct(svg, width, height) {
    this.setWidth(width);   // These values will be lost!
    this.setHeight(height);
    this.base(arguments);
  }
  ```

  v8 (correct approach):
  ```javascript
  construct(svg, width, height) {
    this.base(arguments);   // Call parent first!
    this.setWidth(width);   // Now set properties
    this.setHeight(height);
  }
  ```

- Because the entire class and property system was rewritten, there
  may be other obscure backward-compatibility changes that pop up.
  Those listed above are the only ones that reared their heads while
  confirming that the entire qooxdoo test suite successfully runs to
  completion.

- Moves from yArgs to own CLI classes. If you
  use `compile.js` to add commands to existing commands, the syntax has
  changed:

  Old syntax:
  ```javascript
  async load() {
    let yargs = qx.tool.cli.commands.Test.getYargsCommand;
    qx.tool.cli.commands.Test.getYargsCommand = () => {
      let args = yargs();
      args.builder.diag = {
        describe: "show diagnostic output",
        type: "boolean",
        default: false
      };
    }
  }
  ```

  New syntax:
  ```javascript
  async load() {
    let originalCreateCliCommand = qx.tool.compiler.cli.commands.Test.createCliCommand;
    qx.tool.compiler.cli.commands.Test.createCliCommand = async function(clazz) {
      let cmd = await originalCreateCliCommand.call(this, clazz);

      cmd.addFlag(
        new qx.tool.cli.Flag("diag").set({
          description: "show diagnostic output",
          type: "boolean",
          value: false
        })
      );
    }
  }
  ```

- Setting model data for a `qx.ui.table.Table`
  when the table is still editing will now raise an error as this could
  have lead to an invalid edit. To prevent any errors, ensure that the
  table edits are completed or cancelled before refreshing table model
  data.

- ESLint 8 → ESLint 9 Migration: This requires **Node.js >= 20.0.0**
  for the compiler. Plugin resolution changes, plugin names must be
  complete:
  - Old: `@qooxdoo/qx`
  - New: `@qooxdoo/eslint-plugin-qx` or full import

  Main features of Flat Config:
  1. Array structure: eslintConfig is now an array of config objects instead of a single object
  2. ignores: Replaces ignorePatterns, as a separate config object
  3. languageOptions: Combines parserOptions, globals and env
  4. files: Specifies which files the config affects
  5. plugins: Plugin configuration directly in the config object
  6. Multiple config objects: Allows different rules for different file patterns

  Old (ESLint < 9):
  ```json
  "eslintConfig": {
    "extends": [...],
    "rules": {...}
  }
  ```

  New (ESLint >= 9 Flat Config):
  ```json
  "eslintConfig": [
    { "ignores": [...] },
    { "files": [...], "rules": {...} }
  ]
  ```

  ✅ Old `eslintConfig` in `compile.json` is automatically converted
  ✅ All existing Qooxdoo-specific rules are retained
  ✅ No changes to existing projects required (except Node.js version)

- `qx.locale` classes are now implemented
  with the [Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
  instead of the [Common Locale Data Repository](http://cldr.unicode.org)
  npm package which is installed with a lot of CLDR xml files. This
  change reduces an installed qooxdoo package size significantly. There
  may be some differences for some locales. For example,
  `getDateTimeFormat` method for `de_DE` and `yM` format gives `M/y`
  instead of `MM/y` of the CLDR implementation.

- It was previously possible to get and set
  theme and user values, independently of the proper property mechanism;
  this is no longer allowed, although there are ways to detect if a user
  or theme value is set. The methods in this class now return instances
  of `qx.core.property.Property` (or maps etc) and not the POJOs used in
  previous versions of Qooxdoo.

- Bindings are setup to copy between the
  command and the widget, which are then overwritten by theme values;
  why this happens is not explained, and IMHO changes the property
  values in unexpected ways (and will be overwritten by subsequent
  property changes anyway). This no longer happens, and ordinary
  bindings are used instead.

- **Deprecated APIs Removed**: The following deprecated APIs from v6.0 and v6.1 have been removed in v8:

  **Entire Classes Removed:**
  - `qx.dev.ObjectSummary` - deprecated since v6.0 (automatic memory management makes this unnecessary)
  - `qx.log.appender.Util` - deprecated since v6.0 (use `qx.log.appender.Formatter` instead)
  - `qx.ui.table.model.Filtered` - deprecated since v6.0 (use `Array.filter()` method instead)

  **Methods Removed:**
  - `qx.data.Array.contains(item)` - deprecated since v6.0 (use `includes(item)` instead)
  - `qx.lang.Array.contains(arr, obj)` - deprecated since v6.0 (use `arr.includes(obj)` instead)
  - `qx.lang.Object.getValues(map)` - deprecated since v6.0 (use `Object.values(map)` instead)
  - `qx.lang.String.startsWith(fullstr, substr)` - deprecated since v6.0 (use native `String.prototype.startsWith()` instead)
  - `qx.lang.String.endsWith(fullstr, substr)` - deprecated since v6.0 (use native `String.prototype.endsWith()` instead)
  - `qx.ui.virtual.selection.Abstract.detatchPointerEvents()` - deprecated since v6.0 (use `detachPointerEvents()` instead)
  - `qx.core.ObjectRegistry.shutdown()` - deprecated since v6.0 (automatic garbage collection preferred)
  - `qx.log.appender.Formatter.toTextArray(entry)` - deprecated since v6.0 (use `toText()` instead)
  - `qx.html.Node._flush()` - deprecated since v6.0 (use `flush()` instead)
  - `qx.html.Node._applyProperty(name, value)` - deprecated since v6.0 (use `registerProperty()` instead)
  - `qx.ui.table.Table._onKeyPress(evt)` - deprecated since v6.0 (use `_onKeyDown()` instead)
  - `qx.event.Manager.getGlobalEventMonitor()` - deprecated since v6.0 (use `addGlobalEventMonitor()` instead)
  - `qx.event.Manager.setGlobalEventMonitor(fn)` - deprecated since v6.0 (use `addGlobalEventMonitor()` instead)
  - `qx.html.Element.fromDomElement(domElement)` - deprecated since v6.1 (use `qx.html.Node.fromDomNode()` instead)
  - `qx.html.Element.connectWidget(widget)` - deprecated since v6.1 (use `connectObject()` instead)
  - `qx.html.Element.disconnectWidget(widget)` - deprecated since v6.1 (use `disconnectObject()` instead)

  **Properties Removed:**
  - `qx.core.ObjectRegistry.inShutDown` - deprecated since v6.0 (shutdown is not a valid mechanism)


## Migration from v7 to v8

Qooxdoo v8 includes an automatic migration tool to help upgrade your
application from v7 to v8. The migration tool will:

### Automatic Migrations:
- Update Manifest.json and dependencies
- Upgrade installed packages to v8-compatible versions

### Manual Review Required:
The migration tool will warn you about the following items that require
manual review and adjustment:

1. **Form.add() Name Parameters**: The migration tool will scan for
   `.add()` calls with uppercase name parameters and report them. Fix
   any found issues by changing the name to start with a lowercase
   letter (e.g., "MyField" → "myField").

2. **instance.name → instance.classname**: Replace all uses of
   `instance.name` with `instance.classname` throughout your codebase.

3. **CLI System Changes**: If you use `compile.js` to extend commands,
   you need to migrate from yargs to the new CLI class syntax (see
   example above).

4. **Property/Member Namespace Conflicts**: Review your class
   definitions for any conflicts where both a property and member have
   the same name.

5. **Table Model Updates**: Ensure that table edits are completed or
   cancelled before setting table model data.

6. **Node.js Version**: Verify you are using Node.js >= 20.0.0.

7. **Locale Functionality**: Test your locale-specific functionality as
   the implementation has changed from CLDR to the native Intl API.

8. **Property Check Functions**: Ensure property `check` configurations
   use functions or classes, not strings.

9. **Renamed Properties**: If you use any of the renamed properties
   listed above (e.g., `qx.event.handler.Focus.focus` →
   `focusedElement`), update your code accordingly.

### Running the Migration:

First, perform a dry-run to see what changes would be made:
```bash
qx migrate --dry-run --verbose
```

Then execute the migration:
```bash
qx migrate --verbose
```

The migration tool supports both `--dry-run` mode (to preview changes
without applying them) and `--verbose` mode (for detailed output).

**Note**: After running the migration tool, thoroughly test your
application as the v8 release includes significant internal changes to
the class and property system.

## Licensing and Open Source Ownership

As a team, we are a small group of experienced developers based around the world who use
Qooxdoo every day and have a vested interest in maintaining the project and keeping it strong.

All code is available at GitHub [https://github.com/qooxdoo](https://github.com/qooxdoo),
where we have published policies and rules on contributing; We actively encourage anyone to
submit Pull Requests to contribute to the project.

We chat in public on [Gitter](https://gitter.im/qooxdoo/qooxdoo) and answer questions
on [Stack Overflow](https://stackoverflow.com/questions/tagged/qooxdoo).

[Documentation](https://qooxdoo.org/documentation/#/development/contribute)

