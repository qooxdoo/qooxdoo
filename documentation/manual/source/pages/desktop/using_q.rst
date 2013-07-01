.. _pages/using_q#Using_q:

Using %{Website} in %{Desktop}
******************************

Use Case
========

Sometimes it might be desirable to use the low-level part of qooxdoo (named
%{Website}) in your %{Desktop} application. Use cases could be setting 
custom attributes or changing the style attribute of a DOM element. If you find
yourself in such a situation, it is necessary to understand the setup of
%{Website}.


Understanding the Setup
=======================

The basic structure of %{Website} is module-based and with that loosely
coupled. The base class called  ``qxWeb``, or ``q``, only contains minor
functionality, e.g. the plugin API. All other functionality is offered by
:ref:`modules <pages/website/module_overview>`, even though the `API
Viewer <http://demo.qooxdoo.org/%{version}/apiviewer/#qxWeb>`_ shows a
different picture. ``qxWeb`` does not have any built-in reference to any of
these modules. This means that the dependency analysis, which is done by the
generator and gathers all necessary classes, cannot detect the dependencies to
the modules you are using.

Use require hints
=================

But the generator offers an easy-to-use way to tell it what to include. Let's
say you want to use the method named ``fadeIn`` like in the following sample.

::

  var element = el; // DOM Element
  qxWeb(element).fadeIn();

The generator detects the dependency to the class ``qxWeb`` and makes sure it
is available for your application. But the module attaching the method
``fadeIn`` is still missing and that's where we need to take care of adding
this requirement.

But which class adds this method? The API Viewer can tell you that. Just `open
that method <http://demo.qooxdoo.org/%{version}/apiviewer/#qxWeb~fadeIn>`_  and
check the details. It shows you a link to the original method and the
implementing module. That's the module we need to include by adding a
:ref:`require hint<pages/code_structure#details>` to the class. At the top of
the file using the ``fadeIn`` method, add

::

  @use(qx.module.Animation)

(assuming the call to ``fadeIn`` is executed after the entire application has been
loaded). Once loaded the ``qx.module.Animation`` module will register itself
with ``qxWeb`` and its API will be available.

Mind that there are :doc:`alternative ways
</pages/tool/generator/dependencies_manually>` to declare additional
dependencies towards the Generator.


The easy way
============

If you use a lot of the %{Website} API in your app, it might be worth to
include the code modules by requiring ``qx.module.Core`` and with that the
basic %{Website} modules. But keep in mind that you might include classes you
don't need, which adds to the code size of your application.
