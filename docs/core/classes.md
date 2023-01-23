# Classes

Qooxdoo's class definition is a concise and compact way to define new classes.
Due to its closed form the JavaScript code that handles the actual class
definition already "knows" all parts of the class at definition time. This
allows for many useful checks during development as well as clever optimizations
during the build process.

The class system has been part of qooxdoo since 2005, when JavaScript had no 
[`class` keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
(it was introduced with ECMAScript 2015). At the moment, it is not possible 
to mix Qooxdoo classes and ECMAScript 2015 classes; this is planned for a
future release. In any case, as shown below, the Qooxdoo class system is still
much more powerful than the native classes. 

## Declaration

Here is the most basic definition of a regular, non-static class `qx.test.Cat`.
It has a constructor so that instances can be created. It also needs to extend
some existing class, here we take the root class of all Qooxdoo classes:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.core.Object,
  construct() {
    /* ... */
  }
});
```

As you can see, the `define()` method takes two arguments, the fully-qualified
name of the new class, and a configuration map that contains a varying number of
predefined keys and their values.

An instance of this class is created and its constructor is called by the usual
statement:

```javascript
const kitty = new qx.test.Cat();
```

### Members

Members of a class come in two flavors:

- Class members (also called **static** members) are attached to the class itself,
  not to individual instances

- Instance members are attached to each individual instance of a class

### Class Members

A static member of a class can be one of the following:

- Class Variable
- Class Method

In the `Cat` class we may attach a class variable `LEGS` (where uppercase
notation is a common coding convention) and a class method `makeSound()`, both
in a `statics` section of the class declaration:

```javascript
qx.Class.define("qx.test.Cat", {
  /* ... */
  statics: {
    LEGS: 4,
    makeSound() {
      /* ... */
    }
  }
});
```

Accessing those class members involves the fully-qualified class name:

```javascript
const foo = qx.test.Cat.LEGS;
alert(qx.test.Cat.makeSound());
```

### Instance Members

An instance member of a class can be one of the following:

- Instance Variable
- Instance Method

They may be defined in the `members` section of the class declaration:

```javascript
qx.Class.define("qx.test.Cat", {
  /* ... */
  members: {
    name : "Kitty",
    getName: function() { return this.name }
  }
});
```

Accessing those members involves an instance of the class:

```javascript
const kitty = new qx.test.Cat();
kitty.name = "Sweetie";
alert(kitty.getName());
```

#### Primitive Types vs. Reference Types

There is a fundamental JavaScript language feature that could lead to problems,
if not properly understood. It centers around the different behavior in the
assignment of JavaScript's two data types (_primitive types_ vs. _reference
types_).

> :memo: Please make sure you understand the following explanation to avoid possible
> future coding errors.

Primitive types include `Boolean`, `Number`, `String`, `null` and the rather
unusual `undefined`. If such a primitive type is assigned to an instance
variable in the class declaration, it behaves as if each instance had a copy of
that value. They are never shared among instances.

Reference types include all other types, e.g. `Array`, `Function`, `RegExp` and
the generic `Object`. As their name suggests, those reference types merely point
to the corresponding data value, which is represented by a more complex data
structure than the primitive types. If such a reference type is assigned to an
instance variable in the class declaration, it behaves as if each instance just
pointed to the complex data structure. All instances share the same value,
unless the corresponding instance variable is assigned a different value.

**Example**: If an instance variable was assigned an array in the class
declaration, any instance of the class could (knowingly or unknowingly)
manipulate this array in such a way that each instance would be affected by
the changes. Such a manipulation could be pushing a new item into the array or
changing the value of a certain array item. All instances would share the
array.

You have to be careful when using complex data types in the class declaration,
because they are shared by default:

```javascript
members: {
  foo: [1, 2, 4]; // all instances would start to share this data structure
}
```

If you do _not_ want that instances share the same data, you should defer the
actual initialization into the constructor:

```javascript
construct()
{
  this.foo = [1, 2, 4];   // each instance would get assigned its own data structure
},
members:
{
  foo: null   // to be initialized in the constructor
}
```

### Access

In many object-oriented classes a concept exists that is referred to as "access"
or "visibility" of members (well, or even classes, etc.). Based on the
well-known access modifiers of Java, the following three types exist for Qooxdoo
members:

- _public_: To be accessed from any class/instance
- _protected_: To be accessed only from derived classes or their instances
- _private_: To be accessed only from the defining class/instance

Unfortunately, JavaScript is very limited in _enforcing_ those protection
mechanisms. Therefore, the following coding convention is to be used to declare
the access type of members:

- _public_: members may _not_ start with an underscore
- _protected_: members start with a single underscore `_`
- _private_: members start with a double underscore `__`

In the source version of an app, these conventions only notify the programmer of
the type of access that is intended, but there is no prevention of accessing
them "incorrectly." In the build version, however, _private_ member names are
obfuscated, so they are not easily accessible outside of their own class. _Be
aware that programs where private members are accessed from outside of their own
class will work in the source version, but will fail to work in the build
version!_

### Special Types of Classes

Besides a "regular" class, there is built-in support for the following special
types:

#### Static Classes

A static class is not instantiated and only contains static members. Setting its
type to `static` makes sure only such static members, no constructor and so on
are given in the class definition. Otherwise, error messages are presented to the
developer:

```javascript
qx.Class.define("qx.test.Cat", {
  type : "static",
  ...
});
```

#### Abstract Classes

An abstract class may not be instantiated. It merely serves as a superclass that
needs to be derived from. Concrete classes (or concrete members of such derived
classes) contain the actual implementation of the abstract members. If an
abstract class is to be instantiated, an error message is presented to the
developer.

```javascript
qx.Class.define("qx.test.Cat", {
  type : "abstract",
  ...
});
```

#### Singletons

The singleton design pattern makes sure, only a single instance of a class may
be created. Every time an instance is requested, either the already created
instance is returned or, if no instance is available yet, a new one is created
and returned. Requesting the instance of such a singleton class is done by using
the `getInstance()` method.

```javascript
qx.Class.define("qx.test.Cat", {
  type : "singleton",
  ...
});
```

## Inheritance

### Single Inheritance

JavaScript supports the concept of single inheritance. It does not support
(true) multiple inheritance like C++. Most people agree on the fact that such a
concept tends to be very complex and error-prone. There are other ways to shoot
you in the foot. Qooxdoo only allows for single inheritance as well:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal
});
```

