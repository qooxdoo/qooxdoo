.. _pages/mixins#mixins:

Mixins
******

Mixins are collections of code and variables, which can be merged into
other classes. They are similar to classes but can not be instantiated. Unlike interfaces they do contain implementation code. Typically they are made up of only a few members that allow for a generic implementation of some very specific functionality.

Mixins are used to share functionality without using inheritance and to extend/patch the functionality of existing classes. 

.. _pages/mixins#defining_a_mixin:

Definition
==========

Example:

::

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

.. _pages/mixins#using_a_mixin:

Usage
=====

Here a short example to see, how to use mixins (``MMixinA``, ``MMixinB``) with a class (``ClassC``).

The first mixin: 

::

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

The second mixin:

::

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

The usage in the class:

::

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

The result is when calling the method ``methodC()`` of ``ClassC``:

::

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

.. _pages/mixins#mixin_configuration_overview:

Summary
=======

Configuration
-------------

.. list-table::
   :header-rows: 1

   * - Key
     - Type
     - Description

   * - include
     - Mixin or Mixin[]
     - Single mixin or array of mixins, which will be merged into the mixin.

   * - construct
     - Function
     - An optional mixin constructor. It is called when instantiating a class that includes this mixin.

   * - destruct
     - Function
     - An optional mixin destructor.

   * - statics
     - Map
     - Map of static members of the mixin. The statics will not get copied into the target class. They remain accessible from the mixin. This is the same behaviour as for statics in interfaces

   * - members
     - Map
     - Map of members of the mixin.

   * - properties
     - Map
     - Map of :doc:`property definitions <defining_properties>`.

   * - events
     - Map
     - Map of events the mixin fires. The keys are the names of the events and the values are the corresponding event type classes.

References
----------

* :doc:`mixin_quickref` -  a quick syntax reference for mixins
* `API Documentation for Mixin <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.Mixin>`_