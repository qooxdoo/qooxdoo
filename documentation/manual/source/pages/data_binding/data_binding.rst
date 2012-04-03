.. _pages/data_binding#introduction:

Data Binding Introduction
=========================

Data binding is a functionality that allows to connect data from a source to a target. The entire topic can be divided into a low-level part, called "single value binding", and some higher-level concepts involving stores and controllers.

.. _pages/data_binding#the_main_idea:

The main idea
-------------

The main idea of qooxdoo's data binding component is best summarized by the following diagram.

|databindingarchitecture.jpg|

.. |databindingarchitecture.jpg| image:: databindingarchitecture.jpg

As you can see data binding includes five major components, which will be described in more detail in the following sections.


.. _pages/data_binding#data:

Data
^^^^

The data part is where the raw data is stored and can be retrieved from. This can be a plain local file, a regular web server or even a web service. There are all sources of data possible depending on the implementation of the actual store.

.. _pages/data_binding#store:

Store
^^^^^

The store component is responsible for fetching the data from its source and for including it into a data model of an application. For more info about the available store components see the :doc:`stores section <stores>` below.

.. _pages/data_binding#model:

Model
^^^^^

The model is the centerpiece of data binding. It holds the data and acts as an integration point for the store and for the controller. The stores provide a smart way to automatically the models classes during runtime. Take a look at the :doc:`models<models>` for details.

.. _pages/data_binding#controller:

Controller
^^^^^^^^^^

The main task of the controller components is to connect the data in the model to the view components. Details are available in the :doc:`controller section <controller>`. The base layer of all controllers, the :doc:`Single Value Binding <single_value_binding>` is explained later.

.. _pages/data_binding#view:

View
^^^^

The views for data binding can be almost any widget out of qooxdoo's rich set of widgets, depending on the type of controller. qooxdoo's data binding is not limited to some predefined data bound widgets. Please note that one of the most prominent data centric widgets, the virtual Table, currently still has its own model based layer and is not covered by the new data binding layer. The new infrastructure for virtual widgets is expected to nicely integrate the upcoming data binding layer, though.

.. _pages/data_binding#demos,_api_and_cheatsheet:

Demos, API and CheatSheet
=========================
You should now have a basic idea of qooxdoo's data binding, so to see it in action, take a look at the `online demos <http://demo.qooxdoo.org/%{version}/demobrowser/index.html#data>`_ and the `API reference <http://demo.qooxdoo.org/%{version}/apiviewer/index.html#qx.data>`_. 
If you want to start programming, maybe the :download:`CheatSheet <databindingcheatsheet.pdf>` can help you during your programming.

