.. _pages/tool/generator_default_jobs#default_generator_jobs:

Generator Default Jobs
**********************

This page describes the jobs that are automatically available to all skeleton-based applications (particularly, applications with config.json files that include the framework's *application.json* config file). Mainly this is just a reference list with short descriptions of what the jobs do. But in some cases, there is comprehensive documentation about the interface of this job and how it can be parametrized (This would usually require changing your *config.json* configuration file).

.. _pages/tool/generator_default_jobs#action_jobs:

Action Jobs
===========

These jobs can be invoked with the generator, e.g. as ``generate.py <jobname>``.

.. _pages/tool/generator_default_jobs#api:

api
---
Create api doc for the current library. Use the following macros to tailor the scope of classes that are going to show up in the customized apiviewer application:

::

    "API_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]
    "API_EXCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

The syntax for the class pattern is like those for the :ref:`include <pages/tool/generator_config_ref#include>` config key.

Classes, which are not covered by ``API_INCLUDE``, are nevertheless included in the api data with their full class description *if* they are required for inheritance relationships (e.g. a class that is included derives from a class which is not). If such a required class is explicitly *excluded* with ``API_EXCLUDE``, a stub entry for it will be included in the api data to just show the inheritance relationship.

.. _pages/tool/generator_default_jobs#api-data:

api-data
--------
Create the api data for the current library. This is included in the :ref:`api <pages/tool/generator_default_jobs#api>` job, but allows you to re-generate the api data *.json* files for the classes without re-generating the Apiviewer application as well. Moreover, you can supply class names as command line arguments to only re-generate the api data for those:

::

    sh> generate.py api-data my.own.ClassA ...

Beware though that in such a case the tree information provided to the Apiviewer (i.e. what you see in the Apiviewer's tree view on the left) is also restricted to those classes (augmented by stubs for their ancestors for hierarchy resolution). But this should be fine for developing API documenation for specific classes.

.. _pages/tool/generator_default_jobs#build:

build
-----
Create build version of current application.

.. _pages/tool/generator_default_jobs#clean:

clean
-----
Remove local cache and generated .js files (source/build).

.. _pages/tool/generator_default_jobs#distclean:

distclean
---------
Remove the cache and all generated artefacts of this library (source, build, ...).

.. _pages/tool/generator_default_jobs#fix:

fix
---
Normalize whitespace in .js files of the current library (tabs, eol, ...).

.. _pages/tool/generator_default_jobs#info:

info
----
Running this job will print out various information about your setup on the console. Information includes your qooxdoo and Python version, whether source and/or build version of your app has been built, stats on the cache, asf.

.. _pages/tool/generator_default_jobs#inspector:

inspector
---------
Create an instance of the Inspector in the current application. The inspector is a debugging tool that allows you to inspect your custom application while running. You need to run the *source* job first, the run the *inspector* job. You will then be able to open the file ``source/inspector.html`` in your browser. The source version of your application will be loaded into the inspector automatically.

.. _pages/tool/generator_default_jobs#lint:

lint
----
Check the source code of the .js files of the current library.

.. _pages/tool/generator_default_jobs#migration:

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

Enter your qooxdoo version or just hit return if you are using the version given in square brackets.

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

Check ``migration.log`` for messages that contain *foo.js has been modified. Storing modifications ...* to verify changes to class code.

.. _pages/tool/generator_default_jobs#simulation-build:

simulation-build
----------------
Creates a runner application (the :ref:`pages/development/simulator#simulator`) for Selenium-based GUI interaction tests of the current library.

simulation-run
--------------
Starts Rhino and executes a :ref:`pages/development/simulator#simulator` test application generated by ``simulation-build``.
The Simulator is configured using the ":ref:`pages/tool/generator_config_ref#environment`" key of this job. The following settings are supported:

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

.. _pages/tool/generator_default_jobs#simulation-run:

Additional runtime settings are configured using the 
":ref:`pages/tool/generator_config_ref#simulate`" key.

.. _pages/tool/generator_default_jobs#pretty:

pretty
------
Pretty-formatting of the source code of the current library.

.. _pages/tool/generator_default_jobs#source:

source
------
Create a source version of the application, using the original file path for each class. 

The source version of an application is tailored towards development activities. It
makes it easy to write code, run the application, test, debug and
inspect the application code, fix issues, add enhancements, and repeat.

With the *source* job all the classes of the application are in their original source form, and their
files are directly loaded from their original paths on the file system. If you inspect your
application in a JavaScript debugger like Firebug or Chrome Developer Tools,
you can identify each file individually, read its code and comments, set
breakpoints, inspect variables and so forth.

If you find yourself in a situation where you want to inspect more than your current application's class files in the debugger (e.g. because you are debugging another library along the way), this job is preferable.

You have to re-run this job  when you introduce new dependencies, e.g.
by instantiating a class you haven't used before.  This changes the set of
necessary classes for your application, and the generator has to re-create the
corresponding loader. 

There are two variants of the *source* job available which you might find interesting.
One is called source-all_ and will include all available classes of all involved libraries, the other is source-hybrid_ which improves loading speed by concatenating some of the class code. See their respective entries.


.. _pages/tool/generator_default_jobs#source-all:

source-all
----------
Create a source version of the application, with all classes.

*source-all* will include all known classes, be they
part of your application, the qooxdoo framework, or any other qooxdoo
library or contribution you might be using. All those classes are
included in the build, whether they are currently required or not. This
allows you develop your code more freely as you don't have to
re-generate the application when introducing new dependencies to existing classes. All
classes are already there. You only have to re-run this job when you add an entirely new class that you want to use.

The downside of this job is that due to the
number of classes your application is larger and loads slower in the browser, so it is a
trade-off between development speed and loading speed. 


.. _pages/tool/generator_default_jobs#source-hybrid:

source-hybrid
-------------
Create a source version of the application, concatenating some of the class code.

The *source-hybrid* job concatenates the contents of the classes that make up
the application into a few files, only leaving your own application classes
separate.  Having the other class files (framework, libraries, contribs)
chunked together you get the loading speed of nearly the build
version, while at the same time retaining the accessibility of your own application files for debugging. This makes this job ideal for fast and focussed development of the application-specific classes. 

Only the classes that are actually needed for the application are included, so you have to re-run this job when you introduce new dependencies.

To review the three different source jobs, if you are just getting
started with qooxdoo development, use the source-all_ version, which is
the most convenient if you are not too impatient. If you are concerned
about loading speed during development, but don't mind hitting the up
and return keys in your shell window once in a while, go with the default
source-hybrid_ job. If your emphasis on the other hand is on
inspection, and you want to see exactly which class files get loaded
into your application and which code they provide, the source_ version
will be your choice.


.. _pages/tool/generator_default_jobs#test:

test
----
Create a test runner app for unit tests of the current library. 

* Use the following macro to tailor the scope of classes in which unit test classes are searched for::

    "TEST_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

  The syntax for the class pattern is like those for the :ref:`include <pages/tool/generator_config_ref#include>` config key.

* The libraries from the :ref:`pages/tool/generator_default_jobs#libraries` job will be included when building the test application (the application containing your unit tests is a separate application which is loaded into the runner application).

* If you want to break out from the reliance on the *libraries* job altogether, or have very specific settings that must be applied to the test application, you can provide a custom includer job *common-tests* which may contain a custom *library* key and other keys. But then you have to make sure it contains the Testrunner library as well. ::

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

  This allows you to tailor most of the parameters that influence the creation of the test application.

.. _pages/tool/generator_default_jobs#test-source:

test-source
-----------
Create a test runner app for unit tests (source version) of the current library.

The same customization interface applies as for the default :ref:`pages/tool/generator_default_jobs#test` job.

.. _pages/tool/generator_default_jobs#test-inline:

test-inline
-----------
Create an inline test runner app for unit tests of the current library.

The same customization interface applies as for the default :ref:`pages/tool/generator_default_jobs#test` job.

.. _pages/tool/generator_default_jobs#test-native:

test-native
-----------
Create a native test runner app for unit tests of the current library.

The same customization interface applies as for the default :ref:`pages/tool/generator_default_jobs#test` job.

.. _pages/tool/generator_default_jobs#translation:

translation
-----------
Create .po files for current library.

.. _pages/tool/generator_default_jobs#includer_jobs:

Includer Jobs
=============

These jobs don't do anything sensible on their own, so it is no use to invoke them with the generator. But they can be used in the application's ``config.json``, to modify the behaviour of other jobs, as they pick up their definitions.

.. _pages/tool/generator_default_jobs#common:

common
------

Common includer job for many default jobs, mostly used internally. You should usually not need to use it; if you do, use with care.

.. _pages/tool/generator_default_jobs#libraries:

libraries
---------
This job should take a single key, :ref:`library <pages/tool/generator_config_ref#library>`.  The *libraries* job is filled by default with your application and the qooxdoo framework library, plus any additional libraries you specify in a custom *libraries* job you added to your application's *config.json*. Here, you can add additional libraries and/or contributions you want to use in your application. See the linked reference for more information on the library key. Various other jobs will evaluate the *libraries* job (like :ref:`pages/tool/generator_default_jobs#api`, :ref:`pages/tool/generator_default_jobs#test`), to work on a common set of libraries.

::

    "libraries" :
    {
      "library" : [ { "manifest" : "some/other/lib/Manifest.json" }]
    }

.. _pages/tool/generator_default_jobs#profiling:

profiling
---------
Includer job, to activate profiling.

.. _pages/tool/generator_default_jobs#log-parts:

log-parts
---------
Includer job, to activate verbose logging of part generation; use with the ``-v`` command line switch.

.. _pages/tool/generator_default_jobs#log-dependencies:

log-dependencies
----------------
Includer job, to activate verbose logging of class dependencies; use with the ``-v`` command line switch.
