Getting Started
***************

This section provides you with resources that help you pick the qooxdoo package for your needs, set it up on your local machine and get started with writing your own code.


%{Website}
===========

:doc:`/pages/website` is a low-level package that you deploy as a single *.js* file, like you would with many other %{JS} libraries. Its contents encompasses DOM and BOM abstractions, cross-browser event handling, a selector engine, and a stripped-down version of the qooxdoo :doc:`class system </pages/core>`. It does not include any UI widgets. It is suitable if you basically want to manipulate DOM elements on a page.

.. toctree::
   :maxdepth: 1

   Requirements <website/requirements>
   Getting Started <website/getting_started>


%{Desktop}
==========

:doc:`/pages/desktop` contains the full scope of qooxdoo classes and infrastructure, like the class system, low-level DOM/BOM layers, a theming system, and a rich set of UI widgets and controls. It is available through the :doc:`SDK </pages/tool/sdk_introduction>`. It allows you to create desktop-like, interactive web applications.

.. toctree::
   :maxdepth: 1

   Requirements <desktop/requirements>
   Getting Started <desktop/getting_started>


%{Mobile}
=========

:doc:`/pages/mobile` is used to develop applications for mobile platforms, like iOS and Android.It provides specific UI elements and theming capabilities suitable for mobile devices. Like the %{Desktop} component it is available through the :doc:`SDK </pages/tool/sdk_introduction>`.

.. toctree::
   :maxdepth: 1

   Requirements <mobile/requirements>
   Getting Started <mobile/getting_started>


%{Server}
=========

:doc:`/pages/server` is a library suitable for all environments that do not provide a DOM, such as Node.js and Rhino. But you can also use it to program Webworkers. With no dependencies to external APIs (like a global *window* object), you get the infrastructure of qooxdoo's classes, mixins, properties, custom events and data binding.

.. toctree::
   :maxdepth: 1

   Requirements <server/requirements>
   Getting Started <server/getting_started>


Others
=========

* You can find some community made `tutorial videos on vimeo <http://vimeo.com/channels/qooxdoo>`_.


