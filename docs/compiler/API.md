# API

The API has these core concepts:

* Library
* Application
* Target
* Maker

## Library (qxcompiler.Library)

A Library is a collection of code, in a namespace with a Manifest.json - i.e. this is exactly the same as generate.py
sees the concept of a Library.

Note that your application is also a Library - it has a namespace, classes in JS files, and a Manifest.json; both
QxCompiler and generate.py see these as just libraries.  You know that one of the classes in your library is the
main "Application" class but QxCompiler just sees a library.

## Application (``qxcompiler.Application``)

An Application, in QxCompiler terms, is something that you want QxCompiler *to create*, which can be downloaded by
a web browser and run.  An Application primarily consists of the application class (e.g. possibly derived from
``qx.application.Standalone``) and a theme; the QxCompiler will scan the Libraries looking for these classes and gathering
their dependency information until it has a complete set of classes to output.

## Target (``qxcompiler.targets.*``)

When creating an Application, QxCompiler assembles the code according to a Target - currently these are SourceTarget and
BuildTarget and they correspond to the "build" and "source" targets in generate.py.

**NOTE** that Hybrid targets do not exist any more - please see the `bundles` setting in `compile.json`

## Maker (``qxcompiler.makers.*``)

The process of analysing code and assembling Applications is typically controlled by a Maker; all this does is control
loading the dependency database, scanning Library's, and instructing the Target to output the Application.

For most apps the ``qxcompiler.makers.SimpleApp`` will be sufficient, but some applications are more involved - for example,
the DemoBrowser is actually a set of 222 Applications as well as the main DemoBrowser app, and the ``qxcompiler.makers.DemoBrowserApp``
class takes care of "making" all 223 Applications.

## Resources (``qxcompiler.resources.*``)

Analysing resources is controlled by ``qxcompiler.resources.Manager``, it scans the `resources` directory of each Library and compiles a database of what's available.  Along the way, it analyses the files according to the file extension - for images, it finds the width and height to add to the database, and for .meta files it incorporates the sprite data into the database.

Adding support for a new file is easy - derive a class from `qxcompiler.resources.Handler` and add it to the array in the constructor for `qxcompiler.resources.Manager`.
