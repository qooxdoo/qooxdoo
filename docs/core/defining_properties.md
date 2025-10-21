# Properties in more detail


> :memo: Please take a look at `property_features` first to get a compact overview of
> the available features.

## Declaration

The following code creates a property `myProperty` and the corresponding
functions like `setMyProperty()` and `getMyProperty()`.

```javascript
qx.Class.define(
...
properties : {
  myProperty : { nullable : true }
}
...
```

You should define at least one of the attributes `init`, `nullable` or
`inheritable`. Otherwise, the first call to the getter would stop with an
exception because the computed value is not (yet) defined.

> :memo: As an alternative to the `init` key you could set the init value of the property
> by calling an initializing function `this.initMyProperty(value)` in the
> constructor. See below for details.


Please also have a look at the [Quick Reference](properties_quickref) .

## Handling changes of property values

You have multiple possibilities to react on each property change. With _change_
the modification of a property is meant, where the old and the new values differ
from each other.

As a class developer the easiest solution with the best performance is to define
an apply method. As a user of a class (the one who creates instances) it is the
best to simply attach an event listener to the instance, if such a
corresponding event is provided in the property declaration.

### Defining an apply method

To attach an apply method you must add a key `apply` to your configuration which
points to a name of a function which needs to be available in your `members`
section. As the apply method normally should not be called directly, it is
always a good idea to make the method at least protected by prefixing the name
with an underscore `_` .

The return value of the apply method is ignored. The first argument is the
actual value, the second one is the former or old value. The last argument is
the name of the property which can come very handy if you use one apply method
for more than one property. The second and third arguments are optional and may
be left out.

#### Example

```javascript
properties : {
  width : { apply : "_applyWidth" }
},

members :
{
  _applyWidth(value, old, name) {
    // do something...
  }
}
```

The applying method is only called when the value has changed.


> :memo: When using reference types like `Object` or `Array`, the apply method
> is only called if the **object** or **array** itself is different. Changing
> members of an object, or elements of an array, will not, by default, cause 
> the apply method to be called, even if that object or array is given back
> to the setter, because the value hasn't actually changed.
> If you want the apply method to be called every time the setter is called,
> you can specify an `isEqual` function for the property that always returns
> `false`, e.g., `isEqual : (a, b) => false`.

