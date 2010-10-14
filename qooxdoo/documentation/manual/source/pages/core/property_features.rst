.. _pages/property_features#property_features:

Property features summarized
****************************

.. note::

    The chapter gives you an compact but extensive overview of the features offered by qooxdoo's property system.
    Please refer to :doc:`defining_properties` for an explanation of how to define and use properties.

.. _pages/property_features#value_checks:

Value checks
============
  
  * Built-in types for most common things
  * Runtime checks (development version only)
  * Instance checks by simply define the classname of the class to check for (always use an instanceof operation - a real classname is not available anymore)
  * Custom check method by simply attaching a function to the declaration
  * Custom check defined by a string which will be compiled into the resulting setters (faster than the above variant)
  * Define multiple possible (primitive) values using an array

.. _pages/property_features#validation:

Validation
==========

  * Validation in both development and build version
  * Predefined validators for default validation
  * Throws a special validation error

.. _pages/property_features#advanced_value_handling:

Advanced value handling
=======================

  * Multi value support. Support to store different values for init, inheritance, style and user including a automatic fallback mechanism between them.
  * Inheritance support. Inheritance of properties defined by a parent widget e.g. inherit enabled from a groupbox to all form elements. Uses the inheritance if the computed value would be ``undefined`` or explicitly set to ``"inherit"``. The getter simply returns ``"inherit"`` for inheritable properties which are otherwise unset.
  * Blocks unintentionally ``undefined`` values in all setters with an exception. To reset a value one must use the ``reset`` or ``unstyle`` method which are available too.
  * Overriding of a value by setting a property explicitly to ``null``
  * Properties must be explicitly configured as ``"nullable"`` (like in .Net). The default is ``false`` which means that incoming ``null`` values will result in an exception.
  * Accessing nullable properties with ``undefined`` values will result in a normalization to ``null``.

.. _pages/property_features#convenience:

Convenience
===========

  * Convenient toggle method for boolean properties

.. _pages/property_features#notification:

Notification
============

  * Support for a custom apply rountine
  * Event firing with a custom named event

.. _pages/property_features#initialization:

Initialization
==============

qooxdoo automatically correctly initializes properties. This is true for both, properties which have defined an ``init`` value and also for the other properties which are ``nullable``. This means that after you have created an instance the properties correctly reflect the applied value. Default values assigned by ``init`` also execute the configured ``apply`` methods and dispatch configured events to inform already added listeners. 

:doc:`property_behavior`

.. _pages/property_features#performance:

Performance
===========

Automatic optimization of all setters to the optimal highly-tuned result code. Impressive tailor made high performance setters are the result.

Please note that after the definition point of a property the setters are not yet available. Wrappers for them will be created with the first instance and the final code will be generated with the first use of such a setter. This first use will also automatically unwrap the property setter to directly use the generated one.

.. _pages/property_features#memory_managment:

Memory managment
================

Automatic memory management. This means all so-configured properties which contain complex data objects get automatically disposed with the object disposal. The affected built-in types are already auto-configured this way. Also all properties which need an instance of a class, defined by using a classname as ``check`` are automatically handled. 

.. note::

    Note that this does not actually call dispose() on the object but just removes the property value etc i.e. dereferences the object. You still need to call dispose() if necessary.


For all other properties which contain complex data the developer must add a ``dispose`` key with a value of ``true`` to the property declaration. For example if there is no ``check`` defined or the ``check`` definition points to a function.

.. note::

    This is not needed for primitive types like strings and numbers.

