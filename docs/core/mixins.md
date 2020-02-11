Mixins
======

Mixins are collections of code and variables, which can be merged into other classes. They are similar to classes but can not be instantiated. Unlike interfaces they do contain implementation code. Typically they are made up of only a few members that allow for a generic implementation of some very specific functionality.

Mixins are used to share functionality without using inheritance and to extend/patch the functionality of existing classes.

Definition
----------

Example:

```javascript
qx.Mixin.define("name",
{
  include: [SuperMixins],

  properties: {
    "tabIndex": {check: "Number", init: -1}
  },

  members:
  {
    prop1: "foo",
    meth1: function() {},
    meth2: function() {}
  }
});
```

Usage
-----

Here a short example to see, how to use mixins (`MMixinA`, `MMixinB`) with a class (`ClassC`).

The first mixin:

```javascript
qx.Mixin.define("demo.MMixinA",
{
  properties: {
    "propertyA":
    {
      check: "String",
      init: "Hello, I'm property A!\n"
    }
  },

  members:
  {
    methodA: function() {
      return "Hello, I'm method A!\n";
    }
  }
});
```

The second mixin:

```javascript
qx.Mixin.define("demo.MMixinB",
{
  properties: {
    "propertyB":
    {
      check: "String",
      init: "Hello, I'm property B!\n"
    }
  },

  members:
  {
    methodB: function() {
      return "Hello, I'm method B!\n";
    }
  }
});
```

The usage in the class:

```javascript
qx.Class.define("demo.ClassC",
{
  extend : qx.core.Object,

  include : [demo1.MMixinA, demo1.MMixinB],

  members :
  {
    methodC : function() {
      return this.getPropertyA() + this.methodA()
        + this.getPropertyB() + this.methodB()
        + "Nice to meet you. Thanks for your help!";
    }
  }
});
```

The result is when calling the method `methodC()` of `ClassC`:

```javascript
var classC = new demo.ClassC;
var result = classC .methodC();
/*
 * Result:
 * Hello, I'm property A!
 * Hello, I'm method A!
 * Hello, I'm property B!
 * Hello, I'm method B!
 * Nice to meet you. Thanks for your help!
 */
```
