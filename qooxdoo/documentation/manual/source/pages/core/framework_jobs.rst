.. _pages/tool/framework_jobs#framework_jobs:

Framework Generator Jobs
************************

This page describes the jobs that are available in the framework. Mainly this is just a reference list with short descriptions of what the jobs do. To find out more about predefined jobs for custom applications, see the :doc:`/pages/tool/generator_default_jobs`.

.. _pages/tool/framework_jobs#action_jobs:

Framework Jobs
==============

These jobs can be invoked in the *framework/* directory with the generator, as ``generate.py <jobname>``.

.. _pages/tool/framework_jobs#api:

api
---
Create api doc for the framework. 

.. _pages/tool/framework_jobs#api-data:

api-data
--------
Create the api data for the framework. Can take individual class names as further arguments.

.. _pages/tool/framework_jobs#clean:

clean
-----
Remove local cache and generated .js files.

.. _pages/tool/framework_jobs#distclean:

distclean
---------
Remove the cache and all generated artefacts of the framework (api, test, ...).

.. _pages/tool/framework_jobs#fix:

fix
---
Normalize whitespace in .js files of the framework (tabs, eol, ...).

.. _pages/tool/framework_jobs#images:

images
------
Run the image clipping and combining of framework images.


.. _pages/tool/framework_jobs#lint:

lint
----
Check the source code of the frameworks .js files (except the tests).


.. _pages/tool/framework_jobs#lint-test:

lint-test
---------
Check the source code of the test .js files of the framework.

.. _pages/tool/framework_jobs#qxoo-build:

qxoo-build
----------
Creates a single file containing all the qooxdoo classes of the OO layer. This file can be used in non-browser environments.

.. _pages/tool/framework_jobs#qxoo-noopt:

qxoo-noopt
----------
A non-optimized version of :ref:`pages/tool/framework_jobs#qxoo-build`, for debugging.

.. _pages/tool/framework_jobs#test:

test
----
Create a test runner app for unit tests of the framework. 


.. _pages/tool/framework_jobs#test-source:

test-source
-----------
Create a test runner app for unit tests (source version) of the framework.


.. _pages/tool/framework_jobs#test-inline:

test-inline
-----------
Create an inline test runner app for unit tests of the framewrok.


.. _pages/tool/framework_jobs#translation:

translation
-----------
Create the .po files of the framework.


