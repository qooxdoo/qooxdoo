.. _pages/tool/framework_jobs#framework_jobs:

Framework Generator Jobs
************************

This page describes the jobs that are available in the framework. Mainly this is just a reference list with short descriptions of what the jobs do.

.. _pages/tool/framework_jobs#action_jobs:

Action Jobs
===========

These jobs can be invoked with the generator, e.g. as ``generate.py <jobname>``.

.. _pages/tool/framework_jobs#api:

api
---
Create api doc for the framework. Use the following macros to tailor the scope of classes that are going to show up in the customized apiviewer application:

::

    "API_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]
    "API_EXCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

The syntax for the class pattern is like those for the :ref:`include <pages/tool/generator_config_ref#include>` config key.

.. _pages/tool/framework_jobs#api-data:

api-data
--------
Create the api data for the framework. This is included in the :ref:`api <pages/tool/framework_jobs#api>` job, but allows you to re-generate the api data *.json* files for the classes without re-generating the Apiviewer application as well. Moreover, you can supply class names as command line arguments to only re-generate the api data for those:

::

    sh> generate.py api-data my.own.ClassA ...

Beware though that in such a case the tree information provided to the Apiviewer (i.e. what you see in the Apiviewer's tree view on the left) is also restricted to those classes (augmented by stubs for their ancestors for hierarchy resolution). But this should be fine for developing API documenation for specific classes.

.. _pages/tool/framework_jobs#clean:

clean
-----
Remove local cache and generated .js files (source/build).

.. _pages/tool/framework_jobs#distclean:

distclean
---------
Remove the cache and all generated artefacts of the framework (source, build, ...).

.. _pages/tool/framework_jobs#fix:

fix
---
Normalize whitespace in .js files of the framework (tabs, eol, ...).

.. _pages/tool/framework_jobs#images:

images
------
Runs the image clipping and combining.


.. _pages/tool/framework_jobs#lint:

lint
----
Check the source code of the frameworks .js files without the tests.


.. _pages/tool/framework_jobs#lint-test:

lint-test
---------
Check the source code of the test .js files of the framework.

.. _pages/tool/framework_jobs#test:

test
----
Create a test runner app for unit tests of the framework. 

* Use the following macro to tailor the scope of classes in which unit test classes are searched for::

    "TEST_INCLUDE" = ["<class_patt1>", "<class_patt2>", ...]

  The syntax for the class pattern is like those for the :ref:`include <pages/tool/generator_config_ref#include>` config key.

* The libraries from the :ref:`pages/tool/framework_jobs#libraries` job will be included when building the test application (the application containing your unit tests is a separate application which is loaded into the runner application).

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

      "settings" :
      {
        "qx.theme" : "${QXTHEME}",
        "qx.globalErrorHandling" : "on"
      },

      "cache" :
      {
        "compile" : "${CACHE}"
      }
    }

  This allows you to tailor most of the parameters that influence the creation of the test application.

.. _pages/tool/framework_jobs#test-source:

test-source
-----------
Create a test runner app for unit tests (source version) of the framework.

The same customization interface applies as for the default :ref:`pages/tool/framework_jobs#test` job.

.. _pages/tool/framework_jobs#test-inline:

test-inline
-----------
Create an inline test runner app for unit tests of the framewrok.

The same customization interface applies as for the default :ref:`pages/tool/framework_jobs#test` job.

.. _pages/tool/framework_jobs#translation:

translation
-----------
Create .po files for framework.


.. _pages/tool/framework_jobs#build-qxoo:

build-qxoo
----------
Creates a single file containing all the qooxdoo classes of the OO layer. This file can be used in non browser environments.
