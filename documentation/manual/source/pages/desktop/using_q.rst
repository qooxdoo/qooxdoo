.. _pages/using_q#Using_q:

Using %{Website} in %{Desktop}
******************************

Use Case
========

In some scenarios, it might be necessary to use the low level part of qooxdoo named %{Website} in you %{Desktop} application. A common use case might be the setting of custom attributes or changing the style attribute of a DOM element. If you have one of those use cases, it is necessary to understand the setup of %{Website}.


Understanding the SetUp
=======================

The basic structure of %{Website} is module based and with that, loosely coupled. The base class called  ``qxWeb`` or ``q`` only contains minor functionality like the plugin API. All other functionality is offered by :ref:`modules <pages/website/overview#included_modules>`, even though the `API Viewer <http://demo.qooxdoo.org/%{version}/apiviewer/#qxWeb>`_ shows a different picture. ``q`` does not know any of these modules. This means that the dependency analysis, which is done by the generator and gathers all necessary classes, can not detect the dependency to the modules you are using.

Use require hints
=================

But the generator offers an easy to use way to tell it what to include. Let's say you want to use the method named ``fadeIn`` like in the following sample.

::

  var element = el; // DOM Element
  qxWeb(element).fadeIn();
  
The generator detects the dependency to the class ``qxWeb`` and makes sure it is available for your application. But the module attaching the method ``fadeIn`` is still missing and that's where we need to take care of adding this requirement. But which class adds this method? The `API Viewer <http://demo.qooxdoo.org/%{version}/apiviewer/#qxWeb>`_ can tell you that. Just open that `method in the API Viewer <http://demo.qooxdoo.org/%{version}/apiviewer/#qxWeb~fadeIn>`_ and check the details. It shows you a link to the original method and the implementing module. That's the module we need to include by adding a :ref:`require hint<pages/code_structure#details>` to the class.


The easy way
============

If you use a lot of the %{Website} API in your app, it might be worth to include all modules by requiring the namespace ``qx.module`` and with that, all %{Website} modules. But keep in mind that you might include classes you don't need / use and with that, the code size of your application.