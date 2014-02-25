Tutorial: Basic Tool Chain Usage
--------------------------------

In various introductions and tutorials you were using the qooxdoo tool chain
casually along the way. Now it's about time to take a more systematical
look. The main interface to invoke the tool chain is the *generate.py*
script that is part of every skeleton, often colloquially referred to as
"the Generator". In each qooxdoo library or application, it sits next to
the library's *Manifest.json* and the default configuration file,
*config.json*. The *Manifest.json* file is the main declaration file for
any qooxdoo app, it's constitutional document if you will. *config.json*
is the configuration file that steers the Generator and its actions.
When invoked, the Generator looks for a file of this name in the current
directory for default instructions, but you can supply an alternative
configuration file with a command line option. Invoking ::

    generate.py -h |--help

gives you a complete list of those options.

|image0|

In the general case the Generator takes the name of a *job* to perform
as its sole argument. You can even invoke it without any argument, and it will
run the "default job" if the configuration defines one.

Supplying a non-existing job name will result in
the Generator providing a list of known jobs which it can perform. You
can try this by using a made-up job name like "*x*"::

    generate.py x

The ensuing list can be daunting at first, but we will pick out the most
important jobs here.

|image1|

Generating a Runnable App
~~~~~~~~~~~~~~~~~~~~~~~~~

The most important job of the Generator is to create a version of your
application that you can run in the browser. This is surprising for many
people at first. Why do I need to "generate" a working application, when
I have written my JavaScript and have an index.html handy? Why not just
load the app right away? The answer is that qooxdoo is not a
prefabricated JS library that you just *<script>*-include in your HTML
page. For each application exactly those classes are selected that are
necessary to run it. This avoids any overhead of carrying unnecessary
code with your app. To achieve this, an individual piece of JavaScript
code is generated, the so-called *loader*. For any qooxdoo application,
this loader is the first file to be loaded and evaluated in the browser,
and it makes sure all necessary components of the application get loaded
after it as well. Besides many other benefits that can be achieved, this
is the central reason to have a generation step before a qooxdoo app can
be run.

Use the Source, Luke
~~~~~~~~~~~~~~~~~~~~

The tool chain is able to generate your application in various flavors.  This is
reflected by the available generation jobs, "source", "source-hybrid",
"source-all" and "build". The most important for starting and building up your
app, are the source jobs. Running ::

    generate.py

will generate the so-called "source version" of your application in the default variant.

In general, the source version of an app is tailored towards development activities. It
makes it easy to write code, run the application, test, debug and
inspect the application code, fix issues, add enhancements, and repeat.

In the :ref:`source <pages/tool/generator/generator_default_jobs#source>` job, all the classes of the app are in their original source form, and loaded from their original file paths on the file system.
If you inspect your application in a JavaScript debugger like Firebug or
Chrome Developer Tools, you can identify each of your custom files individually, read
its code and comments, set breakpoints, inspect variables and so forth.
This job is particular interesting when you want to debug classes outside your custom application, e.g. if you are debugging another library along the way.

You only have to re-run this Generator job when you introduce new
dependencies, e.g. by instantiating a class you haven't used before.
This changes the set of necessary classes for your application, and the
Generator has to re-create the corresponding loader.

In the :ref:`source-hybrid <pages/tool/generator/generator_default_jobs#source-hybrid>` version, the Generator will concatenate class files into a bunch of script files, except for your application classes which are loaded directly from their original path on the file system. This allows for a reasonable loading speed of your application in the browser while still providing convenient debug access to your own class files.

With :ref:`source-all <pages/tool/generator/generator_default_jobs#source-all>` all existing classes will be included, be they
part of your application, the qooxdoo framework, or any other qooxdoo
library or contribution you might be using. All those classes are
included in the build, whether they are currently required or not. This
allows you develop your code even more freely as you don't have to
re-generate the application when introducing new dependencies. All
classes are already there, after all. The down-side is that due to the
number of classes your app loads slower in the browser, so it's a
trade-off between development speed and loading speed.


So if you are just getting
started with qooxdoo development, use the *source-all* version, which is
the most convenient if you are not too impatient. If you are concerned
about loading speed during development, but don't mind hitting the up
and return keys in your shell window once in a while, go with the
default *source-hybrid* job. If your emphasis on the other hand is on
inspection, and you want to see exactly which class files get loaded
into your app and which code they provide, the *source* version
might be your preference.

A Deployment Build
~~~~~~~~~~~~~~~~~~

On the other end of the spectrum there is the ``build`` version of you
app. The "build" version is what you want to create at the end of a
development cycle, when your app is stable and you want to deploy it
into production. Running ::

    generate.py build

will create a highly optimized version of your app. All necessary code
is stripped, squeezed and compressed, and put into as few JS files as
possible. Everything is geared towards small size, fast transport, fast
loading and minimal memory footprint. Along with the code, all other
required resources, such as icons and images, are collected together
under a common root directory, usually named ``build``. The good thing
here is that this makes the contents of this directory self-contained so
you can copy it to the document tree of a web server, zip it up and send
it by mail, and so forth. All necessary content will be included, and the
app will just run when the contained *index.hmtl* is loaded.

For an example let's suppose you have an application ``myapp`` and a web server
instance running on a machine called ``fooserv``. Then, given suitable network
connection and setup, the following command will copy your build version to the
web server::

    scp -r build bar@fooserv:~/public_html/myapp

and you can load it in the browser with ::

    http://fooserv/~bar/myapp/

Non-App-Generating Jobs
~~~~~~~~~~~~~~~~~~~~~~~

So now you know about the basic jobs to create a runnable application
using the Generator. There is a whole bunch of jobs that is not
concerned with creating a runnable version of your app, but do other
things. One of those is addressed in the :doc:`tweets tutorial </pages/desktop/tutorials/tutorial-part-4-3>` which is
concerned with internationalization of an application. The Generator job
in this context is ``translation``, and extracts translatable strings
from your JavaScript source files into *.po* files. Here is a quick
topical overview of those kinds of jobs:

Internationalization:

-  ``translation`` -- extract translatable strings into .po files

Source Code:

-  ``lint`` -- check source code for potential issues
-  ``fix`` -- fix white space in source code
-  ``pretty`` -- re-format source code

Development:

-  ``api`` -- create an application-specific instance of the Apiviewer
-  ``test`` -- create an application-specific instance of the Testrunner
-  ``inspector`` -- create an application-specific instance of the
   Inspector

Files:

-  ``clean`` -- clean up generated files for this app
-  ``distclean`` -- clean up generated files for this app, and delete
   the Generator cache

As mentioned before, for a full list of available jobs with short
descriptions run ``generate.py x``, or see the
the list of :doc:`default jobs </pages/tool/generator/default_jobs_actions>`.

Tweaking Jobs
~~~~~~~~~~~~~

For most people the jobs that come with qooxdoo are good enough to get
all necessary work done. But not for all. Sometimes you want the output
file be named differently; or the index.html that loads your qooxdoo app
lives in some other part of your web space; or you want to get rid of a
specific optimization in your build version. Fortunately, the tool chain
of qooxdoo is very flexible and highly configurable. There is a set of
built-in functionality that can be drawn upon by job definitions, and
jobs can be freely defined or altered. The system is in fact so
configurable that we have thought of means of limiting its flexibility,
for the sake of an easier user interface. If you feel you want to change
the way in which a particular Generator job works, or define one from scratch,
see a :doc:`dedicated page </pages/tool/generator/config_tweaking>` on this topic.

.. |image0| image:: tutorial_basics/generate_h12.png
.. |image1| image:: tutorial_basics/generate_x1.png
