# Qooxdoo Release Notes

## Notable changes and new features in v8.0
- Qooxdoo version 8.0 includes a nearly completely rewritten class and
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

- Because the entire class and property system was rewritten, there
  may be other obscure backward-compatibility changes that pop up.
  Those listed above are the only ones that reared their heads while
  confirming that the entire qooxdoo test suite successfully runs to
  completion.

## Licensing and Open Source Ownership

As a team, we are a small group of experienced developers based around the world who use
Qooxdoo every day and have a vested interest in maintaining the project and keeping it strong.

All code is available at GitHub [https://github.com/qooxdoo](https://github.com/qooxdoo),
where we have published policies and rules on contributing; We actively encourage anyone to
submit Pull Requests to contribute to the project.

We chat in public on [Gitter](https://gitter.im/qooxdoo/qooxdoo) and answer questions
on [Stack Overflow](https://stackoverflow.com/questions/tagged/qooxdoo).

[Documentation](https://qooxdoo.org/documentation/#/development/contribute)

