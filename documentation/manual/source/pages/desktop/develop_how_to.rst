How to Develop a %{Desktop} Application
********************************************

General Cycle of Activities
=============================
The general cycle of development activities while creating a desktop application is roughly:

  1. Create a *source* version of your app.
  2. Load it in a browser.
  3. Test, experiment, debug.
  4. Make changes to the source code.
  5. Cycle to 2.

This will be the main cycle of your activities.

Mind that you start with a Generator run creating your application. This is
necessary to produce a runnable application that will work in a browser. You
might have to re-run this step, depending on the variant of source version you
created. (In such a case, you will cycle to 1. instead of 2.). The currently
available source jobs include
:ref:`pages/tool/generator/generator_default_jobs#source`,
:ref:`pages/tool/generator/generator_default_jobs#source-all` and
:ref:`pages/tool/generator/generator_default_jobs#source-hybrid`. You can also use our :ref:`pages/tool/generator/default_jobs_actions#watch` job which will mirror all your changes and start the generation job automatically. See their individual job descriptions for details.


Build Version
==============

The basic programming model of qooxdoo suggests that you develop your
application in its source version, and once you're satisfied create
the *build* version of it, which is then deployed on a web server.
qooxdoo's build versions of an application are self-contained, they encompass
all script files, resources like images and style sheets, and any helper files
that are necessary for the application. You can safely copy the build
directory to the document forest of a web server, or zip it up in an archive
and send it by mail; the recipient should be able to unpack it and run the
application without flaws.

For a bit of background, here are more details of the build version.

Class Code
-----------
* Class code is compressed and optimized, and put in only a few script files,
  which are later loaded by the loader script.
* The number of script files is
  highly configurable, depending mainly on the us of :ref:`parts
  <pages/parts_overview#parts_and_packages_overview>`. In general, the Generator
  tries to minimize the number of script files.

Resources
----------
* Images like icons or decorators that are required by the classes which go into
  the application are copied from the various libraries they belong to. A
  `resource` directory tree is created in the build folder that reflects the
  various name spaces of the included images.
* The same applies to other static resources like style sheets, HTML files, or
  media files.
* The `index.html` file is copied from the source directory.

Translations and Localisation Data
-----------------------------------
* Translated strings and localisation data like calendar items are compiled into
  the JS script files, together with the class code.


.. _pages/desktop/develop_how_to#source_through_web_server:

Running the Source Version through a Web Server
=================================================

Basically, the source version of an application can be run off of the file
system (i.e. opening it with the *file://* protocol in your
browser). But there are reasons why you would want to run it over a web server.
You might need to integrate with backend services during development time, so
frontend and backend service points need to be on the same web server.
Same-origin-policy for other resources you want to use in your app might force
you into the same direction. And, browsers have increasingly become constraint,
e.g. when XHR requests go to the local disk from the *file://* protocol. This
impedes applications that just want to load some JSON data.

The issue with the the source version is that the generated loader script just
references source code and resources with relative paths, wherever they happen
to be on your file system. This poses some challenges when run from a web
server. Even if you include your application in a server-accessible path
(somewhere down from its document root or one of the defined aliases), chances
are that the source script references files which are **outside** the document
scope of the web server.

Web Server Jobs
-----------------
We have therefore provided two Generator jobs that address this situation, and
which you can run in your application main directory. Both build on the fact
that you can usually find a *common root* of all involved paths on the file
system, and to use that common root as an entry point for a web server.

The :ref:`pages/tool/generator/generator_default_jobs#source-server` job starts
a simple built-in web server that exports the common root as its document root.
The :ref:`pages/tool/generator/generator_default_jobs#source-httpd-config` job,
on the other hand, generates a web server configuration file, suitable for the
most popular web servers, so you can include it with your existing web server
setup. Both jobs will print on the console the URL with which you can load your
source application.

Rolling your own
------------------
We recommend using one of the above jobs. But if you find yourself in the
situation where you cannot utilize those, but need to work your own way through
the issue, here are some hints to guide you:

* Make the *source* directory of your application accessible to the web server,
  so that it is reachable through a valid URL like
  *http://your.web.server/path/to/yourapp/source/index.html*.
* Make sure all components that are used by your application, as there are the
  %{qooxdoo} SDK itself and any additional %{qooxdoo} library or contribution that you
  use, are equally accessible by the web server.

  * In the case of contribs referenced through the *contrib://* pseudo
    protocol in your application configuration, these are downloaded and stored in
    the download cache directory
    so make sure this path is included in your considerations. Use the
    :ref:`pages/tool/generator/generator_default_jobs#info` job to find this path on your
    system.

* Make sure the relative paths on the web server match those on your file
  system, e.g. if your app lives on the file system at

  ::

    /a/b/A/myapp

  and your qooxdoo installation is at

  ::

    /a/b/Z/qooxdoo-sdk

  and the server path to your app is

  ::

    /web/apps/myapp

  then make sure the server path to qooxdoo is

  ::

    /web/Z/qooxdoo-sdk

  so that relative references like

  ::

    ../Z/qooxdoo-sdk

  will work under the web server.

Summary
--------
All of the above really boils down to the following: Running the source version from a web server requires having the web server root be higher in the file system hierarchy than ALL the application source root and the qooxdoo SDK root and any qooxdoo contribs you might be using, so that all libraries are accessible from the application via relative paths at the server. (It corresponds to *file://* usage if the web server root is in fact the file system root.)


