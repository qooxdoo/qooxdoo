.. _pages/data_binding/stores#stores:

Stores
======

The main purpose of the store components is to load data from a source and convert that data into a :doc:`model <models>`. The task of loading data and converting the data into a model has been split up. The store itself takes care of loading the data but delegates the creation of model classes and instances to a marshaler. More information about the marsahling and the models itself can be found in the :doc:`models section<models>`.

.. _pages/data_binding/stores#json_store:

JSON Store
----------

The JSON store takes an URL, fetches the given data from that URL and converts the data using the JSON marshaler to qooxdoo model instances, which will be available in the model property after loading. The state of the loading process is mapped to a state property. For the loading of the data, a ``qx.io.request.Xhr`` will be used in the store.

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
  var store = new qx.data.store.Yql(query);


.. _pages/data_binding/stores#offline_store:

Offline Store
-------------

The Offline store uses HTML local or session storage to store the data on the client. That can be used for offline storage as well as for other storage purposes on the client. You should use the :doc:`/pages/core/environment` checks to make sure that the used storage technology is supported by the environment you want to run your code in.

The following code demonstrates how to initialize the data store.

::

  if (qx.core.Environment.get("html.storage.local") {
    var store = new qx.data.store.Offline("my-test-key", "local");
    if (store.getModel() == null) {
      // initialize model ...
    }
  }


.. _pages/data_binding/stores#combining_with_controllers:

Combining with controllers
--------------------------

As described in the section above, you can access the model in the property after loading. The best solution is to use the model with a controller and then bind the the model properties with :doc:`Single Value Binding <single_value_binding>` together. The code for this could look something like this.

::

  store.bind("model", controller, "model");  

Using the :doc:`Single Value Binding <single_value_binding>`, the binding handles all the stuff related with the loading of the model data. That means that the data will be available in the controller as soon as its available in the store.