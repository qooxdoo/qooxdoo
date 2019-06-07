Classes
=======

qooxdoo's class definition is a concise and compact way to define new classes. Due to its closed form the JavaScript code that handles the actual class definition already "knows" all parts of the class at definition time. This allows for many useful checks during development as well as clever optimizations during the build process.

Declaration
-----------

Here is the most basic definition of a regular, non-static class `qx.test.Cat`. It has a constructor so that instances can be created. It also needs to extend some existing class, here we take the root class of all qooxdoo classes:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.core.Object,
  construct : function() { /* ... */ }
});
```

As you can see, the `define()` method takes two arguments, the fully-qualified name of the new class, and a configuration map that contains a varying number of predefined keys and their values.

An instance of this class is created and its constructor is called by the usual statement:

```javascript
var kitty = new qx.test.Cat;
```

### Members

Members of a class come in two flavors:

-   Class members (also called "static" members) are attached to the class itself, not to individual instances
-   Instance members are attached to each individual instance of a class

### Class Members

A static member of a class can be one of the following:

-   Class Variable
-   Class Method

In the `Cat` class we may attach a class variable `LEGS` (where uppercase notation is a common coding convention) and a class method `makeSound()`, both in a `statics` section of the class declaration:

```javascript
qx.Class.define("qx.test.Cat", {
  /* ... */
  statics : {
    LEGS: 4,
    makeSound : function() { /* ... */ }
  }
});
```

Accessing those class members involves the fully-qualified class name:

```javascript
var foo = qx.test.Cat.LEGS;
alert(qx.test.Cat.makeSound());
```

### Instance Members

An instance member of a class can be one of the following:

-   Instance Variable
-   Instance Method

They may be defined in the `members` section of the class declaration:

```javascript
qx.Class.define("qx.test.Cat", {
  ...
  members: {
    name : "Kitty",
    getName: function() { return this.name }
  }
});
```

Accessing those members involves an instance of the class:

```javascript
var kitty = new qx.test.Cat;
kitty.name = "Sweetie";
alert(kitty.getName());
```

#### Primitive Types vs. Reference Types

There is a fundamental JavaScript language feature that could lead to problems, if not properly understood. It centers around the different behavior in the assignment of JavaScript's two data types (*primitive types* vs. *reference types*).

> **note**
>
> Please make sure you understand the following explanation to avoid possible future coding errors.

Primitive types include `Boolean`, `Number`, `String`, `null` and the rather unusual `undefined`. If such a primitive type is assigned to an instance variable in the class declaration, it behaves as if each instance had a copy of that value. They are never shared among instances.

Reference types include all other types, e.g. `Array`, `Function`, `RegExp` and the generic `Object`. As their name suggests, those reference types merely point to the corresponding data value, which is represented by a more complex data structure than the primitive types. If such a reference type is assigned to an instance variable in the class declaration, it behaves as if each instance just pointed to the complex data structure. All instances share the same value, unless the corresponding instance variable is assigned a different value.

**Example**: If an instance variable was assigned an array in the class declaration, any instance of the class could (knowingly or unknowingly) manipulate this array in such a way that each instance would be affected by the changes. Such a manipulation could be pushing a new item into the array or changing the value of a certain array item. All instances would share the array.

You have to be careful when using complex data types in the class declaration, because they are shared by default:

```javascript
members:
{
  foo: [1, 2, 4]   // all instances would start to share this data structure
}
```

If you do *not* want that instances share the same data, you should defer the actual initialization into the constructor:

```javascript
construct: function()
{
  this.foo = [1, 2, 4];   // each instance would get assigned its own data structure
},
members:
{
  foo: null   // to be initialized in the constructor
}
```

### Access

In many object-oriented classes a concept exists that is referred to as "access" or "visibility" of members (well, or even classes, etc.). Based on the well-known access modifiers of Java, the following three types exist for qooxdoo members:

-   *public*: To be accessed from any class/instance
-   *protected*: To be accessed only from derived classes or their instances
-   *private*: To be accessed only from the defining class/instance

Unfortunately, JavaScript is very limited in *enforcing* those protection mechanisms. Therefore, the following coding convention is to be used to declare the access type of members:

-   *public*: members may *not* start with an underscore
-   *protected*: members start with a single underscore `_`
-   *private*: members start with a double underscore `__`

In the source version of an app, these conventions only notify the programmer of the type of access that is intended, but there is no prevention of accessing them "incorrectly." In the build version, however, *private* member names are obfuscated, so they are not easily accessible outside of their own class. *Be aware that programs where private members are accessed from outside of their own class will work in the source version, but will fail to work in the build version!*

### Special Types of Classes

Besides a "regular" class there is built-in support for the following special types:

#### Static Classes

A static class is not instantiated and only contains static members. Setting its type to `static` makes sure only such static members, no constructor and so on are given in the class definition. Otherwise error messages are presented to the developer:

```javascript
qx.Class.define("qx.test.Cat", {
  type : "static"
  ...
});
```

#### Abstract Classes

An abstract class may not be instantiated. It merely serves as a superclass that needs to be derived from. Concrete classes (or concrete members of such derived classes) contain the actual implementation of the abstract members. If an abstract class is to be instantiated, an error message is presented to the developer.

```javascript
qx.Class.define("qx.test.Cat", {
  type : "abstract"
  ...
});
```

#### Singletons

The singleton design pattern makes sure, only a single instance of a class may be created. Every time an instance is requested, either the already created instance is returned or, if no instance is available yet, a new one is created and returned. Requesting the instance of such a singleton class is done by using the `getInstance()` method.

```javascript
qx.Class.define("qx.test.Cat", {
  type : "singleton"
  ...
});
```

Inheritance
-----------

### Single Inheritance

JavaScript supports the concept of single inheritance. It does not support (true) multiple inheritance like C++. Most people agree on the fact that such a concept tends to be very complex and error-prone. There are other ways to shoot you in the foot. qooxdoo only allows for single inheritance as well:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal
});
```

