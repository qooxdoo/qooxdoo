.. _pages/data_binding/models#models:

Models
******

The model is the centerpiece of data binding. It holds the data and acts as an integration point for the :doc:`stores<stores>` and for the :doc:`controller <controller>`. Almost all models are plain qooxdoo classes holding the data in simple properties, which are configured to fire events on every change. These change events are the most important part of the models and the reason, why plain %{JS} objects are not enough as models. The same is true for native %{JS} arrays. Since they do not fire events when items are changed as well, a complementary array is added for data binding purposes. More details about that in the `data array`_ section.

Still, there is no need to manually write own model classes for every data source you want to work with. The marshalers provide a smart way to automatically create these classes during runtime. Take a look at the `JSON marshaler`_ for details.

In the following sections, we first take a look at the models basics and how they work. After that, we dig into the role of arrays and how that is solved. As a last section, we check out how the model creation is done in qooxdoo, because you don't need to write all the simple models yourself.

.. _pages/data_binding/models#structure:

Structure
---------

As already mentioned in the introduction of this chapter, models are plain qooxdoo objects. The main idea of such a model is to hold all data in properties, which fire change events as soon as new data is available. Lets take a look at a simple example in which we use JSON data to demonstrate how models look. The data in the example looks like this:

::
  
  {
    s: "string",
    b: true,
    a: []
  }

A corresponding model should now be an object, which class defines three properties, named ``s``, ``b`` and ``a``. Lets take a look at the following qooxdoo code, in which we assume that we have a fitting model:

::

  var model = new ExampleModel(); // this returns a fitting model
  model.getS(); // return the value of the property 's' which is "string"
  model.setB(false); // will fire a change event for the property 'b'

I guess it's clear now, how models are structured. There is not much code or magic about them, but they are the most important part in the whole binding scenario.


.. _pages/data_binding/models#data_array:

Data Array
----------

If we take a second look at the example we used above, we also added an array as value of property ``a``. This array should not be an plain %{JS} array, instead it should be a qooxdoo data array, which Class is located in ``qx.data.Array``. The reason for that should be quite obvious right now, the binding needs to get an event as soon as some data changed to do all the necessary updates. As regular arrays can't offer such notifications, we added our own array implementation to the data binding layer. The data array is as close as possible to the native array but in some core things, we needed to change the API. The major difference is the accessing of items in the array. The following sample code, based on the sample above, shows the differences:

::

  var array = model.getA();
  array.setItem(0, "content"); // equals 'array[0] = "content"' and fires a change event
  array.getItem(0); // equals 'array[0]' and returns "content"
  array.lenght; // like the native API and returns '1'

You see, the read and write access needs to be done with the designated methods to ensure the firing of the events. But all the other API, like ``push``, ``pop`` or ``splice`` is all the same and also capable of the events. Just take a look at the `API-Documentation of the array <http://demo.qooxdoo.org/current/apiviewer/#qx.data.Array>`_ for more information.


.. _pages/data_binding/models#importance_of_events:

Importance of events
--------------------

The two sections above explained how models look and why. The most mentioned reason is the need for change events, which gives them also an important role in the data binding. They are responsible for notifying every connected view (which can be more than one) to update their representation of the data stored in the model. You can see the events as a nervous system for your data bound app.


.. _pages/data_binding/models#disposing:

Disposing
---------

Those of you familiar with qooxdoo and its objects should know, that disposing is necessary. This is also true for model objects and data arrays. The model objects do have one special thing, the do a deep disposing, when created with the marshaler, which we get to know in the following section. 


.. _pages/data_binding/models#json_marshaler:

JSON Marshaler
--------------

The marshaler takes care of converting JavaScript Objects into qooxdoo classes and instances. You can initiate each of the two jobs with a method.

.. _pages/data_binding/models#toclass:

toClass
^^^^^^^
This method converts a given JavaScript object into model classes. Every class will be stored and available in the ``qx.data.model`` namespace. The name of the class will be generated automatically depending on the data which should be stored in it. As an optional parameter you can enable the inclusion of bubbling events for every change of a property.
If a model class is already created for the given data object, no new class will be created.

.. _pages/data_binding/models#tomodel:

toModel
^^^^^^^
The method requires that the classes for the models are available. So be sure to call the ``toClass`` method before calling this method. The main purpose of this method is to create instances of the created model classes and return the model corresponding to the given data object.

.. _pages/data_binding/models#createmodel_static:

createModel (static)
^^^^^^^^^^^^^^^^^^^^
This method is static and can be used to invoke both methods at once. By that, you can create models for a given JavaScript objects with one line of code:

::

  var model = qx.data.marshal.Json.createModel({a: {b: {c: "test"}}});



.. _pages/data_binding/stores#how_to_get_my_own_code_into_the_model:

How to get my own code into the model?
--------------------------------------

What if you want to to bring your own code to the generated model classes or if you even want to use your own model classes? Thats possible by adding and implementing a delegate to the data store. You can either

* Add your code by supporting a superclass for the created model classes.
* Add your code as a mixin to the created model classes.
* Use your own class instead of the created model classes.

Take a look at the API-Documentation of the `qx.data.store.IStoreDelegate <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.data.store.IStoreDelegate>`__ to see the available methods and how to implement them.