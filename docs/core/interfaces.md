Interfaces
==========

qooxdoo supports Java like interfaces.

Interface definitions look very similar to normal class definitions.

Example:

    qx.Interface.define("qx.test.ISample",
     {
       extend: [SuperInterfaces],

       properties: {"color": {}, "name": {} },

       members:
       {
         meth1: function() {},
         meth2: function(a, b) {
           this.assertArgumentsCount(arguments, 2, 2);
         },
         meth3: function(c) {
           this.assertInterface(c, qx.some.IInterface);
         }
       },

       statics:
       {
         PI : 3.14
       },

       events :
       {
         keydown : "qx.event.type.KeyEvent"
       }
    });

Definition
----------

Interfaces are declared using `qx.Interface.define`. Interface names start by convention with an `I` (uppercase "i"). They can inherit from other interfaces using the `extend` key. Multiple inheritance of interfaces is supported.

### Properties

Properties in interfaces state that each class implementing this interface must have a property of the given name. The property definition \<defining\_properties\> is not evaluated and may be empty.

### Members

The member section of the interface lists all member functions which must be implemented. The function body is used as a precondition of the implementation. By implementing an interface the qooxdoo class definition automatically wraps all methods required by the interface. Before the actual implementation is called, the precondition of the interface is called with the same arguments. The precondition should raise an exception if the arguments are don't meet the expectations. Usually the methods defined in [qx.core.MAssert](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.MAssert) are used to check the incoming parameters.

### Statics

Statics behave exactly like statics defined in mixins and qooxdoo classes, with the different that only constants are allowed. They are accessible through their fully-qualified name. For example, the static variable `PI` could be used like this:

    var a = 2 * qx.test.ISample.PI * (r*r);

### Events

Each event defined in the interface must be declared in the implementing classes. The syntax matches the `events` key of the class declaration.

Implementation
--------------

With `implement` key of the class declaration, a list of interfaces can be listed, which the class implements. The class must implement all properties, members and events declared in the interfaces. Otherwise a runtime error will be thrown.

Example:

    qx.Class.define("qx.test.Sample",
     {
       implement: [qx.test.ISample],

       properties: {
         "color": { check: "color"},
         "name": { check: "String"}
       },

       members:
       {
         meth1: function() { return 42; },
         meth2: function(a, b) { return a+b },
         meth3: function(c) { c.foo() }
       }

       events :
       {
         keydown : "qx.event.type.KeyEvent"
       }

    });

Validation
----------

`qx.Class` contains several static methods to check, whether a class or an object implements an interface:

> -   `qx.Class.hasInterface()`: Whether a given class or any of its superclasses includes a given interface.
> -   `qx.Class.implementsInterface()`: Checks whether all methods defined in the interface are implemented in the class. The class does not need to implement the interface explicitly.

It is further possible to use interfaces as property checks.

Summary
-------

### Configuration

### References

-   interface\_quickref - a syntax quick reference for interfaces
-   [API Documentation for Interface](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.Interface)

