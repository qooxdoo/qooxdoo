# How to Develop a Qooxdoo Application

In this section, we provide guidance how to
go about developing a Qooxdoo application.

> If you are an experienced Qooxdoo developer who has worked with 
version 5 of the framework: You can reuse almost all of your previous 
knowledge since version 6 of the framework is, with some small exceptions, 
fully backwards-compatible.
The major change concerns the tooling, which has changed from the 
Python-based `generator.py` script to a NodeJS-based `qx` CLI. The python 
tool chain will still work for all 6.* releases. However, it has been marked 
deprectated and will be removed in version 7.0.0. Since we won't be able to
maintain the old toolchain or provide support for it, we strongly recommend 
to use the new one for your projects. To convert your existing applications, 
please review [our guide to migrate your applications to the new NodeJS-based 
tooling](compiler/migration.md).

Our [getting started guide](../README.md) should give you a first impression on
how to quickly create an application skeleton. We suggest you play with this 
skeleton application and, with the help of the [Demo Browser](http://www.qooxdoo.org/apps/demobrowser), 
the [Widget Browser](http://www.qooxdoo.org/apps/demobrowser/) and the 
[API Viewer](http://www.qooxdoo.org/apps/apiviewer), add some widgets to get 
a feel for how qooxdoo works. Before you start working on a first prototype 
of your application, we encourage you to review the following points.

## Compiler and CLI

Read this more detailed [introduction to the compiler and the CLI](./compiler) and
[in-depth information on the CLI commands](./cli/commands).

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

## Writing API documentation

If you follow [Qooxdoo's API documentation rules](documentation/write_api_documentation.md),
you get Qooxdoo's attractive [API Viewer](apps://apiviewer/) for your own code,
too. 


## Testing your code

Qooxdoo supports a Test-Driven-Development paradigm as unit tests can be 
easily added as normal Qooxdoo classes alongside your library classes. It comes with 
a testrunner application which executes these tests either on the command line 
or in a browser. See the [documentation on testing](testing/).

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
