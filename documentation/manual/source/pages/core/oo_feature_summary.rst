.. _pages/oo_feature_summary#features_for_object_orientation:

Features of Object Orientation
*******************************

.. _pages/oo_feature_summary#class_definition:

Class definition
================

A class is defined by providing its name as a string:

::

    qx.Class.define("my.cool.Class");

This example only creates a trivial class ``my.cool.Class``. A typical class declaration contains OO features like constructor, instance members, static members, etc. This additional information is provided as a second parameter in form of a map. Since the entire class definition is given in ``qx.Class.define()``, it is called a "closed form" of class declaration:
::

    qx.Class.define("my.cool.Class", {
      // declare constructor, members, ...
    });

A regular (non-static) class can simply be instantiated using the ``new`` keyword:
::

    var myClass = new my.cool.Class;

.. _pages/oo_feature_summary#inheritance:

Inheritance
===========

In order to derive the current class from another class, the reference to the super class is  provided by the key ``extend``: 
::

    qx.Class.define("my.great.SuperClass", {
      // I'm the super class
    });

    qx.Class.define("my.cool.Class", {
      extend : my.great.SuperClass
    });

.. _pages/oo_feature_summary#constructor:

Constructor
===========

The constructor of a regular class is provided as a function declaration in key ``construct``: 
::

    qx.Class.define("my.cool.Class", 
    {
      extend : my.great.SuperClass,
      construct : function() {
        ...
      }
    });

.. _pages/oo_feature_summary#static_members:

Static members
==============

Static members (often called "class" members) are also part of the class definition and declared in a map to the ``statics`` key. Static *methods* are given by providing a function declaration, while all other values declare static *attributes*. Typically they are given in uppercase to distinguish them from instance members:
::

    qx.Class.define("my.cool.Class", 
    {
      statics : 
      { 
        FOO : VALUE,
        BAR : function() { ... }
      }
    });

Static members, both methods and attributes, can be accessed by using the fully-qualified class name:
::

    my.cool.Class.FOO = 3.141;
    my.cool.Class.BAR();

.. note::

    You can use static members as constants, but the value can be changed in the run time!!


.. _pages/oo_feature_summary#instance_members:

Instance Members
================

Similar to static members, instance members are also part of the class definition. For them the ``members`` key is used:  
::

    qx.Class.define("my.cool.Class", 
    {
      members: 
      { 
        foo : VALUE,
        bar : function() { ... }
      }
    });

The instance members can be accessed by using an actual instance of a class:
::

    var myClass1 = new my.cool.Class;
    myClass1.foo = 3.141;
    myClass1.bar();

.. _pages/oo_feature_summary#accessing_static_members:

Accessing Static Members
========================

Generic form. Requires no updates if class name changes. This code can optionally be optimized for performance in build versions.
::

    qx.Class.define("my.cool.Class", 
    {
      statics : {
        PI : 3.141
      },
      members : {
        circumference : function(radius) {
          return 2 * this.self(arguments).PI * radius;
        }
      }
    });

.. note::

    For ``this.self`` to be available, the class must have as a direct or indirect base class ``qx.core.Object``.

.. note::

    Static members aren't inherited.  For calling a superclass static method, use ``this.superclass``, like in this example:

    ::

        qx.Class.define('A', {
          statics: {
             f: function() {}
          }
        });

        qx.Class.define('B'), {
          extend: A,
          members: {
             e: function() {
                this.superclass.self(arguments).f();
             }
          }
        });

    Static functions can access other static functions directly through the ``this`` keyword.

.. _pages/oo_feature_summary#calling_the_superclass_constructor:

Calling the Superclass Constructor
==================================

Generic form. Requires no updates if super class (name) changes. This code can optionally be optimized for performance in build versions.
::

    qx.Class.define("my.cool.Class", 
    {
      extend : my.great.SuperClass,
      construct : function(x) {
        this.base(arguments, x);
      }
    });

.. _pages/oo_feature_summary#calling_the_overridden_superclass_method:

Calling the Overridden Superclass Method
========================================

Generic form without using ``prototype``. Requires no updates if super class (name) changes. This code can optionally be optimized for performance in build versions.
::

    qx.Class.define("my.cool.Class",
    {
      extend : my.great.SuperClass,
      ...
      members : {
        foo : function(x) {
          this.base(arguments, x);
        }
      }
    });

.. _pages/oo_feature_summary#destructor:

Destructor
==========

As a logical match to any existing constructor given by the key ``construct``, a destructor is explicitly given by the ``destruct`` key: 
::

    qx.Class.define("my.cool.Class", 
    {
      extend : my.great.SuperClass,
      construct : function() {
        ...
      }
      destruct : function() {
        ...
      }
    });

.. _pages/oo_feature_summary#properties:

Properties
==========

