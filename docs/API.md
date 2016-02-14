#API

The API has these core concepts:

* Library
* Application
* Target
* Maker

##Library (qxcompiler.Library)
A Library is a collection of code, in a namespace with a Manifest.json - i.e. this is exactly the same as generate.py 
sees the concept of a Library.

Note that your application is also a Library - it has a namespace, classes in JS files, and a Manifest.json; both 
QxCompiler and generate.py see these as just libraries.  You know that one of the classes in your library is the
main "Application" class but QxCompiler just sees a library.

##Application (qxcompiler.Application)
An Application, in QxCompiler terms, is something that you want QxCompiler *to create*, which can be downloaded by
a web browser and run.  An Application primarily consists of the application class (eg possibly derived from 
qx.application.Standalone) and a theme; the QxCompiler will scan the Libraries looking for these classes and gathering
their dependency information until it has a complete set of classes to output.

##Target (qxcompiler.targets.*)
When creating an Application, QxCompiler assembles the code according to a Target - currently these are SourceTarget, 
BuildTarget, and HybridTarget and they correspond to the "build", "source" and "source-hybrid" targets in generate.py.

##Maker (qxcompiler.makers.*)
The process of analysing code and assembling Applications is typically controlled by a Maker; all this does is control
loading the dependency database, scanning Library's, and instructing the Target to output the Application.

For most apps the qxcompiler.makers.SimpleApp will be sufficient, but some applications are more involved - for example,
the DemoBrowser is actually a set of 222 Applications as well as the main DemoBrowser app, and the qxcompiler.makers.DemoBrowserApp
class takes care of "making" all 223 Applications.