### Multiple Inheritance

Not supported. There are more practical and less error-prone solutions that allow for typical features of multiple inheritance: Interfaces and Mixins (see below).

### Polymorphism (Overriding)

qooxdoo does, of course, allow for polymorphism, that is most easily seen in the ability to override methods in derived classes.

#### Calling the Superclass Constructor

It is hard to come up with an appealing syntax and efficient implementation for calling the superclass constructor from the constructor of a derived class. You simply cannot top Java's `super()` here. At least there is some generic way that does not involve to use the superclass name explicitly:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  construct: function(x) {
    this.base(arguments, x);
  }
});
```

Unfortunately, to mimic a `super()` call the special variable `arguments` is needed, which in JavaScript allows a context-independent access to the actual function. Don't get confused by its name, you would list your own arguments just afterwards (like the `x` in the example above).

`this.base(arguments, x)` is internally mapped to `arguments.callee.base.call(this, x)` (The *.base* property is maintained for every method through qooxdoo's class system). The latter form can be handled by JavaScript natively, which means it is quite efficient. As an optimization during the build process such a rewrite is done automatically for your deployable application.

#### Calling an Overridden Method

Calling an overridden superclass method from within the overriding method (i.e. both methods have the same name) is similar to calling the superclass constructor:

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  members: {
    makeSound : function() {
      this.base(arguments);
    }
  }
});
```

#### Calling the Superclass Method or Constructor with all parameters

This variant allows to pass all the parameters (unmodified):

```javascript
qx.Class.define("qx.test.Animal", {
  members: {
    makeSound : function(howManyTimes) {
        ....
    }
  }
});

qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  members: {
    makeSound : function() {
      this.debug("I'm a cat");
      /* howManyTimes or any other parameter are passed.  We don't need to know how many parameters are used. */
      arguments.callee.base.apply(this, arguments);
    }
  }
});
```

#### Calling another Static Method

Here is an example for calling a static member without using a fully-qualified class name (compare to `this.base(arguments)` above):

```javascript
qx.Class.define("qx.test.Cat", {
  extend: qx.test.Animal,
  statics : {
    someStaticMethod : function(x) {
      ...
    }
  },
  members: {
    makeSound : function(x) {
      this.constructor.someStaticMethod(x);
    }
  }
});
```

The syntax for accessing static variables simply is `this.constructor.someStaticVar`. Please note, for `this.constructor` to be available, the class must be a derived class of `qx.core.Object`, which is usually the case for regular, non-static classes.

Instead of `this.constructor` you can also use the alternative syntax `this.self(arguments)`.

In purely static classes for calling a static method from another static method, you can directly use the `this` keyword, e.g. `this.someStaticMethod(x)`.

Usage of Interfaces and Mixins
------------------------------

### Implementing an Interface

The class system supports interfaces. The implementation is based on the feature set of Java interfaces. Most relevant features of Java-like interfaces are supported. A class can define which interface or multiple interfaces it implements by using the `implement` key:

```javascript
qx.Class.define("qx.test.Cat", {
  implement : [qx.test.IPet, qx.test.IFoo]
});
```

### Including a Mixin

Unlike interfaces, mixins do contain concrete implementations of methods. They borrow some ideas from Ruby and similar scripting languages.

Features:

-   Add mixins to the definition of a class: All members of the mixin are added to the class definition.
-   Add a mixin to a class after the class is defined. Enhances the functionality but is not allowed to overwrite existing members.
-   Patch existing classes. Change the implementation of existing methods. Should normally be avoided but, as some projects may need to patch qooxdoo, we better define a clean way to do so.

The concrete implementations of mixins are used in a class through the key `include`:

```javascript
qx.Class.define("qx.test.Cat", {
  include : [qx.test.MPet, qx.test.MSleep]
});
```
