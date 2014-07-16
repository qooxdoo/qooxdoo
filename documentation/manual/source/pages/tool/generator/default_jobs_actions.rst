.. _pages/tool/generator/generator_default_jobs#action_jobs:

Default Action Jobs
**********************

This page describes the jobs that are automatically available to all
skeleton-based applications (particularly, applications with config.json files
that include the framework's *application.json* config file). Mainly this is
just a reference list with short descriptions of what the jobs do. But in some
cases, there is comprehensive documentation about the interface of this job and
how it can be parametrized (This would usually require changing your
*config.json* configuration file).

These jobs can be invoked with the generator, e.g. as ``generate.py <jobname>``.

.. _pages/tool/generator/generator_default_jobs#api:

api
---
Create api doc for the current library. Use the following macros to tailor the
scope of classes that are going to show up in the customized apiviewer
application:

::

    "API_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]
    "API_EXCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

The syntax for the class pattern is like those for the :ref:`include
<pages/tool/generator/generator_config_ref#include>` config key.

Classes, which are not covered by ``API_INCLUDE``, are nevertheless included in
the api data with their full class description *if* they are required for
inheritance relationships (e.g. a class that is included derives from a class
which is not). If such a required class is explicitly *excluded* with
``API_EXCLUDE``, a stub entry for it will be included in the api data to just
show the inheritance relationship.

.. _pages/tool/generator/generator_default_jobs#api-data:

api-data
--------
Create the api data for the current library. This is included in the :ref:`api
<pages/tool/generator/generator_default_jobs#api>` job, but allows you to
re-generate the api data *.json* files for the classes without re-generating the
Apiviewer application as well. Moreover, you can supply class names as command
line arguments to only re-generate the api data for those:

::

    sh> generate.py api-data my.own.ClassA ...

Beware though that in such a case the tree information provided to the Apiviewer
(i.e. what you see in the Apiviewer's tree view on the left) is also restricted
to those classes (augmented by stubs for their ancestors for hierarchy
resolution). But this should be fine for developing API documentation for
specific classes.

.. _pages/tool/generator/generator_default_jobs#build:

build
-----
Create build version of current application.

.. _pages/tool/generator/generator_default_jobs#build-min:

build-min
---------
This job is available in the %{Website} skeleton.
Create minified build version of current application.

.. _pages/tool/generator/generator_default_jobs#build-module-all:

build-module-all
----------------
This job is available in the %{Website} skeleton. Instead of building a single
all-in-one qx.Website script file (see build_ and build-min_) this will build all
modules separately (%{Website} splitted in n files).

.. _pages/tool/generator/generator_default_jobs#build-module-all-min:

build-module-all-min
--------------------
This job is available in the %{Website} skeleton. Instead of building a single
all-in-one qx.Website script file (see build_ and build-min_) this will build all
modules separately (%{Website} splitted in n files) and minified.

.. _pages/tool/generator/generator_default_jobs#clean:

clean
-----
Remove local cache and generated .js files (source/build).

.. _pages/tool/generator/generator_default_jobs#dependencies:

compile-scss
------------
This job is available in the %{Mobile} skeleton. The *compile-scss* job
compiles SCSS files to CSS (See the article about :doc:`mobile theming
</pages/mobile/theming>`). The \*.scss files usually reside in your
application's ``source/theme/<name_space>/mobile/scss`` folder, and will be
compiled into the ``css`` sibling folder. This job is run automatically
during each ``source`` and ``build`` run. See watch-scss_ if you
want automatic compilations when changing the SCSS files.

dependencies
------------
Create dependency information for the current library which is stored as a Json
file (under *source/script/dependencies.json*). If this file exists and is
current, the Generator will use its information when following dependencies of
the classes of the library.

This is particularly interesting for libraries that are used in other
applications. It allows you to speed up cold-cache builds for the other
application. (Mind that it doesn't make much sense for the application itself,
as a *generate.py clean* or *distclean* will also wipe the dependencies Json file).

.. _pages/tool/generator/generator_default_jobs#distclean:

distclean
---------
Remove the cache and all generated artefacts of this library (source, build,
...).

.. _pages/tool/generator/generator_default_jobs#fix:

fix
---
Normalize whitespace in .js files of the current library (tabs, eol, ...).

.. _pages/tool/generator/generator_default_jobs#info:

info
----
Running this job will print out various information about your setup on the
console. Information includes your qooxdoo and Python version, whether source
and/or build version of your app has been built, stats on the cache, asf.

.. _pages/tool/generator/generator_default_jobs#inspector:

inspector
---------
Create an instance of the Inspector in the current application. The inspector is
a debugging tool that allows you to inspect your custom application while
running. You need to run the *source* job first, the run the *inspector* job.
You will then be able to open the file ``source/inspector.html`` in your
browser. The source version of your application will be loaded into the
inspector automatically.

.. _pages/tool/generator/generator_default_jobs#lint:

lint
----
Check the source code of the .js files of the current library.

.. _pages/tool/generator/generator_default_jobs#migration:

migration
---------
Migrate the .js files of the current library to the current qooxdoo version.


Running the migration job
^^^^^^^^^^^^^^^^^^^^^^^^^

Here is a sample run of the migration job:

::

    ./generate.py migration

::

    NOTE:    To apply only the necessary changes to your project, we
             need to know the qooxdoo version it currently works with.

    Please enter your current qooxdoo version [1.0] :

Enter your qooxdoo version or just hit return if you are using the version given
in square brackets.

::

    MIGRATION SUMMARY:

    Current qooxdoo version:   1.0
    Upgrade path:              1.0.1 -> 1.1 -> 1.2

    Affected Classes:
        feedreader.view.Header
        feedreader.view.Article
        feedreader.view.Tree
        feedreader.PreferenceWindow
        feedreader.view.ToolBar
        feedreader.FeedParser
        feedreader.view.Table
        feedreader.Application
        feedreader.test.DemoTest

    NOTE:    It is advised to do a 'generate.py distclean' before migrating any files.
             If you choose 'yes', a subprocess will be invoked to run distclean,
             and after completion you will be prompted if you want to
             continue with the migration. If you choose 'no', the distclean
             step will be skipped (which might result in potentially unnecessary
             files being migrated).

    Do you want to run 'distclean' now? [yes] :

Enter "yes".

::

    WARNING: The migration process will update the files in place. Please make
             sure, you have a backup of your project. The complete output of the
             migration process will be logged to 'migration.log'.

    Do you want to start the migration now? [no] :

Enter "yes".

Check ``migration.log`` for messages that contain *foo.js has been modified.
Storing modifications ...* to verify changes to class code.

.. _pages/tool/generator/generator_default_jobs#simulation-build:

simulation-build (deprecated)
-----------------------------
Creates a runner application (the :ref:`pages/development/simulator#simulator`)
for Selenium-based GUI interaction tests of the current library.

simulation-run (deprecated)
---------------------------
Starts Rhino and executes a :ref:`pages/development/simulator#simulator` test
application generated by ``simulation-build``.
The Simulator is configured using the ":ref:`pages/tool/generator/generator_config_ref#environment`" key of this job. The following settings are supported:

* **simulator.testBrowser** (String, default: ``*firefox3``)

  * A browser launcher as supported by Selenium RC (see the Selenium documentation for details).

* **simulator.autHost** (String, default: ``http://localhost``)

  * Protocol and host name that Selenium should use to access the application to be tested

* **simulator.autPath** (String, default: ``/<applicationName>/source/index.html``)

  * Server path of the tested application.

* **simulator.selServer** (String, default: ``localhost``)

  * Host name of the machine running the Selenium RC server instance to be used for the test.

* **simulator.selPort** (Integer, default: ``4444``)

  * Number of the port the Selenium RC server is listening on

* **simulator.globalErrorLogging** (Boolean, default: ``false``)

  * Log uncaught exceptions in the AUT.

* **simulator.testEvents** (Boolean, default: ``false``)

  * Activate AUT event testing support.

* **simulator.applicationLog** (Boolean, default: ``false``)

  * Capture the AUT's log output.

.. _pages/tool/generator/generator_default_jobs#simulation-run:

Additional runtime settings are configured using the
":ref:`pages/tool/generator/generator_config_ref#simulate`" key.

.. _pages/tool/generator/generator_default_jobs#pretty:

pretty
------
Pretty-formatting of the source code of the current library.

.. _pages/tool/generator/generator_default_jobs#source:

source
------
Create a source version of the application, using the original file path for
each class.

The source version of an application is tailored towards development activities.
It makes it easy to write code, run the application, test, debug and inspect the
application code, fix issues, add enhancements, and repeat.

With the *source* job all the classes of the application are in their original
source form, and their files are directly loaded from their original paths on
the file system. If you inspect your application in a JavaScript debugger like
Firebug or Chrome Developer Tools, you can identify each file individually, read
its code and comments, set breakpoints, inspect variables and so forth.

If you find yourself in a situation where you want to inspect more than your
current application's class files in the debugger (e.g. because you are
debugging another library along the way), this job is preferable.

You have to re-run this job  when you introduce new dependencies, e.g.  by
instantiating a class you haven't used before.  This changes the set of
necessary classes for your application, and the generator has to re-create the
corresponding loader.

There are two variants of the *source* job available which you might find
interesting.  One is called source-all_ and will include all available classes
of all involved libraries, the other is source-hybrid_ which improves loading
speed by concatenating some of the class code. See their respective entries.


.. _pages/tool/generator/generator_default_jobs#source-all:

source-all
----------
Create a source version of the application, with all classes.

*source-all* will include all known classes, be they part of your application,
the qooxdoo framework, or any other qooxdoo library or contribution you might be
using. All those classes are included in the build, whether they are currently
required or not. This allows you develop your code more freely as you don't have
to re-generate the application when introducing new dependencies to existing
classes. All classes are already there. You only have to re-run this job when
you add an entirely new class that you want to use.

The downside of this job is that due to the number of classes your application
is larger and loads slower in the browser, so it is a trade-off between
development speed and loading speed.


.. _pages/tool/generator/generator_default_jobs#source-hybrid:

source-hybrid
-------------
Create a source version of the application, concatenating some of the class code.

The *source-hybrid* job concatenates the contents of the classes that make up
the application into a few files, only leaving your own application classes
separate.  Having the other class files (framework, libraries, contribs) chunked
together you get the loading speed of nearly the build version, while at the
same time retaining the accessibility of your own application files for
debugging. This makes this job ideal for fast and focused development of the
application-specific classes.

Only the classes that are actually needed for the application are included, so
you have to re-run this job when you introduce new dependencies.

To review the three different source jobs, if you are just getting
started with qooxdoo development, use the source-all_ version, which is
the most convenient if you are not too impatient. If you are concerned
about loading speed during development, but don't mind hitting the up
and return keys in your shell window once in a while, go with the default
source-hybrid_ job. If your emphasis on the other hand is on
inspection, and you want to see exactly which class files get loaded
into your application and which code they provide, the source_ version
will be your choice.


.. _pages/tool/generator/generator_default_jobs#source-server:

source-server
--------------

*(experimental)*

Run a mini web server that serves the source version of an application. The web
server will export as document root a root path common to all libraries used by
the source version. This overcomes e.g. restrictions by modern browsers that do
not allow XHR requests over the *file://* protocol by default.

By default the server will randomly pick a free port on the local machine to run
at. You can assign it a fixed port by setting the :ref:`SOURCE_SERVER_PORT <pages/tool/generator/generator_config_macros#source_server_port>` macro, e.g. like ``generate.py source-server -m SOURCE_SERVER_PORT:44161``.


.. _pages/tool/generator/generator_default_jobs#source-server-reload:

source-server-reload
----------------------

*(experimental)*

Same as `source-server`_, but adds an automatic reload feature. The web server
watches the loader file of the exported source version (usually
*source/script/<application>.js*), and triggers an automatic reload of the
application in the browser if this changes. You usually want to use this job
together with the `watch`_ job (running separately) which automatically
re-generates the loader when the application classes change. This way, both jobs
work hand in hand to reload the most up-to-date version of the application in
the browser whenever the source files change. If the generation fails, e.g. due
to a syntax error, the loader is not updated and hence the browser not reloaded.

Like with *source-server* the server prints at startup the URL to the
application's index.html. If you want to load the application through the reload
server it is *important that you use exactly this URL in your browser* (including
the trailing ".../index.html"). On requesting this URL the reload server will instrument
the file with information necessary for the reload behavior.

The reload feature can also be used when running the main application from the
file system (with the *file://* protocol) or over a separate web server like
Apache. In this case you just have to manually add the URL of the reload client
script in the app's ``index.html``, e.g. adding

::

  <script type="text/javascript" src="http://localhost:44161/_active_reload/active_reload.js"/>

to the header section, assuming that ``44161`` is the port where the source
server runs on.  */_active_reload/active_reload.js* is the URL path to the reload
client script.  You then load the application over your standard web server.
Just the reload notification is handled over the source server.

.. _pages/tool/generator/generator_default_jobs#source-httpd-config:

source-httpd-config
---------------------

*(experimental)*

This job is similar in intent to the source-server_ job. But instead of starting
a dedicated web server, it will create a small web server configuration to be
used with an already existing web server on your machine. Various popular web
servers are supported (Apache, lighttpd, nginx) and it is usually
straight-forward to include the generated configuration file into the main
server/virtual host configuration. The file contains hints how to achieve that
for the given server implementation. You can tweak most of the settings involved
in the job (server type, server URL, ...), the config key behind it is
:ref:`pages/tool/generator/generator_config_ref#web-server-config`.

In this way the source version of your application is integrated with an
existing web server environment which comes in handy if you e.g. want to
interact with backend services that are already hosted on the same web server.

The generated configuration is actually template-driven so you can add your own
templates if your web server is not yet supported.


.. _pages/tool/generator/generator_default_jobs#test:

test
----
Create a test runner app for unit tests of the current library.

* Use the following macro to tailor the scope of classes in which unit test
  classes are searched for::

    "TEST_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

  The syntax for the class pattern is like those for the :ref:`include
  <pages/tool/generator/generator_config_ref#include>` config key.

* The libraries from the
  :ref:`pages/tool/generator/generator_default_jobs#libraries` job will be
  included when building the test application (the application containing your
  unit tests is a separate application which is loaded into the runner
  application).

* If you want to break out from the reliance on the *libraries* job altogether,
  or have very specific settings that must be applied to the test application, you
  can provide a custom includer job *common-tests* which may contain a custom
  *library* key and other keys. But then you have to make sure it contains the
  Testrunner library as well. ::

    "common-tests" :
    {
      "extend"    : [ "libraries" ],

      "let" :      { "LOCALES" : ["de", "de_DE", "fr", "fr_FR" ] },

      "library" :
      [
        { "manifest" : "${QOOXDOO_PATH}/framework/Manifest.json" },
        { "manifest" : "${TESTRUNNER_ROOT}/Manifest.json" }
      ],

      "include" : ["testrunner.TestLoader", "${TEST_INCLUDE}", "${QXTHEME}"],

      "environment" :
      {
        "qx.theme" : "${QXTHEME}",
        "qx.globalErrorHandling" : true
      },

      "cache" :
      {
        "compile" : "${CACHE}"
      }
    }

  This allows you to tailor most of the parameters that influence the creation
  of the test application.

.. _pages/tool/generator/generator_default_jobs#test-source:

test-source
-----------
Create a test runner app for unit tests (source version) of the current library.

The same customization interface applies as for the default
:ref:`pages/tool/generator/generator_default_jobs#test` job.

.. _pages/tool/generator/generator_default_jobs#translation:

translation
-----------
Create .po files for the current library.

.. _pages/tool/generator/generator_default_jobs#validate-config:

validate-config
---------------
Validates the Config (*config.json*) - and recursively all included Configs -
against a schema. If a jobname argument is given only this job map (within the
root Config) is checked.

This job helps especially with nested config keys, where a misconfiguration
might be silently disregarded by the Generator which eventually leads to
unexpected behaviour.

.. _pages/tool/generator/default_jobs_actions#validate-manifest:

validate-manifest
-----------------
Validates the *Manifest.json* against a schema.

Some entries in :doc:`Manifest </pages/tool/sdk/manifest>` files are
informational and therefore optional, others are required to successfully use
the current library with the Generator. The job is especially helpful for
developers of :doc:`contributions </pages/development/contrib>`, as those
require some extra keys.

.. _pages/tool/generator/default_jobs_actions#watch:

watch
-----
The *watch* job watches the *source/class* path of your application for changed
%{JS} files, and automatically runs the default Generator job (usually
*"source-hybrid"*) in case of a change. The config key behind it is
:ref:`pages/tool/generator/generator_config_ref#watch-files`.

When you run the job the process will starting telling you the path it is
watching, and will continue until you terminate it with Ctrl-C. On \*ix like
systems you can put the job in the shell's background with ``&``, in order to
get your shell prompt back. The job will continue running, and only produce some
console output when its associate command is being run. In order to terminate it
you have to bring it to the foreground again and then press Ctrl-C (Or you can
use a process manager to kill it).

The implementation uses a simple polling mechanism to detect file changes, the
check interval is configurable. There are technological alternatives that hook
into OS kernel events, but these approaches come with a certain overhead and are
more difficult to maintain cross-platform.

.. _pages/tool/generator/default_jobs_actions#watch-scss:

watch-scss
-----------
This job is available in the %{Mobile} skeleton. The *watch-scss* job watches
SCSS files, and compiles them to CSS once they change (See the article about
:doc:`mobile theming </pages/mobile/theming>`). The \*.scss files usually reside
in your application's ``source/theme/<name_space>/scss`` folder, and
will be compiled into ``source/resource<name_space>/css``.

