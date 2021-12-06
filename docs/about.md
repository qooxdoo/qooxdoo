# About Qooxdoo

**Qooxdoo v.#{qooxdoo.version}**

Qooxdoo (pronounced ['kuksdu:]) is a universal JavaScript framework for creating
enterprise-grade single-page web applications. With its class-based object
orientation, Qooxdoo allows the code of even the most complex applications well
organized and manageable. The integrated compiler produces single file
applications ready for deployment.

## Framework

The Qooxdoo framework enhances the javascript language with a full-fledged,
class-based object-oriented system, including a powerful properties system,
interfaces, and mixins. Qooxdoo code is based on namespaces to allow rigorous
and scalable code structure, asy integration with other libraries and existing
user code. It comes with a [comprehensive API reference](apps://apiviewer) that
is auto-generated from Javadoc-like comments in the framework sourcecode.

Qooxdoo programs are written in plain javascript; no new syntax is introduced,
and all the extra functionality is realized through clever application of
existing javascript abilities. In order to create an application that can be
loaded by the browser, the Qooxdoo source code has to be processed by the
Qooxdoo compiler.

The Qooxdoo compiler is a NodeJS-based application written in Qooxdoo itself. It
loads Qooxdoo source code and adds all the required framework components
necessary to create an application that is executable in the browser.

## GUI Toolkit

Despite being a pure JavaScript framework, Qooxdoo is on par with GUI toolkits
for desktop applications like Qt when it comes to advanced, yet easy to
implement, user interfaces. It offers a full-blown set of widgets that are
hardly distinguishable from elements of native desktop applications. Full
built-in support for keyboard navigation, focus, tab handling, and drag & drop
is provided. Dimensions can be specified as static, auto-sizing, stretching,
percentage, weighted flex or min/max, or even as combinations of those. All
widgets are based on powerful and flexible layout managers which are at the core
of many of the advanced layout capabilities.

No HTML or CSS has to be used and augmented to define the interface. The Qooxdoo
developer does not even have to know CSS to style the interface. Clean and
easy-to-configure themes for appearance, colors, borders, fonts and icons allow
for complete themability.

## Communication

While being a client-side and server-agnostic solution, the Qooxdoo project
includes different communication facilities, and supports low-level
XMLHttpRequests (XHR) as well as an RPC API. An abstract transport layer
supports queues, timeouts and implementations via XHR, Iframes and Scripts. Like
the rest of Qooxdoo, it fully supports event-based programming which greatly
simplifies asynchronous communication.

## Development tools

Qooxdoo is not only a library, but also comes with a set of sophisticated tools.
Some help with the development workflow, such as the
[command line interface](development/cli/commands.md). Others let you quickly get to know
the widgets (such as the [widget browser](apps://widgetbrowser)), become fluent
in the Qooxdoo API (such as the [API Viewer](apps://apiviewer)), or to debug or
demonstrate code snippets (such as the ["Playground"](apps://playground)).

## Package system

A versatile web framework wouldn't be complete without a package system which
allows modularizing and reusing code. Qooxdoo's
[package system](development/cli/packages.md) is based on GitHub repos. Packages can be
installed and published very easily with the Qooxdoo CLI.

## History

Qooxdoo was originally developed by one of the world's leading web hosters: 1&1
Internet (now part of United Internet AG). In late 2015, the Qooxdoo framework
with all its assets, was turned over to the Qooxdoo association, located in
Switzerland. Qooxdoo development has, since then, been lead by a group of
dedicated developers congregating on [gitter](https://gitter.im/qooxdoo/qooxdoo)
and [github](https://github.com/qooxdoo/qooxdoo) .
[Contributions](contribute.md) are always welcome.

## Contact

qooxdoo.org<br/> Aarweg 17<br/> 4600 Olten<br/> Switzerland

Email: [info@qooxdoo.org](mailto:info@qooxdoo.org)
