.. _pages/array#array_reference:

Array Reference
***************

qooxdoo has a few classes that concern arrays. Some of them are special wrappers and others are extensions. Here is a list of all classes which have something to do with arrays in qooxdoo.


Data binding specific array
===========================

* `qx.data.Array <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.data.Array>`_: The data array is a special array used in the data binding context of qooxdoo. It does not extend the native array of JavaScript but is a wrapper for it. All the native methods are included in the implementation and it also fires events if the content or the length of the array changes in any way. Also the *.length* property is available on the array.


Extension of the native array
=============================

* `qx.type.BaseArray <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.type.BaseArray>`_: This class is the common superclass for all array classes in qooxdoo. It supports all of the shiny 1.6 JavaScript array features like *forEach* and *map*. This class may be instantiated instead of the native Array if one wants to work with a feature-unified Array instead of the native one. This class uses native features wherever possible but fills all missing implementations with custom code.

* `qx.type.Array <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.type.Array>`_: An extended array class which adds a lot of often used convenience methods to the regular array like *remove* or *contains*.


Utility methods
===============

* `qx.lang.Array <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.lang.Array>`_: Provides static helper functions for arrays with a lot of often used convenience methods like *remove* or *contains*. 



Extending the native array's prototype
======================================

* `qx.lang.Core <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.lang.Core>`_: Adds some methods to array to lift every browser to the same level. The methods are:

  * indexOf
  * lastIndexOf
  * forEach
  * filter
  * map
  * some
  * every

* `qx.lang.Generics <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.lang.Generics>`_ : Support `string/array generics <http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics>`_ as introduced with JavaScript 1.6 for all browsers. 

  * join
  * reverse
  * sort
  * push
  * pop
  * shift
  * unshift
  * splice
  * concat
  * slice
  * indexOf
  * lastIndexOf
  * forEach
  * map
  * filter
  * some
  * every

