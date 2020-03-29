# Code Organisation Introduction

From a conceptual point of view there are only two broad categories
in qooxdoo's programming model, **libraries** and **applications**.

**Libraries** are basically containers that hold resources of any kind,
class files, JS code, images, html and translation files.
In this sense, the framework class library and its resources is a library. 

**Applications** are artefacts that are built from
the resources of these libraries. They are the "deliverables" that can
be deployed, can be run under some runtime environment like a browser
or Node.js, or are shipped to be consumed elsewhere. Libraries provide
the "parts", applications are the "products" made from these parts.

What constitutes a library is its
[Manifest.json](compiler/configuration/Manifest.md) file which provides
the main meta-data, and paths on disk which hold class code and resources.
That's it, and this is exactly what most application skeletons create.
So once you've run [`qx create`](cli/commands.md#create-a-new-project),
the result can immediately be used as a library. (The fact that it
has a main class which can be run as an application doesn't matter).

In contrast to libraries which hold the majority of all the
files you deal with (hence this little saying that in qooxdoo
*"everything is in a library"*), *applications**, which are basically
generated artefacts, are related only with the `compile.json` or
`compile.js` files [see here](compiler/configuration/compile.md),
which are used by the compiler to produce a runnable application.