For a more technical description, take a look at the
[API documentation of qx.core.Property](apps://apiviewer/#qx.core.Property)

### Providing an event interface

For the users of a class it is in many cases a nice idea to also support an
event to react on property changes. The event is defined using the `event` key
where the value is the name of the event which should be fired.

Qooxdoo fires a `qx.event.type.Data` which supports the methods `getData()` and
`getOldData()` to allow easy access to the new and old property value,
respectively.


> :memo: Events are only useful for public properties. Events for protected and private
> properties are usually not a good idea.


#### Example

```javascript
properties : {
  label : { event : "changeLabel" }
}
...
// later in your application code:
obj.addListener("changeLabel", function(e) {
  alert(e.getData());
});
```

## Init values

Init values are supported by all properties. These values are stored separately
by the property engine. This way it is possible to fallback to the init value
when property values are being reset.

### Defining an init value

There are two ways to set an init value of a property.

#### Init value, calculated at class instantiation time
The _preferred_ way for reference values such as objects or arrays,
which are not expected to be shared between instances of the class, is
to provide a function to the `initFunction` key in the property
configuration map. The function will be called each time the class is
instantiated, and should return the initial value for the property in
that instance. You can use this key standalone or in combination with
`nullable` and/or `inheritable`.

```javascript
properties : {
  myProperty : {
    initFunction : () => { return [ 1, 2, 4, 8 ]; }
}
```

#### Init value, calculated at class load time

The `initFunction` key can be used for all initial values. A slightly
simpler mechanism is available, however, for simple (non-reference)
values. In this case, declare them using the `init` key in the
property configuration map. You can use this key standalone or in
combination with `nullable` and/or `inheritable`.

```javascript
properties : {
  myProperty : { init : 42 },
  myOtherProperty : { initFunction : () => { return { answer: 42 } } }
}
```

#### Init value in constructor

Before the introduction of the `initFunction` key in qooxdoo version
8.0, it was necessary to initialize reference types in the
constructor. This can still be done, although it
only makes sense when the property values are dependent on arguments provided to the constructor at instantiation time.

Using an initializing function `this.initMyProperty(value)` in the constructor
would allow you to assign complex non-primitive types (so-called "reference
types" like `Array`, `Object`) that should not be shared among instances, but be
unique on instance level.

Another scenario would be to use a localizable init value when
[internationalizing your application](../development/howto/internationalization):
Because `this.tr()` cannot be used in the property definition, you may either
use the static `qx.locale.Manager.tr()` there instead, or use `this.tr()` in the
call of the initializing function in the constructor.


> :memo: You need to add a `deferredInit:true` to the property configuration to allow for
> a deferred initialization for reference types as mentioned above.


```javascript
qx.Class.define("qx.MyClass", {
  construct() {
    this.initMyProperty([1, 2, 4, 8]);
  },
  properties : {
    myProperty : { deferredInit : true}
  }
});
```

### Applying an init value

The following applies if using the methodology describe immediately
above, in 'Init value in constructor'. It is not necessary when using
the `initFunction` key.

It is possible to apply the init value using a user-defined apply method. To do
this call the init method `this.initMyProperty(value)` somewhere in your
constructor - this "change" will than trigger calling the apply method. Of
course, this only makes sense in cases where you have at least an `apply` or
`event` entry in the property definition.

If you do not use the init method you must be sure that the instances created
from the classes are in a consistent state. The getter will return the init
value even if not initialized. This may be acceptable in some cases, e.g. for
properties without `apply` or `event`. But there are other cases, where the
developer needs to be carefully and call the init method because otherwise the
getter returns wrong information about the internal state (due to an
inconsistency between init and applied value).

Like calling the `this.initMyProperty(value)` method itself, you could call the
setter and use the defined init value as parameter. This will call the apply
method, not like in the usual cases when setting the same value which is already
set.

```javascript
construct()
{
  super();

  this.setColor("black"); // apply will be invoked
  this.setColor("black"); // apply will NOT be invoked
},

properties :
{
  color :
  {
    init : "black",
    apply : "_applyColor"
  }
},

members :
{
  _applyColor(value, old) {
    // do something...
  }
}
```

This example illustrates how the behavior differs from the default behavior of
the property system due to the already mentioned inconsistency between init and
applied value.

```javascript
construct()
{
  super();

  // Initialize color with predefined value
  this.initColor();

  // Initialize store with empty array
  this.initStore([]);
},

properties :
{
  color :
  {
    init : "black",
    apply : "_applyColor"
  },

  store : {
    apply : "_applyStore"
  }
},

members :
{
  _applyColor(value, old) {
    // do something...
  },

  _applyStore(value, old) {
    // do something...
  }
}
```

In the above example you can see the different usage possibilities regarding
properties and their init values. If you do not want to share "reference types"
(like `Array`, `Object`) between instances, the init values of these have to be
declared in the constructor and not in the property definition.

If an `init` value is given in the property declaration, the init method does
not accept any parameters. The init methods always use the predefined init
values. In cases where there is no `init` value given in the property
declaration, it is possible to call the init method with one parameter, which
represents the init value. This may be useful to apply reference types to each
instance. Thus, they would not be shared between instances.

> :memo: Please remember that init values are not for incoming user values. Please use
> `init` only for class defined things, not for user values. Otherwise, you torpedo
the multi-value idea behind the dynamic properties.

If you are using an `initFunction` as described above, any apply function will be called automatically.

### Refining init values

Derived classes can refine the init value of a property defined by
their super class. This is however the only modification which is
allowed through inheritance. To refine a property just define two keys
inside the property (re-)definition: either `init` or `initFunction`;
and `refine`. `refine` is a simple boolean flag which must be
configured to true.

Normally properties cannot be overridden. This is the reason for the `refine`
flag. The flag informs the implementation that the developer is aware of the
feature and the modification which should be applied.

```javascript
properties : {
  width : { refine : true, init : 100 }
}
```

This will change the default value at definition time. `refine` is a better
solution than a simple `set` call inside the constructor because its initial
value is stored in a separate namespace as the user value and so it is possible
for the user to fall back to the default value suggested by the developer of a
class.

## Checking incoming values

You can check incoming values by adding a `check` key to the corresponding
property definition. But keep in mind that these checks only apply in the
development (source) version of the application. Due to performance
optimization, we strip these checks for the build version. If you want a
property validation, take a look at the
[validation section](defining_properties#validation-of-incoming-values).

### Predefined types

You can check against one of these predefined types:

- `Boolean`
- `String`
- `Number`
- `Integer`
- `Float`
- `Double`
- `PositiveNumber`
- `PositiveInteger`
- `Object`
- `Array`
- `Map`
- `Class`
- `Mixin`
- `Interface`
- `Theme`
- `Decorator`
- `Font`
- `Color`
- `Error`
- `RegExp`
- `Function`
- `Date`
- `Node`
- `Element`
- `Document`
- `Window`
- `Event`
- `Promise`

Due to the fact that JavaScript only supports the `Number` data type, `Float`
and `Double` are handled identically to `Number`. Both are still useful, though,
as they are supported by the Javadoc-like comments and the API viewer.

```javascript
properties : {
  width : { init : 0, check: "Integer" }
}
```

### Possible values

One can define an explicit list of possible values:

```javascript
properties : {
  color: { init : "black", check : [ "red", "blue", "orange" ] }
}
```

> :memo: Providing a list of possible values only works with primitive types (like
> strings and numbers), but not with reference types (like objects, functions,
> etc.).


### Instance checks

It is also possible to only allow for instances of a class. This is not an
explicit class name check, but rather an `instanceof` check. This means also
instances of _any_ class derived from the given class will be accepted. The
class is defined using a string, thereby to not influencing the load time
dependencies of a class.

```javascript
properties : {
  logger : { nullable : true, check : "qx.log.Logger" }
}
```

### Interface checks

The incoming value can be checked against an interface, i.e. the value
(typically an instance of a class) must implement the given interface. The
interface is defined using a string, thereby not influencing the load time
dependencies of a class.

```javascript
properties : {
  application : { check : "qx.application.IApplication" }
}
```

### Implementing custom checks

Custom checks are possible as well, using a custom function defined inside the
property definition. This is useful for all complex checks which could not be
solved with the built-in possibilities documented above.

```javascript
properties :
{
  progress :
  {
    init : 0,
    check : function(value) {
      return !isNaN(value) && value >= 0 && value <= 100;
    }
  }
}
```

This example demonstrates how to handle numeric values which only accept a given
range of numbers (here 0 .. 100). The possibilities for custom checks are only
limited by the developer's imagination. ;-)

## Transforming incoming values

You can transform incoming values before they are stored by using the transform
key to the corresponding property definition. The transform method occurs before
the check and apply functions and can also throw an error if the value passed to
it is invalid. This method is useful if you wish accept different formats or
value types for a property.

### Example

Here we define both a check and transform method for the width property. Though
the check method requires that the property be an integer, we can use the
transform method to accept a string and transform it into an integer. Note that
we can still rely on the check method to catch any other incorrect values, such
as if the user mistakenly assigned a Widget to the property.

```javascript
properties :
{
   width :
   {
      init : 0,
      transform: "_transformWidth",
      check: "Integer"
   }
},

members :
{
   _transformWidth(value, oldValue)
   {
      if ( qx.lang.Type.isString(value) )
      {
          value = parseInt(value, 10);
      }

      return value;
   }
}
```

The transform function is passed a second parameter which is the value
previously set - note that the first time that transform is called, the oldValue
parameter will be undefined

## Asynchronous Properties using Promises

Sometimes it may be necessary for an `applyXxx` method to take some time to
complete, in which case it is necessary to consider coding asynchronously to allow
for a better user experience. Perhaps more importantly, if your apply method
includes triggering a server round trip then
[changes to the specification](https://xhr.spec.whatwg.org/) have deprecated
synchronous XMLHttpRequest, and some browsers (e.g. Safari) already have very
short timeouts for synchronous XMLHttpRequests which cannot be overridden.

Properties can be made asynchronous by using `qx.Promise`.

The return value for apply methods is normally ignored, but if it returns an
instance of `qx.Promise` the `setXxx` method will wait for the promise to be
fulfilled before firing the  `changeXxx` event.

As `setXxx` method returns the value which has been set, it is not possible to
return the promise to the caller - to retrieve the promise, you must tell
Qooxdoo that the property is asynchronous by setting the `async: true` in the
property definition and then calling the `setXxxAsync` method:

```javascript
properties :
{
   name :
   {
      init : 0,
      check: "String",
      apply : "_applyName",
      event: "changeName",
      async: true
   }
},

members :
{
   _applyName(name)
   {
       return new qx.Promise(function(fulfilled) {
           // ... do something asynchronous here
           fulfilled(); // Finally done the asynchrons task
       });
   }
}

// ... snip ...
myObject.setNameAsync("abc").then(function() {
    // only now has the name been changed and the "changeName" event been fired
});
```

Note that the `setXxxAsync` method is _only_ available if you have specified
`async: true` in the property definition

As well as `setXxxAsync` there is also a matching `getXxxAsync` method and a
`changeXxxAsync` event which can be fired; event handlers can return promises, and 
asynchronous properties can be bound using `qx.core.Object.bind()`

## Validation of incoming values

Validation of a property can prevent the property from being set if it is not
valid. In that case, a validation error should be thrown by the validator
function. Otherwise, the validator can just do nothing.

### Using a predefined validator

If you use predefined validators, they will throw a validation error for you.
You can find a set of predefined validators in qx.util.Validate. The following
example shows the usage of a range validator.

```javascript
properties : {
  application : { validate : qx.util.Validate.range(0, 100) }
}
```

### Using a custom validator

If the predefined validators are not enough for you validation, you can specify
your own validator.

```javascript
properties : {
  application : { validate : function(value) {
      if (value > 10) {
        throw new qx.core.ValidationError(
          "Validation Error: ", value + " is greater than 10."
        );
      }
    }
  }
}
```

### Validation method as member

You can define a validation method as a member of the class containing the
property. If you have such a member validator, you can just specify the method
name as a sting

```javascript
properties : {
  application : { validate : "_validateApplication" }
}
```

## Enabling theme support

The property system supports _multiple values per property_ as explained in the
paragraph about the init values. The theme value is another possible value that
can be stored in a property. It has a lower priority than the user value and a
higher priority than the init value. The `setThemed` and `resetThemed` methods
are part of Qooxdoo's theme layer and should not be invoked by the user
directly.

```
setter                                    value                   resetter

setProperty(value)            ^           user           |        resetProperty()
                              |                          |
setThemedProperty(value)   Priority       theme      Fallback     resetThemedProperty()
                              |                          |
initProperty([value])         |           init           v        n.a.
```

To enable theme support it is sufficient to add a `themeable` key to the
property definition and set its value to `true`.

```javascript
properties : {
  width : { themeable : true, init : 100, check : "Number" }
}
```

> :memo: `themeable` should only be enabled for truly _theme-relevant_ properties like
> color and decorator, but not for _functional_ properties like enabled, tabIndex,
> etc.


## Working with inheritance

Another great feature of the new property system is inheritance. This is
primarily meant for widgets, but should be usable in independent parent-children
architectures, too.

Inheritance quickly becomes nothing short of vital for the property system, if
you consider that it can reduce redundancy dramatically. It is advantageous both
in terms of coding size and storage space, because a value only needs to be
declared once for multiple objects inside a hierarchy. Beyond declaring such an
inheritable property once, only intended exceptions to the inherited values need
to be given to locally override those values.

The inheritance as supported by Qooxdoo's properties is comparable to the
inheritance known from CSS. This means, for example, that all otherwise
undefined values of inheritable properties automatically fall back to the
corresponding parent's value.

Each property may also have an explicit user value of string `"inherit"`. The
inherited value, which is normally only used as a fallback value, can thus be
emphasized by setting `"inherit"` explicitly. The user may set a property to
`"inherit"` in order to enforce lookup by inheritance, and thereby ignoring init
and appearance values.

To mark a property as inheritable simply add the key `inheritable` and set it to
`true`:

```javascript
properties : {
  color : { inheritable : true, nullable : true }
}
```

Optionally, you can configure an init value of `inherit`. This is especially a
good idea if the property should not be nullable:

```javascript
properties : {
  color : { inheritable : true, init: "inherit" }
}
```

### Inheritable CSS properties

To give you an idea for what kind of custom properties' inheritance is
particularly useful, the following list of prominent CSS properties which
support inheritance may be a good orientation:

- `color`
- `cursor`
- `font`, `font-family`, ...
- `line-height`
- `list-style`
- `text-align`


> :memo: This list of CSS properties is only meant for orientation and does not reflect
> any of Qooxdoo widget properties.


## Establishing immutability of properties

Properties can be configured using the `immutable` key. There are two
types of immutability:

### Readonly properties

Any property's configuration can specify `immutable : "readonly"` so
that its value is set by its `init` or `initFunction` and can not
otherwise be altered.

### Immutability of reference types

Properties with `check : "Array"` or `check : "Object"` can be marked
as `immutable : "replace"`. Doing so will ensure that the initially
allocated array or object, created in the property's `initFunction`,
continues to be used, so that when a new array or object is provided
to the setter, the *values* in the original array or object are
replaced by those in the array or object passed to the setter, rather
than replacing the entire array with what's specified in the setter.
In other words, the initialized array or object becomes immutable, and
its values are replaced by those in the argument to a setter call.

## Defining own property storage

Property values are, by default, stored within the instance object of an instantiated class. The default storage mechanism is defined in `qx.core.propertystorage.Default`. 

It is possible to define an alternative storage methodology. Defining
storage requires creating a map containing four keys: `init`, `set`,
`get`, and `dereference`.

### init

A storage implementation's `init` key defines how to initialize the
property's value in its storage. The default storage implementation
uses the property's `init` value (or `undefined` if the property
doesn't define an `init` key) and stores it into the instance. The
default storage's `init` function looks something like this:

```javascript
init(propertyName, property, clazz)
{
  // Create the storage for this property's current value
  Object.defineProperty(
    clazz.prototype,
    propertyName,
    {
      value        : property.init,
      writable     : true, // must be true for possible initFunction
      configurable : false,
      enumerable   : false
    });
}
```

### set
A storage implementation's `set` key defines how to store a value for the property in its storage. The default storage implementation stores the value within the instance object, in a property of the given name:

```javascript
set(prop, value)
{
  let variant = this[`$$variant_${prop}`];

  // Don't go through the whole setter process; just save the value
  this[`$$variant_${prop}`] = "immediate";
  this[prop] = value;
  this[`$$variant_${prop}`] = variant;
},
```

Note the `variant` handling. This pertains to internals of the Class
implementation. The key point here is that when
`this[`$$variant_${prop}`]` is not `immediate`, all of the property
handling such as validation, transform, etc., may occur if
`this[prop]` is changed. For optimal efficiency, the default storage implementation saves the
current variant, temporarily sets the variant to "immediate", saves
the value in its storage location, and then restores the variant.

### get

A storage implementation's `get` key defines how to retrieve the
property's value from its storage. The default storage implementation
simply retrieves the instance object's value of the given property
name:

```javascript
get(prop)
{
  return this[prop];
}
```

### dereference

If the property configuration includes `dereference : true`, then the storage implementation's `dereference` function is called just before the instance's destructor. The default storage implementation deletes the property from the instance:

```javascript
dereference(prop, property)
{
  delete this[prop];
}
```

## Internal methods

The property documentation in the user manual explains the public, non-internal
methods for each property. However, there are some more, which are not meant for
public use:

- `this.resetProperty(value)` : For properties which are inheritable. Used by
  the inheritance system to transfer values from parent to child widgets.
- `this.setThemedProperty(value)` : For properties with `appearance` enabled.
  Used to store a separate value for the appearance of this property. Used by
  the appearance layer.
- `this.resetThemedProperty(value)` : For properties with `appearance` enabled.
  Used to reset the separately stored appearance value of this property. Used by
  the appearance layer.

## Defining property groups

Property groups is a convenient feature as it automatically generates setters
and resetters (but no getters) for a group of properties. A definition of such a
group reads:

```javascript
properties : {
  location : { group : [ "left", "top" ] }
}
```

As you can see, property groups are defined in the same map as "regular"
properties. From a user perspective the API with setters and resetters is
equivalent to the API of regular properties:

```javascript
obj.setLocation( 50, 100);

// instead of
// obj.setLeft(50);
// obj.setTop(100);
```

### Shorthand support

Additionally, you may also provide a mode which modifies the incoming data
before calling the setter of each group members. Currently, the only available
modifier is `shorthand`, which emulates the well-known CSS shorthand support for
Qooxdoo properties. For more information regarding this feature, please have a
look at the [user manual](understanding_properties.md). The definition of such a
property group reads:

```javascript
properties :
{
  padding :
  {
    group : [ "paddingTop", "paddingRight", "paddingBottom", "paddingLeft" ],
    mode : "shorthand"
  }
}
```

For example, this would allow to set the property in the following way:

```javascript
obj.setPadding( 10, 20 );

// instead of
// obj.setPaddingTop(10);
// obj.setPaddingRight(20);
// obj.setPaddingBottom(10);
// obj.setPaddingLeft(20);
```

## When to use properties?

Since properties in Qooxdoo support advanced features like validation,
events and so on, they might not be quite as lean and fast as an
ordinarily coded property that only supports a setter and getter. If
you do not need these advanced features or the variable you want to
store is _extremely_ time critical, it might be better not to use
Qooxdoo's dynamic properties in those cases. You might instead want to
create your own setters and getters (if needed) and store the value
just as a hidden private variable (e.g. `__varName`) inside your
object.

## Property Descriptors

A property descriptor contains the definition of the methods which can
manipulate and retrieve values from a property. Each of the property
methods is actually a reference to a function in the property
descriptor, so, for example, on property `myProp`, the methods
`setMyProp`, `getMyProp`, `resetMyProp`, etc., are methods held in the
property descriptor for property `myProp`.

You can access properties through the instance object to which the
properties are attached, as has been discussed throughout this
description of properites. Alternatively, though, if many property
manipulations on a given property are to be made, you may prefer to
obtain and keep a reference to the property descriptor for that
property to manipulate it, rather than manipulating it through the
instance object.

The property descriptor for a property can be obtained, through the
instance object, by calling the `getPropertyDescriptor` method, and
passing as an argument, the name of the property for which the
property descriptor is desired. For example, to obtain the property
descriptor for the property `myProp`:

```javascript
let propDesc = myClassInstance.getPropertyDescriptor("myProp");
```

With that property descriptor in hand, you can now manipulate the
property with it, e.g.:

```javascript
propDesc.set(2);
```

For more details of using property descriptors, see the API
documentation for class `qx.core.PropertyDescriptorRegistry`.
