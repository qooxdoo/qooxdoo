Generator Script Optimizations
==============================

When creating the JavaScript output for an application, the generator supports several optimizations. These optimizations can be enabled in the generator configuration using the :ref:`optimize <pages/tool/generator_config_ref#compile-options>` key. Each of them is described here in detail.


.. _pages/tool/generator_config_articles#basecalls:

basecalls
---------

Calls to :ref:`this.base() <pages/classes#inheritance>`, which invoke the corresponding superclass method, are inlined, i.e. the superclass method call  is inserted in place of the this.base() call.

.. _pages/tool/generator_optimizations#comments:

comments
--------

The *comments* optimization is automatically included in any of the other optimizations, so really only makes a difference when given as the only optimization key for the given build. In that case, comments are stripped from the source code, and the resulting text is passed to the script output, also retaining (most of the) white space of the source version. What you get is a near-source code version in the running application that allows you to focus on the code, and is lighter in terms of transfer size.

.. _pages/tool/generator_config_articles#privates:

privates
--------

This is less an optimization in space or time, but rather a way to enforce privates. Private members of a class (those beginning with "__") are replaced with generated names, and are substituted throughout the class. If some other class is accessing those privates, these references are not updated and will eventually fail when the access happens. This will lead to a runtime error.

There is a caveat with privates optimization: Apart from identifier references to the private, also **string references** in the class code will be replaced. That means if a string literal contains of the exact sequence of characters as the private key, the contents of the string will also be replace. This only affects complete matches, not partly matches in a larger string.

::

  __foo : function () {
    this.debug("__foo");
    this.debug("__foo called");
  }

If ``__foo`` is replaced by, say, ``__a`` by the private optimization, the code will look like this after the optimization::

  __a : function () {
    this.debug("__a");
    this.debug("__foo called");
  }

The reason for this behaviour is that members, including private members, of a class are sometimes referenced by their name string, particularly in definitions of *properties*, and as arguments to *dispose methods*, as used in the ``destruct`` member of a class. Here is a longer code fragment to show where name references to members can be used::

  properties : {
    myprop : {
      apply : "__myapply",
      validate : "__myvalidate"
    }
    
  },
  members : {
    __foo : ...,
    __myapply : function () {...},
    __myvalidate : function () {...}
  }
  ...
  destruct : function () {
    this._disposeObjects("__foo");
  }

For more details where string references can occur, see e.g. the :doc:`class </pages/core/class_quickref>` and :doc:`property </pages/core/properties_quickref>` quick refs.

.. _pages/tool/generator_config_articles#strings:

strings
-------

With the string optimization, strings are extracted from the class definition and put into lexical variables. The occurrences of the strings in the class definition is then replaced by the variable name. This mainly benefits IE6 and repetitive references to the same string literal.

.. _pages/tool/generator_config_articles#variables:

variables
---------

Long variable names are made short. Lexical variables (those declared with a *var* statement) are replaced by generated names that are much shorter (1-2 characters on average). Dependending on the original code, this can result in significant space savings.

.. _pages/tool/generator_optimizations#variants:

variants
--------

With giving the *variants* optimization key, code will be pruned from the application script that is not relevant for this build. The decision about relevance is based on the settings given in the job configuration's :ref:`environment <pages/tool/generator_config_ref#environment>` key. Often, these settings will be queried in class code to select a certain code branch. If the value of the setting is known at compile time, the correct branch can be selected right away, and all other branches be removed. This allows to omit code that wouldn't be executed at run time anyway (also known as "dead code removal").

The way environment settings are queried in class code is through certain APIs of the `qx.core.Environment <http://demo.qooxdoo.org/%{version}/apiviewer#qx.core.Environment>`_ class. These API calls are searched for, and depending on context safe optimizations are applied. Here are the different calls and how they are treated.

.get()
+++++++++++++++++++++++++

`qx.core.Environment.get() <http://demo.qooxdoo.org/%{version}/apiviewer#qx.core.Environment~get>`_ refences the environment key as its first parameter. If this parameter is a literal, i.e. a string, representing a known environment key, the call can be replaced by the environment key's value. This is applied in all situations, and saves the method call at run time::

  var a = qx.core.Environment.get("myapp.foo");


If the value of the environment key is ``"bar"``, the expression is thus reduced to a simple assignment, where ``a`` is assigned the value ``"bar"``::

  var a = "bar";

If the call happens inside the condition of an ``if`` statement, and the call is the only expression, it is evaluated and the whole *if* statement is replaced by either its *then* or its *else* branch, depending on the truth value of the environment key.

::

    if (qx.core.Environment.get("myapp.foo")) {
      // some code if mayapp.foo evaluates to true
    } else {
      // some code if myapp.foo evalutates to false
    }

The same holds true if the call to *qx.core.Environment.get()* is not the only expression in the *if* condition, but is part of a simple compare where

* the condition operator is one of ``==``, ``===``, ``!=``, ``!===``
* the other operand is a literal value (like ``"foo"``, ``3``, or ``true``)

::

    if (qx.core.Environment.get("myapp.foo") == "bar") {
      ...
    } else {
      ...
    }

Again, the branch of the *if* statement is chosen according to the outcome of the comparison. If the condition evaluates to false and there is no *else* branch, the *if* statement is removed.


.select()
++++++++++++++++++++++++++++

With `qx.core.Environment.select() <http://demo.qooxdoo.org/%{version}/apiviewer#qx.core.Environment~select>`_ you can choose an expression from a set of expressions according to the current value of an environment key. The first parameter to the call is again the environment key, the second is a map that maps possible values to arbitrary expressions.

Again, if the key is a literal string and can be found in the environment settings known to the generator, the whole *qx.core.Environment.select()* expression is replaced by the corresponding expression from the map parameter.

::

    var a = qx.core.Environment.select("myapp.foo", {
      "bar" : function (x) { return x+3;},
      "baz" : 24
    }

Depending on the value of ``myapp.foo``, the variable ``a`` will be asigned a function, or the number literal *24*.

You can include the special key **"default"** in the map parameter to *.select()*. Its expression will be chosen if the value of the environment key does not match any of the other concrete map keys. If the generator comes across a *.select()* call where the environment value does not match any of the map keys *and* there is no *"default"* key, it will raise an exception.

 
