.. _pages/development/simulator#simulator:

Simulator
*********

Overview
--------

The purpose of the Simulator component is to help developers rapidly develop and run a suite of Selenium tests for their application with a minimum amount of configuration and using familiar technologies, e.g. qooxdoo-style JavaScript.
To do so it uses a combination of qooxdoo's own toolchain, Mozilla Rhino and Selenium RC.

.. note::

    The Simulator is a highly experimental feature; the API is by no means finalized. It is included in this qooxdoo release as a preview.    
    Also, the Simulator is *not* intended as a replacement for any existing test setup, e.g. using JUnit. It is merely one of many ways to run Selenium tests on a qooxdoo application.

Feature Highlights
------------------

* Write Selenium test cases as qooxdoo classes
* Use the JUnit-style setUp, test*, tearDown pattern
* Define test jobs using the qooxdoo toolchain's powerful configuration system
* Utilize the standard Selenium API and the qooxdoo user extensions to locate and interact with qooxdoo widgets
* Capture and log exceptions thrown in the tested application

How it works
------------

Similar to LINK unit tests, Simulator tests are defined are qooxdoo classes living in the application's source directory. As such they support qooxdoo's OO features such as inheritance and nested namespaces. The ``setUp, testSomething, tearDown`` pattern is supported, as well as all assertion functions defined by LINK qx.core.MAssert.

The main API that is used to define the test logic is QxSelenium, which means the LINK DefaultSelenium API plus the Locator strategies and commands from the LINK qooxdoo user extensions for Selenium.

Similar to qooxdoo's unit testing framework, the Generator is used to create a test runner application (the Simulator). User-defined test classes are included into this application, which extends qx.application.Native and uses a simplified loader so it can run in Rhino.  

A separate Generator job then runs the Simulation in Mozilla Rhino: The Selenium RC server loads the AUT in opened in the configured browser, tests are executed one by one and results are written to the Shell. 

Setting up the test environment
-------------------------------

Required Libraries
==================

The Simulator needs the following external resources to run: 
* Java Runtime Environment: Versions 1.5 and 1.6 are known to work 
* `Selenium RC <http://seleniumhq.org/download/>`_: The required components are selenium-server.jar and selenium-java-client-driver.jar. Versions 1.0 up to and including 2.0a5 have been tested successfully.
* `Mozilla Rhino <http://www.mozilla.org/rhino/download.html>`_: Version 1.7R1 and later.
* `Qooxdoo User Extensions for Selenium (user-extensions-qooxdoo.js) <http://qooxdoo.org/contrib/project/simulator>`_ from the Simulator contribution. Use the latest trunk version from SVN.

Generator Configuration
=======================

The "simulation-build" and "simulation-run" jobs are responsible for building the test application and launching the test suite, respectively. By shadowing these job in your application's config.json you can set the necessary configuration options. 

simulation-build
^^^^^^^^^^^^^^^^

The "settings" section of the "simulation-build" job tells the Simulator where the application under test (AUT) is located and how to test it.
The following example shows the minimum configuration needed to build a Simulator application that will test the source version of the current library in Firefox 3 using a Selenium RC server instance running on the same machine:

::

    "simulation-build" :
    {
      "settings" :
      {
        "qx.simulation.testBrowser" : "*firefox3",
        "qx.simulation.selServer" : "localhost",
        "qx.simulation.selPort" : 4444,
        "qx.simulation.autHost" : "http://localhost",
        "qx.simulation.autPath" : "/${APPLICATION}/source/index.html"
      }
    }

See the :ref:`job reference <pages/tool/generator_default_jobs#simulation-build>` for a listing of all supported settings and their default values.

simulation-build
^^^^^^^^^^^^^^^^

The "simulate" section of the "simulation-run" job provides environment settings needed to run the tests.
In most cases, it should only be necessary to configure the location of the Selenium Client Driver and Mozilla Rhino JAR files:

::

    "simulation-run" :
    {
      "simulate" : 
      {
        "java-classpath" : "/library/path/selenium-java-client-driver.jar;/library/path/js.jar"
      }
    }

See the :ref:`job reference <pages/tool/generator_default_jobs#simulation-run>` for a listing of all supported keys and their default values.

Writing Test Cases
==================
TODOC

Starting the Selenium RC server
===============================

The Selenium RC server can run on a separate machine from the one that hosts the AUT and runs the Simulator.

Running the Tests
=================

TODOC


