.. _pages/data_binding:

Data Binding
************

Data binding is a `concept <http://en.wikipedia.org/wiki/Data_binding>`__ by which two data items are bound, so that changes to one are propagated to the second, and vice versa. This requires the possibility to detect such changes during runtime. In qooxdoo, :ref:`class properties <pages/understanding_properties#understanding_properties>` fulfil this requirement.

Using data binding allows you to e.g. keep two widgets automatically synchronized over the runtime of your application, although they might be spatially separated and have wildly different visual representations (e.g. a text field and a spinner).

.. toctree::

   data_binding/data_binding
   data_binding/single_value_binding
   data_binding/controller
   data_binding/stores
   data_binding/models
