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
* Utilize the standard Selenium API and the qooxdoo user extensions
* Capture and log exceptions thrown in the tested application

How it works
------------

Similar to qooxdoo's unit testing framework, the Generator is used to create a test runner application (the Simulator). User-defined test classes (extending a common test case base class) are included into this application, which extends qx.application.Native and uses a simplified loader so it can run in Rhino.  
The test application 

Required libraries
------------------

The first step is to download the required external libraries: 
# `Selenium RC <http://seleniumhq.org/download/>`_
# `Mozilla Rhino <http://www.mozilla.org/rhino/download.html>`_
# TODO: Simulator user extensions

The Simulator is known to work with Selenium RC versions 1.0.3 and 2.0 a5 and Rhino 1.7R2.

Generator Configuration
-----------------------

The "simulation-build" and "simulation-run" jobs are responsible for building the test application and launching the test suite, respectively. By shadowing these job in your application's config.json you can set the necessary configuration options. 
The "settings" section of the "simulation-build " job tells the Simulator where the application under test (AUT) is located and how to test it. 
The "simulate" section of the "simulation-run" job provides environment settings needed to run the tests.
An example:

::

    "simulation-build" :
    {
      "qx.simulation.autHost" : "http://localhost",
      "qx.simulation.autPath" : "/${APPLICATION}/source/index.html"
    },
  
    "simulation-run" :
    {
      "simulate" : 
      {
        "java-classpath" : "/library/path/selenium-java-client-driver.jar;/library/path/js.jar"
      }
    }

Here is a list of all supported options and their meaning:

"settings" Key
==============
* **qx.simulation.testBrowser** (String, default: ``*firefox3``): A browser launcher as supported by Selenium RC (see the Selenium documentation for details)
* **qx.simulation.autHost** (String, default: ``http://localhost``): Protocol and host name by which the application can be accessed
* **qx.simulation.autPath** (String, default: ``<applicationName>/source/index.html``): Path of the tested application
* **qx.simulation.selServer** (String, default: ``localhost``): Host name of the Selenium RC server to be used for the test
* **qx.simulation.selPort** (Integer, default: ``4444``): The Selenium RC server's port number
* **qx.simulation.globalErrorLogging** (Boolean, default: ``false``): Log uncaught exceptions in the AUT (see TODO:LINK Special Features)
* **qx.simulation.testEvents** (Boolean, default: ``false``): Activate AUT event testing support (see TODO:LINK Special Features)
* **qx.simulation.applicationLog** (Boolean, default: ``false``) : Capture the AUT's log messages (see TODO:LINK Special Features)

"simulate" Key
==============
* **java-classpath** (String, default: ``${SIMULATOR_ROOT}/tool/js.jar:${SIMULATOR_ROOT}/tool/selenium-java-client-driver.jar``): Java classpath argument for the Rhino application 
* **rhino-class** (String, default: ``org.mozilla.javascript.tools.shell.Main``): The Rhino class that should run the test code. Use ``org.mozilla.javascript.tools.debugger.Main`` to run the test application in Rhino's debugging tool
* **simulator-script** (String, default: ``${BUILD_PATH}/script/simulator.js``): The path of the generated Simulator application


Writing Test Cases
------------------
TODOC

Starting the Selenium RC server
-------------------------------
TODOC

Running the Tests
------------------
TODOC


