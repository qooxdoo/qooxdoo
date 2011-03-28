Envrionment
***********

Introduction
============

The environment of an application is a set of values that can be queried through a well-defined interface. Values are referenced through unique keys. You can think of this set as a global key:value store for the application. Values were write-once, read-many. A value for a certain key can be set in various ways, e.g. by code, through build configuration, etc., usually during startup of the application, and not changed later. Other environment values are automatically discovered when they are queried at run time, such as the name of the current browser, or the number of allowed server connections. This way, the environment API also implements the browser feature detection.

Environment settings are also used in the framework, among other things to add debug code for additional tests and logging, to provide browser-specific implementations of certain methods, asf. Certain environment keys are pre-defined by qooxdoo, the values of which can be overridden by the application. Applications are also free to define their own environment keys and query their values at run time.


.. _pages/core/environment#motivation:

Motivation
==========

Environment settings address various needs around JavaScript applications:

* Control initial settings of the framework, before the custom classes are loaded.
* Pass values from outside to the application.
* Trigger the creation of multiple build files.
* Query features of the platform at run time (browser engine, HTML5 support, etc.)
* Create builds optimized for a specific target environment, i.e. feature-based builds.


.. _pages/core/environment#defining:

Defining New Environment Settings
=================================

Values of environment keys can be specified in one of two ways, as a literal value, or as a function that returns a value at run time. The former can be achieve through various ways (see further), the latter only through method code. (An environment key with a concrete literal value is also referred to as an environment *setting*).

.. _pages/core/environment#defining_as_value:

As Literal Values
------------------

To assign a literal value to an environment key, you can define the setting

* in the class map
* in method code
* through inline ``<script>`` code in the index.html
* in the generator configuration
* via URL parameter

The list is sorted in ascending precedence, i.e. if a key is defined multiple times, mechanisms further down the list take higher precedence.

Those possibilities are explained in the following sections.


.. _pages/core/environment#in_class_map:

In the Class Map
^^^^^^^^^^^^^^^^

You can define a key and its value through the *environment* key of the map defining a qooxdoo class:

::

  qx.Class.define("myapp.ClassA", 
  {
    [...]

    environment : {
      "myapp.key" : value
    }
  });


.. _pages/core/environment#in_application_code:

In Application Code
^^^^^^^^^^^^^^^^^^^

You can define a key and its value in your class methods using the *qx.core.Environment.call* method:

::

  qx.core.Environment.add("key", "value");


.. _pages/core/environment#in_index_html:

In the Loading index.html
^^^^^^^^^^^^^^^^^^^^^^^^^

In the web page loading your qooxdoo application, and before the ``<script>`` tag loading the initial qooxdoo file, add another ``<script>`` tag with code that assignes a map to ``window.qxenv``, containing your environment settings.

.. code-block:: html

  <script>
    window.qxenv =
    {
      "myapp.key" : value
    }
  </script>


.. _pages/core/environment#in_configuration:

In the Generator Config
^^^^^^^^^^^^^^^^^^^^^^^

You can define a key and its value in the *environment* key of the job with which you build the script files of your application (e.g. *source-script*, *build-script*):

::

  "myjob" : 
  {
    [...]

    "environment" : {
      "myapp.key" : value
    }
  }

Using the generator config adds a special meaning to the provided environment settings. Specifying a **list** of values for a key triggers the creation of multiple output files by the generator. 

::

  "myjob" : 
  {
    [...]

    "environment" : {
      "myapp.key" : [value1, value2]
    }
  }


In this example, the generator will create two output files. See the :ref:`environment <pages/tool/generator_config_ref#environment>` key.


.. _pages/core/environment#in_url:

Via URL parameter
^^^^^^^^^^^^^^^^^^^

Before using URL parameter to define environment settings, you have to specify another environment setting in the generator configuration which is named ``qx.allowUrlSettings``. If the application is generated with this config setting in place, you can then use URL parameter to add further key:value pairs.

.. code-block:: html

  http://my.server.com/path/to/app/index.html?qxenv:mayapp.key:value

The pattern in the URL parameter is easy. It has three parts separated by colons. The first part is the constant ``qxenv``, the second part is the key of the environment setting and the last part is the value of the setting.


.. _pages/core/environment#defining_as_function:

As a Check Function
-------------------------------

