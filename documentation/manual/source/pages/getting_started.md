Getting Started
===============

This section provides you with resources that help you pick the qooxdoo package for your needs, set it up on your local machine and get started with writing your own code.

%{Website}
----------

/pages/website is a low-level package that you deploy by including one or more *.js* file(s) in your HTML pages, like you would with many other %{JS} libraries. Its contents encompasses DOM and BOM abstractions, cross-browser event handling, a selector engine, and a stripped-down version of the qooxdoo class system \</pages/core\>. A small set of UI widgets is available. %{Website} is suitable if you basically want to manipulate DOM elements and styles on a page, as opposed to creating a single-page application written entirely in JavaScript.

%{Desktop}
----------

/pages/desktop contains the full scope of qooxdoo classes and infrastructure, like the class system, low-level DOM/BOM layers, a theming system, and a rich set of UI widgets and controls. It is available through the SDK \</pages/tool/sdk/sdk\_introduction\>. It allows you to create desktop-like, interactive web applications.

%{Mobile}
---------

/pages/mobile is used to develop applications for mobile platforms, like iOS and Android.It provides specific UI elements and theming capabilities suitable for mobile devices. Like the %{Desktop} component it is available through the SDK \</pages/tool/sdk/sdk\_introduction\>.

%{Server}
---------

/pages/server is a library suitable for all environments that do not provide a DOM, such as Node.js and Rhino. But you can also use it to program Webworkers. With no dependencies to external APIs (like a global *window* object), you get the infrastructure of qooxdoo's classes, mixins, properties, custom events and data binding.

Others
------

-   You can find some community made [tutorial videos on vimeo](http://vimeo.com/channels/qooxdoo).

