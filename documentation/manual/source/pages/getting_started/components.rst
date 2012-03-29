.. _pages/getting_started/components#components:

qooxdoo Components
*******************

qooxdoo comes in several packages which cater for different environments and programming needs:

* :doc:`/pages/website` is a low-level package that you deploy as a single *.js* file, like you would with many other %{JS} libraries. Its contents encompasses DOM and BOM abstractions, cross-browser event handling, a selector engine, and the qooxdoo :doc:`class system </pages/core>`. It does not include any UI widgets. It is suitable if you basically want to manipulate DOM elements on a page.

* :doc:`/pages/desktop` contains the full scope of qooxdoo classes and infrastructure, like the class system, low-level DOM/BOM layers, a theming system, and a rich set of UI widgets and controls. It is available through the :doc:`SDK </pages/tool/sdk_introduction>`. It allows you to create desktop-like, interactive web applications.

* :doc:`/pages/mobile` is used to develop applications for mobile platforms, like iOS and Android.It provides specific UI elements and theming capabilities suitable for mobile devices. Like the Desktop component it is available through the :doc:`SDK </pages/tool/sdk_introduction>`.

* :doc:`/pages/server` is a library suitable for all environments that do not provide a DOM, such as Node.js and Rhino. But you can also use it to program Webworkers. With no dependencies to external APIs (like a global *window* object), you get the infrastructure of qooxdoo's classes, mixins, properties, custom events and data binding.
