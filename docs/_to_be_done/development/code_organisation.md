Code Organisation Introduction
==============================

From a conceptual point of view there are only two broad categories in %{qooxdoo}'s programming model, **libraries** and **applications**.

*Libraries* are basically containers that hold resources of any kind, class files, JS code, images, html and translation files, you name it. In this sense, the framework class library and its resources is nothing more than a big library. *Applications* are artefacts that are built from the resources of these libraries. They are the "deliverables" that can be deployed, can be run under some runtime environment like a browser or Node.js, or are shipped to be consumed elsewhere. Libraries provide the "parts", applications are the "products" made from these parts.

What constitutes a library is its Manifest.json
\<tool/sdk/manifest\> file which provides the main meta-data, and paths on disk which hold class code and resources. That's it, and this is exactly what most application skeletons
\<development/skeletons\> create. So once you've run *create-application.py* the result can immediately be used as a library. (The fact that it has a main class which can be run as an application doesn't matter).

In contrast to libraries which hold the majority of all the files you deal with (hence this little saying that in %{qooxdoo} *"everything is in a library"*), applications, which are basically generated artefacts, are related only with two standard files, `config.json` and `generate.py`, or more abstractly build configuration and build tool interface. That means you can put a %{qooxdoo} configuration file anywhere on your file system, enter some paths to existing libraries and some build options, and invoking tool/bin/generator.py create a %{qooxdoo} application right away. Bang! But for convenience these files are also included with the skeletons, making each skeleton a library (Manifest.json) and a build environment (config.json) at the same time [1].

[1] *In addition to referring to a generated artefact that can e.g. run in a browser we sometimes speak about an "application" and mean the library which contains the main class, the one that will be used to start the entire application at runtime.*
