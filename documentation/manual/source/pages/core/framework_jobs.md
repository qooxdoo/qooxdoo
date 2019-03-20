Framework Generator Jobs
========================

This page describes the jobs that are available in the framework. Mainly this is just a reference list with short descriptions of what the jobs do. To find out more about predefined jobs for custom applications, see the pages/tool\#references.

Framework Jobs
--------------

These jobs can be invoked in the *framework/* directory with the generator, as `generate.py <jobname>`.

### api

Create api doc for the framework.

### api-data

Create the api data for the framework. Can take individual class names as further arguments.

### clean

Remove local cache and generated .js files.

### distclean

Remove the cache and all generated artefacts of the framework (api, test, ...).

### fix

Normalize whitespace in .js files of the framework (tabs, eol, ...).

### images

Run the image clipping and combining of framework images.

### lint

Check the source code of the frameworks .js files (except the tests).

### lint-test

Check the source code of the test .js files of the framework.

### test

Create a test runner app for unit tests of the framework.

### test-source

Create a test runner app for unit tests (source version) of the framework.

### test-inline

Create an inline test runner app for unit tests of the framework.

### translation

Create the .po files of the framework.