Usually, settings defined by the runtime, are feature checks like checking for dedicated css or html features. These checks can be synchronous or asynchronous (See :ref:`Querying Environment Settings <pages/core/environment#querying>`).

Synchronous
^^^^^^^^^^^

::

  qx.core.Environment.add("group.feature", function() {
    return !!window.feature;
  });

This example shows the same API used by adding a key:value setting. The only difference is that you add a function as second parameter and not a simple value. This function is responsible for checking the feature and returning the value you want to be returned by the environment call. So in case ``window.feature`` is defined, the check will return ``true``.

Asynchronous
^^^^^^^^^^^^

::

  qx.core.Environment.addAsync("group.feature", function(callback) {
    window.setTimeout(function() {
      callback.call(null, true);
    }, 1000);
  });

This example shows how to add a asynchronous feature check. A timeout is used to get the asynchronous behavior in this simple example. That can be more complicated for course but the timeout is good enough to showcase the API.
As you can see in the check function we are adding, it has one parameter called ``callback`` which is the wrapped callback added by the asynchronous query. The check should call that callback as soon as the result is available. In the example, the check takes a second and calls the callback with the result ``true``.

.. _pages/core/environment#querying:

Querying Environment Settings
=============================

In general, there are two possibilities to query the settings and there are two different kinds of settings. The two kinds are synchronous and asynchronous. The asynchronous settings are especially for feature checks necessary where the check itself is asynchronous like checking for data urls support.

Synchronous
-----------

But first take a look at the synchronous API and the two possiblities of accessing the data:

::

  qx.core.Environment.get("myapp.key");


The ``get`` method is most likely the most important method. It returns the value for the given key, ``myapp.key`` in this example.

::

  qx.core.Environment.select("myapp.key", {
    "value1" : value,
    "value2" : value,
    "default" : catchAllValue 
  }

The ``select`` method is a way to select a value from a given map. This offers a convinient way to select methods e.g.. It also offers a default fallback which might be very handy in some cases where only one of the expected values needs a special code part. In the example above, value could be a function, or anything else.

Asynchronous
------------

The asynchronous methods are a direct mapping from its synchronous counterparts.

::

  qx.core.Environment.getAsync("myapp.key", function() {
    // callback
  }, context);

As the whole get is asynchronous, you have to specify a callback method which will be executed as soon as the query is done.

::

  qx.core.Environment.selectAsync("myapp.key", {
    "value" : function() { 
      // callback value 1
    },
    "default" : function() {
      // catch all callback
    }
  }

In case of a asynchronous select, the type of the values has to be a function, which will be called as soon as the query is done. The default case is also available, as you can see in the example above.


.. _pages/core/environment#caching:

Caching
-------

It sure happens in the live cycle of an application that some keye get queried quite often like the engine name. The environment system caches every value to ensure the best possible performance on expensive feature tests. But in some edge cases, it might happen that you want to redo the test. Exactly for such use cases, you can invalidate the cache for a given key.

::

  qx.core.Environment.invalidateCacheKey("myapp.key"}

This example would clear the cache for ``myapp.key``.

Removal of Code
---------------

Usually, function calls like *qx.core.Environment.get()* are executed at run time and return the given value of the environment key. This is useful if such value is determined only at run time, or can change between runs. But if you want to pre-determine the value, you can set it in the generator config. The generator can then anticipate the outcome of a query and remove code that wouldn't be used at run time.

For example,

::

    function foo(a, b) {
      if (qx.core.Variant.get("qx.debug") == true) {
        if ( (arguments.length != 2) || (typeof a != "string") ) {
          throw new Error("Bad arguments!");   
        }
      }
      return 3;
    }

will be reduced in the case *qx.debug* is *false* to 

::

    function foo(a, b) {
      return 3;
    }


In the case of a *select* call,

::

  qx.core.Environment.select("myapp.key", {
    "value1" : resvalue1,
    "value2" : resvalue2
  }

will reduce if *myapp.key* has the value *value2* to

::

    resvalue2




.. _pages/core/environment#pre_defined:

Pre-defined Environment Keys
============================

qooxdoo comes with a pre-defined set of environment settings. You can devied those into two big blocks. The first block is a set of feature tests which containt test for css or html features. The second big block are the settings for the qooxdoo framework which containg mainly debugging options.

For a complete list for predefined environment keys, take a look at the `API documentation of the qx.core.Environment class <http://demo.qooxdoo.org/%{version}/apiviewer#qx.core.Environment>`__.
