.. _pages/data_binding/stores#stores:

Stores
======

The main purpose of the store components is to load data from a source and convert that data into a model. The task of loading data and converting the data into a model has been split up. The store itself takes care of loading the data but delegates the creation of model classes and instances to a marshaler.

The only marshaler currently available is for JSON data and therefore, the only data store available is a JSON store. Both will be described in detail in the following sections.

.. _pages/data_binding/stores#json_marshaler:

JSON Marshaler
--------------

NOTE: This class should only be used if you want to write your own data store for your own data types or request. 

The marshaler takes care of converting JavaScript Objects into qooxdoo classes and instances. You can initiate each of the two jobs with a method.

.. _pages/data_binding/stores#toclass:

toClass
^^^^^^^
This method converts a given JavaScript object into model classes. Every class will be stored and available in the ``qx.data.model`` namespace. The name of the class will be generated automatically depending on the data which should be stored in it. As an optional parameter you can enable the inclusion of bubbling events for every change of a property.
If a model class is already created for the given data object, no new class will be created.

.. _pages/data_binding/stores#tomodel:

toModel
^^^^^^^
The method requires that the classes for the models are available. So be sure to call the ``toClass`` method before calling this method. The main purpose of this method is to create instances of the created model classes and return the model corresponding to the given data object.

.. _pages/data_binding/stores#createmodel_static:

createModel (static)
^^^^^^^^^^^^^^^^^^^^
This method is static and can be used to invoke both methods at once. By that, you can create models for a given JavaScript objects with one line of code:

::

  var model = qx.data.marshal.Json.createModel({a: {b: {c: "test"}}});

.. _pages/data_binding/stores#json_store:

JSON Store
----------

The JSON store takes an URL, fetches the given data from that URL and converts the data using the JSON marshaler to qooxdoo model instances, which will be available in the model property after loading. The state of the loading process is mapped to a state property. For the loading of the data, a ``qx.io.remote.Request`` will be used in the store.

The following code shows how to use the JSON data store.

::

  var url = "json/data.json";
  var store = new qx.data.store.Json(url); 

After setting the URL during the creation process, the loading will begin immediately. As soon as the data is loaded and converted, you can access the model with the following code.

::

  store.getModel();

.. _pages/data_binding/stores#jsonp_store:

JSONP Store
-----------

The `JSONP <http://ajaxian.com/archives/jsonp-json-with-padding>`_ store is based on the :ref:`JSON store <pages/data_binding/stores#json_store>` but uses a script tag for loading the data. Therefore, a parameter name for the callback and an URL must be specified.

The following code shows how to use the JSONP data store.

::

  var url = "json/data.json";
  var store = new qx.data.store.Jsonp(url, null, "CallbackParamName");

After setting the URL and the callback parameter name during the creation process, the loading will begin immediately.

.. _pages/data_binding/stores#yql_store:

YQL Store
---------

YQL is the `Yahoo! Query Language <http://developer.yahoo.com/yql/>`_. Yahoo! describes it as 
*"[...] an expressive SQL-like language that lets you query, filter, and join data across Web services."*
Based on the :ref:`JSONP store <pages/data_binding/stores#jsonp_store>`, qooxdoo offers a YQL store, where you can specify the YQL queries and qooxdoo handles the rest.

The following code demonstrates how to fetch some twitter messages.

::

  var query = "select * from twitter.user.timeline where id='wittemann'";
  var store = new qx.data.store.YQL(query);

.. _pages/data_binding/stores#combining_with_controllers:

Combining with controllers
--------------------------

As described in the section above, you can access the model in the property after loading. The best solution is to use the model with a controller and then bind the the model properties with single value binding together. The code for this could look something like this.

::

  store.bind("model", controller, "model");  

Using the single value binding, the binding handles all the stuff related with the loading of the model data. That means that the data will be available in the controller as soon as its available in the store.

.. _pages/data_binding/stores#how_to_get_my_own_code_into_the_model:

How to get my own code into the model?
--------------------------------------

What if you want to to bring your own code to the generated model classes or if you even want to use your own model classes? Thats possible by adding and implementing a delegate to the data store. You can either

* Add your code by supporting a superclass for the created model classes.
* Add your code as a mixin to the created model classes.
* Use your own class instead of the created model classes.

Take a look at the API-Documentation of the ```qx.data.store.IStoreDelegate <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.data.store.IStoreDelegate>`_`` to see the available methods and how to implement them.

