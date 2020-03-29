# How to Develop a Qooxdoo Application

In this section, we provide guidance how to
go about developing a Qooxdoo application.

> If you are an experienced Qooxdoo developer who has worked with version 5
of the framework: You can reuse almost all of your previous knowledge since
the framework is, with some small exceptions, fully backwards-compatible.
The major change concerns the tooling, which has changed fromf the Python-based
`generator.py` script to a NodeJS-based `qx` CLI. Please review [our guide to migrate your applications
to the new NodeJS-based tooling](compiler/migration.md).

Our [getting started guide](../README.md) should give you a first impression on
how to quickly create an application skeleton which then can be adapted and extended
to arrive at a first prototype of your application. Before you start, make sure to 
take the following points into consideration. 

## Development tools

Here's a [list of IDEs, code editors and other
development tools](development_tools.md) with
support for qooxdoo's API, features, and semantics.

## Application Layout

Application code is organized in a particular directory layout
which is necessary for the tool chain to work properly. See
the [details on code organization](code_organisation.md).

## Compile before Run

In general you need to invoke qooxdoo's tool chain, particularly the
[Compiler](compiler/), before you can run your application. Qooxdoo
has a Java-like approach to source code, in that it just "sits around"
like a bunch of resources. With the help of its configuration the
Compiler casts all these resources in a runnable application, e.g.
by creating a specific loader that loads all necessary class code.

## Source versus Build

You will usually develop your application in a so-called source* mode. In
this mode individual source code is preserved, except where it has to be
transpiled for the given target platform. This will make it easier to debug
the source code, however, it will make the application load much slower.

Once you are satisfied with your application, you will create
a *build* version of it. This version will be compressed and
optimized, and will be all geared towards deployment and runtime
efficiency. But it will be much less amenable to development.

## Solving common app development requirements

See [the HOWTO](howto/) for a list of tasks that typically need to be solved
during the development of a Qooxdoo application.  

## Dos and Donts

Once you have a good sense on how to work with Qooxdoo,
review the notes on [Best Practices](best_practices.md) and
[Antipatterns](antipatterns.md) which might help you to avoid common pitfalls.

## Debugging

Qooxdoo has its own [debugging system](debugging.md) which supports the special
features of the library.

## Creating custom libraries

Once your application has grown beyond a certain size, or when you
start a second application that could re-use some of the code of the
first, you start thinking about factoring code out into separately
manageable units. This is when you create [dedicated libraries](library_custom.md).

## Contributing

Once you have a firm grip of qooxdoo development and
you have created your own libraries and tools, you might
want to [contribute to the project](contribute.md).