qooxdoo comes with a very powerful feature called dynamic :doc:`properties <understanding_properties>`. A concise declaration of an ``age`` property may look like the following:

::

    qx.Class.define(
    ...
    properties : {
      age: { init: 10, check: "Integer" }
    }
    ...

This declaration generates not only a corresponding accessor method ``getAge()`` and a mutator method ``setAge()``, but would allow for many more :doc:`features <property_features>`.

.. _pages/oo_feature_summary#interfaces:

Interfaces
==========

A leading uppercase ``I`` is used as a naming convention for :doc:`interfaces <interfaces>`.

::

    qx.Interface.define("my.cool.IInterface");

.. _pages/oo_feature_summary#mixins:

Mixins
======

Leading uppercase ``M`` as a naming convention.  A :doc:`mixin <mixins>` can have all the things a class can have, like properties, constructor, destructor and members. 
::

    qx.Mixin.define("my.cool.MMixin");

.. _pages/oo_feature_summary#attaching_mixins_to_a_class:

Attaching mixins to a class
===========================

The ``include`` key contains either a reference to an single mixin, or an array of multiple mixins: 
::

    qx.Class.define("my.cool.Class", 
    {
      include : [my.cool.MMixin, my.other.cool.MMixin]
      ...
    });

.. _pages/oo_feature_summary#attaching_mixins_to_an_already_defined_class:

Attaching mixins to an already defined class
============================================

::

    qx.Class.include(qx.ui.core.Widget, qx.MWidgetExtensions);

.. _pages/oo_feature_summary#access:

Access
======

By the following naming convention. Goal is to be as consistent as possible. During the build process private members can optionally be renamed to random names in order to ensure that they cannot be called from outside the class.
::

    publicMember
    _protectedMember
    __privateMember

.. _pages/oo_feature_summary#static_classes:

Static classes
==============

Explicit declaration allows for useful checks during development. For example. ``construct`` or ``members`` are not allowed for such a purely static class. 
::

    qx.Class.define("my.cool.Class", {
      type : "static"
    });

.. _pages/oo_feature_summary#abstract_classes:

Abstract classes
================

Declaration allows for useful checks during development and does not require explicit code. 
::

    qx.Class.define("my.cool.Class", {
      type : "abstract"
    });

.. _pages/oo_feature_summary#singletons:

Singletons
==========

Declaration allows for useful checks during development and does not require explicit code. A method ``getInstance()`` is added to such a singleton class. 
::

    qx.Class.define("my.cool.Class", 
    {
      type : "singleton",
      extend :  my.great.SuperClass
    });

.. _pages/oo_feature_summary#immediate_access_to_previously_defined_members:

Immediate access to previously defined members
==============================================

The closed form of the class definition does not allow immediate access to other members, as they are part of the configuration data structure themselves. While it is typically not a feature used very often, it nonetheless needs to be supported by the new class declaration. Instead of some trailing code outside the closed form of the class declaration, an optional ``defer`` method is called after the other parts of the class definition have been finished. It allows access to all previously declared ``statics``, ``members`` and dynamic ``properties``. 

.. note::

    If the feature of accessing previously defined members is not absolutely necessary, ``defer`` **should not be used** in the class definition. It is missing some important capabilities compared to the regular members definition and it cannot take advantage of many crucial features of the build process (documentation, optimization, etc.).

::

    qx.Class.define("my.cool.Class",
    {
      statics:
      {
        driveLetter : "C"
      },
      defer: function(statics, members, properties) 
      { 
        statics.drive = statics.driveLetter + ":\\";
        members.whatsTheDrive = function() {
          return "Drive is " + statics.drive;
        };
      }
    });

.. _pages/oo_feature_summary#browser_specific_methods:

Browser specific methods
========================

To maintain the closed form, browser switches on method level is done using :doc:`environment settings </pages/core/environment>`. Since the generator knows about environment settings it is (optionally) possible to only keep the code for each specific browser and remove the implementation for all other browsers from the code and thus generate highly-optimized browser-specific builds. It is possible to use an logical "or" directly inside a environment key. If none of the keys matches the variant, the "default" key is used: 
::

    members: 
    {
      foo: qx.core.Environment.select("engine.name",
      {
        "mshtml|opera": function() {
           // Internet Explorer or Opera
        },
        "default": function() {
           // All other browsers
        }
      })
    }

.. _pages/oo_feature_summary#events:

Events
======

qooxdoo's class definition has a special ``events`` key. The value of the key is a map, which maps each distinct event name to the name of the event class whose instances are passed to the event listeners. The event system can now (optionally) check whether an event type is supported by the class and issue a warning if an event type is unknown. This ensures that each supported event must be listed in the event map.
::

    qx.Class.define("my.eventful.Class",
    {
      extend: qx.core.Target,

      events :
      {
        /**  Fired when the widget is clicked. */
        "click": "qx.event.type.MouseEvent"
      } 
      ...
    })

