Envrionment
***********

Introduction
============

The environment of an application is a set of values that can be queried through a well-defined interface. Since long qooxdoo supported the idea of a set of global values that can be queried from different parts of an application. Among other things, this was used in the framework to add debug code in the form of additional tests and logging, to provide browser-specific implementations of certain methods, asf. You can think of this set as a global key:value store for the application. Values were write-once, read-many. There were keys that came pre-defined with qooxdoo, and others that could be defined by the application itself. Values for those keys could only be provided at application startup, and not changed later.