### Multiple Inheritance

Not supported. There are more practical and less error-prone solutions that
allow for typical features of multiple inheritance: Interfaces and Mixins (see
below).

### Polymorphism (Overriding)

Qooxdoo does, of course, allow for polymorphism, that is most easily seen in the
ability to override methods in derived classes.

#### Calling the Superclass Constructor

The `super()` is a generic way to call the base class that does not involve using 
the superclass name explicitly:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  construct(x) {
    super(x);
  }
});
```


#### Calling an Overridden Method

Calling an overridden superclass method from within the overriding method (i.e.
both methods have the same name) is similar to calling the superclass
constructor, but note that you have to specify the method name:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  members: {
    makeSound() {
      super.makeSound();
    }
  }
});
```

#### Calling another Static Method

Here is an example for calling a static member without using a fully-qualified
class name (compare to `super()` above):

```javascript
qx.Class.define("qx.test.Animal", {
  extend: qx.core.Object,
  statics: {
    someStaticVar: 123
  },
  members: {
    makeSound(x) {
      console.log(this.constructor.classname);
    }
  }
});
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  statics : {
    someStaticMethod(x) {
      /* ... */
    },
    anotherStaticVar: "meow"
  },
  members: {
    makeSound(x) {
      super.makeSound(x);
      qx.test.Cat.someStaticMethod(x);
    }
  }
});
qx.Class.define("qx.test.Dog", {
  extend: qx.test.Animal
});

```

The syntax for accessing static methods and variables is to use the classname
to prefix the method or variable, for example `qx.test.Animal.someStaticVar`.

In member methods, you have another choice for accessing the class definition - you can 
use `this.constructor` which returns the class of the object.  Note that `this.constructor`
will be different depending on the actual instance of the class, for example:

```javascript
new qx.test.Dog().makeSound(); // outputs qx.test.Dog
new qx.test.Cat().makeSound(); // outputs qx.test.Cat
```

If you access static methods or variables using code such as `this.constructor.someStaticVar`,
then this works fine _provided that you never subclass your class_.  Statics are not
inherited between classes.

When writing a mixin, `this.constructor` is never the class of the where the code appears, 
so you must always specify the absolute class name, e.g. `qx.test.Animal.someStaticVar`.

The simplest solution is to always write the classname explicitly when accessing static member.

The code in a static method typically has `this` set to the class because of how you call it - 
e.g. `qx.test.Cat.someStaticMethod()` causes Javascript to set `this` to `qx.test.Cat`.  However,
because it is a standalone method this code is different:

```javascript
const fn = qx.test.Cat.someStaticMethod;
fn(); // "this" will be the global object
```

You have two choices here: you either take care to make sure that you never get a variable 
reference to a method and then call the method, in which case you _can_ use `this` in the
static method's code, or you always explicitly use the class name.

If you are trying to reduce the amount of typing, this code works as expected:

```javascript
const Cat = qx.test.Cat;
Cat.someStaticMethod(); // "this" will be qx.test.Cat
```

## Usage of Interfaces and Mixins

### Implementing an Interface

The class system supports interfaces. The implementation is based on the feature
set of Java interfaces. Most relevant features of Java-like interfaces are
supported. A class can define which interface or multiple interfaces it
implements by using the `implement` key:

```javascript
qx.Class.define("qx.test.Cat", {
  implement: [qx.test.IPet, qx.test.IFoo]
});
```

### Including a Mixin

Unlike interfaces, mixins do contain concrete implementations of methods. They
borrow some ideas from Ruby and similar scripting languages.

Features:

- Add mixins to the definition of a class: All members of the mixin are added to
  the class definition.

- Add a mixin to a class after the class is defined. Enhances the functionality
  but is not allowed to overwrite existing members.

- Patch existing classes. Change the implementation of existing methods. Should
  normally be avoided but, as some projects may need to patch Qooxdoo, we better
  define a clean way to do so.

The concrete implementations of mixins are used in a class through the key
`include`:

```javascript
qx.Class.define("qx.test.Cat", {
  include: [qx.test.MPet, qx.test.MSleep]
});
```
