.. _pages/development/simulator#simulator:

Simulator (Experimental)
************************

Overview
--------

The purpose of the Simulator component is to help developers rapidly develop and run a suite of simulated user interaction tests for their application with a minimum amount of configuration and using familiar technologies, e.g. qooxdoo-style JavaScript.
To do so it uses a combination of qooxdoo's own toolchain, Mozilla's `Rhino <http://www.mozilla.org/rhino/>`_ JavaScript engine and `Selenium RC <http://seleniumhq.org/projects/remote-control/>`_.

.. note::

    The Simulator is a highly experimental feature; the API is by no means finalized. It is included in this qooxdoo release as a preview.    
    Also, the Simulator is *not* intended as a replacement for any existing automated test setup, e.g. using Selenium with JUnit. It is merely one of many ways to run Selenium tests on a qooxdoo application.

Feature Highlights
------------------

The Simulator enables developers to:

* Define Selenium test cases by writing qooxdoo classes
* Use the JUnit-style setUp, test*, tearDown pattern
* Define test jobs using the qooxdoo toolchain's configuration system
* Utilize the standard Selenium API and the qooxdoo user extensions to locate and interact with qooxdoo widgets
* Capture and log uncaught exceptions thrown in the tested application
* Use Selenium RC to run tests in `many different browser/platform combinations <http://seleniumhq.org/about/platforms.html#browsers>`_
* Write custom logger classes using qooxdoo's flexible logging system

How it works
------------

Similar to :ref:`unit tests <pages/unit_testing#unit_testing>`, Simulator test cases are defined as qooxdoo classes living in the application's source directory. As such they support qooxdoo's OO features such as inheritance and nested namespaces. The setUp, testSomething, tearDown pattern is supported, as well as all assertion functions defined by `qx.core.MAssert <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.MAssert>`_.

The main API that is used to define the test logic is **QxSelenium**, which means the `DefaultSelenium API <http://release.seleniumhq.org/selenium-remote-control/0.9.0/doc/java/>`_ plus the Locator strategies and commands from the `qooxdoo user extensions for Selenium <http://qooxdoo.org/contrib/project/simulator#selenium_user_extension_for_qooxdoo>`_.

As with qooxdoo's unit testing framework, the Generator is used to create a test runner application (the Simulator). User-defined test classes are included into this application, which extends `qx.application.Native <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native>`_ and uses a simplified loader so it can run in Rhino.

A separate Generator job is used to start Rhino and instruct it to load the Simulator application, which uses Selenium's Java API to send test commands to a Selenium RC server (over HTTP, so the server can run on a separate machine). The Server then launches the selected browser, loads the qooxdoo application to be tested and executes the commands specified in the test case.

Setting up the test environment
-------------------------------

The following sections describe the steps necessary to set up Simulator tests for an application based on qooxdoo's GUI or inline skeleton.

Required Libraries
==================

The Simulator needs the following external resources to run: 

* Java Runtime Environment: Version 1.6 is known to work 
* `Selenium RC <http://seleniumhq.org/download/>`_: The required components are selenium-server.jar and selenium-java-client-driver.jar. Versions 1.0 up to and including 2.0a5 are known to work.
* `Mozilla Rhino <http://www.mozilla.org/rhino/download.html>`_: Versions 1.7R1 and later.
* `Qooxdoo User Extensions for Selenium (user-extensions-qooxdoo.js) <http://qooxdoo.org/contrib/project/simulator>`_ from the Simulator contribution: Use the latest trunk version from SVN.

The Selenium Client Driver (selenium-java-client-driver.jar) and Rhino (js.jar) archives must be located on the same machine as the application to be tested.

The Selenium Server (selenium-server.jar) can optionally run on a physically separate host (see the Selenium RC documentation for details). The qooxdoo user extensions must be located on the same machine as the server.

.. note::

  The qooxdoo User Extensions for Selenium will be moved into the Simulator component for a future release so that it will no longer be necessary to download the file or check out the contribution repository.

Generator Configuration
=======================

Unlike other framework components, the Simulator isn't ready to run out of the box: The application developer needs to specify the location of the required external libraries (Selenium's Java Client Driver and Mozilla Rhino). This is easily accomplished by redefining the *SIMULATOR_CLASSPATH* macro (in the applicaton's config.json file):

::

    "let" :
    {
      "SIMULATOR_CLASSPATH" : ["../selenium/selenium-java-client-driver.jar", "../rhino/js.jar"]
    } 

Additional options are available, although their default settings should be fine for most cases. See the :ref:`simulate job key reference <pages/tool/generator_config_ref#simulate>` for details. 

The "settings" section of the "simulation-build" job configures where the AUT is located and how to reach the Selenium RC server that will launch the test browser and run the test commands.
The following example shows the minimum configuration needed to build a Simulator application that will test the source version of the current library in Firefox 3 using a Selenium RC server instance running on the same machine (localhost):

::

    "simulation-build" :
    {
      "settings" :
      {
        "simulator.testBrowser" : "*firefox3",
        "simulator.selServer" : "localhost",
        "simulator.selPort" : 4444,
        "simulator.autHost" : "http://localhost",
        "simulator.autPath" : "/${APPLICATION}/source/index.html"
      }
    }

See the :ref:`job reference <pages/tool/generator_default_jobs#simulation-build>` for a listing of all supported settings and their default values.

.. note::

    Since these settings are integrated into the Simulator application by qooxdoo's compile process, the simulation-build job **must** be run again whenever configuration settings were modified. Future versions of the Simulator will get rid of this limitation by using a more flexible configuration approach.


Writing Test Cases
------------------

The following articles describe the QxSelenium API in greater detail than can be covered here:

* `The qooxdoo user extensions for Selenium <http://qooxdoo.org/contrib/project/simulator/selenium-user-extension>`_
* `How to write qooxdoo tests with Selenium <http://qooxdoo.org/contrib/project/simulator/qooxdoo-tests-with-selenium>`_

Also, qooxdoo's :ref:`Inspector component <pages/application/inspector_selenium#using_the_qooxdoo_inspector_to_write_selenium_tests>` can provide assistance to test developers.

Generating the Simulator
------------------------
The "simulation-build" job explained above is used to generate the Simulator application (in the AUT's root directory):

.. note::

  generate.py simulation-build

Starting the Selenium RC server
-------------------------------

The Selenium RC server must be started with the *-userExtensions* command line option pointing to the qooxdoo user extenions for Selenium mentioned above:

::

  java -jar selenium-server.jar -userExtensions ../some/path/user-extensions.js
  
Note that the user extension file **must** be named *user-extensions.js*.

Running the Tests
-------------------------------

Once the Simulator application is configured and compiled and the Selenium RC server is running, the test suite can be executed using the "simulation-run" job:

::

  generate.py simulation-run

The Simulator's default logger writes the result of each test to the shell as it's executed. The full output looks something like this:

::

  ============================================================================
      EXECUTING: SIMULATION-RUN
  ============================================================================
  >>> Initializing cache...
  >>> Running Simulation...
  >>> Load runtime: 360ms
  >>> Simulator run on Thu, 02 Dec 2010 15:57:30 GMT
  >>> Application under test: http://localhost/~dwagner/workspace/myApplication/source/index.html
  >>> Platform: Linux
  >>> User agent: Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.9.2.12) Gecko/20101026 Firefox/3.6.12
  >>> PASS  myapplication.simulation.DemoSimulation:testButtonPresent
  >>> PASS  myapplication.simulation.DemoSimulation:testButtonClick
  >>> Main runtime: 11476ms
  >>> Finalize runtime: 0ms
  >>> Done
