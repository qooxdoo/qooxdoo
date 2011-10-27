.. _pages/interfaces#interfaces:

Interfaces
**********

qooxdoo supports Java like interfaces. 

Interface definitions look very similar to normal class definitions.

Example:

::

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

.. _pages/interfaces#definition:

Definition
==========

Interfaces are declared using ``qx.Interface.define``. Interface names start by convention with an ``I`` (uppercase "i"). They can inherit from other interfaces using the ``extend`` key. Multiple inheritance of interfaces is supported.

.. _pages/interfaces#properties:

Properties
----------

Properties in interfaces state that each class implementing this interface must have a property of the given name. The :doc:`property definition <defining_properties>` is not evaluated and may be empty.

.. _pages/interfaces#members:

Members
-------

The member section of the interface lists all member functions which must be implemented. The function body is used as a precondition of the implementation. By implementing an interface the qooxdoo class definition automatically wraps all methods required by the interface. Before the actual implementation is called, the precondition of the interface is called with the same arguments. The precondition should raise an exception if the arguments are don't meet the expectations. Usually the methods defined in `qx.core.MAssert <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.MAssert>`_ are used to check the incoming parameters.

.. _pages/interfaces#statics:

Statics
-------

Statics behave exactly like statics defined in mixins and qooxdoo classes, with the different that only constants are allowed. They are accessible through their fully-qualified name. For example, the static varaiable ``PI`` could be used like this:

::

    var a = 2 * qx.test.ISample.PI * (r*r);

.. _pages/interfaces#events:

Events
------

Each event defined in the interface must be declared in the implementing classes. The syntax matches the ``events`` key of the class declaration.

.. _pages/interfaces#implementing_interfaces:

Implementation
==============

With ``implement`` key of the class declaration, a list of interfaces can be listed, which the class implements. The class must implement all properties, members and events declared in the interfaces. Otherwise a runtime error will be thrown.

Example:

::

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

.. _pages/interfaces#validating_interfaces:

Validation
==========

``qx.Class`` contains several static methods to check, whether a class or an object implements an interface:

  * ``qx.Class.hasInterface()``: Whether a given class or any of its superclasses includes a given interface.
  * ``qx.Class.implementsInterface()``: Checks whether all methods defined in the interface are implemented in the class. The class does not need to implement the interface explicitly.

It is further possible to use interfaces as property checks.

.. _pages/interfaces#interfaces_quick_ref:

Summary
=======

Configuration
-------------

.. list-table::
   :header-rows: 1

   * - Key
     - Type
     - Description

   * - extend
     - Interface | Interface[]
     - Single interface or array of interfaces this interface inherits from.
   
   * - members
     - Map
     - Map of members of the interface.

   * - statics
     - Map
     - Map of statics of the interface. The statics will not get copied into the target class. This is the same behavior as statics in mixins.

   * - properties
     - Map
     - Map of properties and their definitions.
   
   * - events
     - Map
     - Map of event names and the corresponding event class name.

References
----------

* :doc:`interface_quickref` - a syntax quick reference for interfaces
* `API Documentation for Interface <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.Interface>`_

  