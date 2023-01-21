# How to Develop a Qooxdoo Application

In this section, we provide guidance how to go about developing a Qooxdoo
application.

> If you are an experienced Qooxdoo developer who has worked with version 5 of
> the framework: You can reuse almost all of your previous knowledge since
> later versions are, with some small exceptions, fully backwards-compatible. 
> The major change concerns the tooling, which has changed
> from the Python-based `generator.py` script to a NodeJS-based `qx` CLI. 
> In Qooxdoo v6, the python tool chain was still supported but deprecated, and 
> with the release of v7 it has been removed completely; the v7 release is
> based on ES6, the python toolchain will not work with the v7 codebase.  
> To convert your existing applications (including our tool to "ES6-ify" your own
> code), please review 
> [our guide to migrate your applications to the new NodeJS-based tooling](compiler/migration.md).

Our [getting started guide](../README.md#getting-started) should give you a first impression on
how to quickly create an application skeleton. We suggest you play with this
skeleton application and, with the help of the
[Demo Browser](apps://demobrowser), the [Widget Browser](apps://demobrowser/)
and the [API Viewer](apps://apiviewer), add some widgets to get a feel for how
Qooxdoo works. Before you start working on a first prototype of your
application, we encourage you to review the following points.

**Compiler and CLI**

Read this more detailed [introduction to the compiler and the CLI](./compiler/README.md)
and [in-depth information on the CLI commands](cli/commands.md).

**Development tools**

Here's a
[list of IDEs, code editors and other development tools](development_tools.md)
with support for Qooxdoo's API, features, and semantics.

**Application file layout**

Application code is organized in a particular directory layout which is
necessary for the tool chain to work properly. See the
[details on code organization](code_organisation.md).

**Code compilation and transpilation**

In general, you need to invoke Qooxdoo's tool chain, particularly
the [Compiler](compiler/README.md), before you can run your application.
Qooxdoo has a Java-like approach to source code, in that it just
"sits around" like a bunch of resources. With the help of its
[configuration](compiler/configuration/README.md), the Compiler casts all these
resources in a runnable application, e.g. by creating a specific loader
that loads all necessary class code. Using [Babel](https://babeljs.io/)
and its own [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
parser, it compiles your source code into a state that is optimized
and [polyfilled](https://en.wikipedia.org/wiki/Polyfill_(programming))
for the target runtime environment.

To help you with this required intermediate step, Qooxdoo provides
[continuous compilation in the background](compiler/README.md#creating-your-first-application)
and a [built-in web server](cli/commands?id=mini-web-server).

**'source', 'build', and 'deploy' targets**

You will usually develop your application to a so-called "source" compilation target. 
In this mode, individual source code is preserved, except where it has to be transpiled
for the given target platform. This will make it easier to debug the source
code, however, it will make the application load much slower.

Once you are satisfied with your application, you will create a more efficient 
version of it, using the "build" target. This version will be compressed and 
optimized, and will be all geared towards deployment and runtime efficiency. 
But it will be much less amenable to development.

When you have tested this version and are ready to deploy it to a production 
server, you [create the final version](cli/commands?id=building-for-production-and-deployment)
using `qx deploy`, which is the "build" version of your code without all the metadata 
files that are used to speed up compilation. 

**Writing API documentation**

If you follow Qooxdoo's API source code documentation rules, you get Qooxdoo's
attractive [API Viewer](apps://apiviewer/) for your own code, free of charge.
See [our guide on how to write API documentation](apidoc/README.md).

**Testing your code**

Qooxdoo supports a Test-Driven-Development paradigm as unit tests can be easily
added as normal Qooxdoo classes alongside your library classes. It comes with a
testrunner application which executes these tests either on the command line or
in a browser. See the  
[documentation on testing](testing/README.md).

**Solving common app development requirements**

See [the HOWTO](howto/README.md) for a list of tasks that typically need to be solved
during the development of a Qooxdoo application.

**Dos and Donts**

Once you have a good sense on how to work with Qooxdoo, review the notes on
[Best Practices](best_practices.md) and [Anti-patterns](antipatterns.md) which
might help you to avoid common pitfalls.

**Debugging**

Qooxdoo has its own [debugging system](debugging.md) which supports the special
features of the library.

**Creating custom libraries**

Once your application has grown beyond a certain size, or when you start a
second application that could re-use some of the code of the first, you start
thinking about factoring code out into separately manageable units. This is when
you create [dedicated libraries](library_custom.md) .

**Contributing**

Once you have a firm grip of Qooxdoo development and you have created your own
libraries and tools, you might want to
[contribute to the project](contribute.md).
