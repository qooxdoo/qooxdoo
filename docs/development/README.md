# How to Develop a qooxdoo Application

How you develop a qooxdoo application largely depends on for
which target platform you develop (browser, server, mobile,
...). Here are some common traits, though, that you will
come across when developing an application with qooxdoo:

## Application Layout

Application code is organized in a particular directory layout
which is necessary for the tool chain to work properly.
The skeletons help you to adhere to that organisation.

## Generate before Run

In general you need to invoke qooxdoo's tool chain, particularly the
[Compiler](compiler/), before you can run your application. qooxdoo
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
