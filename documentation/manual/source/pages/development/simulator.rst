.. _pages/development/simulator#simulator:

Simulator
*********

Overview
--------

The purpose of the Simulator component is to help developers rapidly develop and run a suite of simulated user interaction tests for their application with a minimum amount of configuration and using familiar technologies, e.g. qooxdoo-style JavaScript.
To do so it uses a combination of qooxdoo's own toolchain, Mozilla's `Rhino <http://www.mozilla.org/rhino/>`_ JavaScript engine and `Selenium Remote Control <http://seleniumhq.org/projects/remote-control/>`_.

Feature Highlights
------------------

The Simulator enables developers to:

* Define Selenium test cases by writing qooxdoo classes
* Use the JUnit-style setUp, test*, tearDown pattern
* Define test jobs using the qooxdoo toolchain's configuration system
* Utilize the standard Selenium API as well as qooxdoo-specific user extensions to locate and interact with qooxdoo widgets
* Capture and log uncaught exceptions thrown in the tested application
* Use Selenium Server to run tests in `many different browser/platform combinations <http://seleniumhq.org/about/platforms.html#browsers>`_
* Write custom log appenders using qooxdoo's flexible logging system

How it works
------------

Similar to :ref:`unit tests <pages/unit_testing#unit_testing>`, Simulator test cases are defined as qooxdoo classes living in the application's source directory. As such they support qooxdoo's OO features such as inheritance and nested namespaces. The setUp, testSomething, tearDown pattern is supported, as well as all assertion functions defined by `qx.core.MAssert <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.core.MAssert>`_.

The main API that is used to define the test logic is **QxSelenium**, which means the `DefaultSelenium API <http://jarvana.com/jarvana/view/org/seleniumhq/selenium/selenium-rc-documentation/1.0/selenium-rc-documentation-1.0-doc.zip!/java/com/thoughtworks/selenium/DefaultSelenium.html>`_ plus the Locator strategies and commands from the `qooxdoo user extensions for Selenium <http://qooxdoo.org/contrib/project/simulator#selenium_user_extension_for_qooxdoo>`_.

As with qooxdoo's unit testing framework, the Generator is used to create a test runner application (the Simulator). User-defined test classes are included into this application, which extends `qx.application.Native <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native>`_ and uses a simplified loader so it can run in Rhino.

A separate Generator job is used to start Rhino and instruct it to load the Simulator application, which uses Selenium's Java API to send test commands to a Selenium server (over HTTP, so the server can run on a separate machine). The Server then launches the selected browser, loads the qooxdoo application to be tested and executes the commands specified in the test case.

.. _pages/development/simulator#setup:

Setting up the test environment
-------------------------------

The following sections describe the steps necessary to set up Simulator tests for an application based on qooxdoo's GUI or Inline skeleton.

Required Libraries
==================

The Simulator needs the following external resources to run: 

* Java Runtime Environment: Version 1.6 is known to work.
* `Selenium Server and Java Client Driver <http://seleniumhq.org/download>`_: Version 1.0.3  or later. Later versions should generally be OK as long as the Selenium API remains stable.
* `Mozilla Rhino <http://www.mozilla.org/rhino/download.html>`_: Version 1.7R1 or later.

The Java archives for the Selenium client driver and Rhino must be located on the same machine as the application to be tested. For Rhino, this means js.jar. Older versions of Selenium provide a single archive (selenium-java-client-driver.jar), while newer ones are split up into the actual driver (selenium-java-<x.y.z>.jar) and several external libraries found in the "libs" folder of the ZIP archive.

The Selenium Server (selenium-server.jar, or selenium-server-standalone.jar for newer releases) can optionally run on a physically separate host (see the Selenium RC documentation for details). The qooxdoo user extensions must be located on the same machine as the server (see below).


Generator Configuration
=======================

Unlike other framework components, the Simulator isn't ready to run out of the box: The application developer needs to specify the location of the required external libraries (Selenium's Java bindings and Mozilla Rhino). This is easily accomplished by redefining the *SIMULATOR_CLASSPATH* macro (in the applicaton's config.json file; be sure to heed the :ref:`general information about paths <pages/tool/generator_config_articles#path_names>` in config files):

::

    "let" :
    {
      "SIMULATOR_CLASSPATH" : 
      [
        "../selenium/selenium-java-2.22.0.jar",
        "../selenium/libs/*",
        "../rhino/js.jar"
      ]
    } 


The "environment" section of the "simulation-run" job configures where the AUT is located and how to reach the Selenium server that will launch the test browser and run the test commands.
The following example shows the minimum configuration needed to launch a Simulator application that will test the source version of the current application in Firefox 3 using a Selenium server instance running on the same machine (localhost):

::

    "simulation-run" :
    {
      "let" :
      {
        "SIMULATOR_CLASSPATH" :
        [
          "../selenium/selenium-java-2.22.0.jar",
          "../selenium/libs/*", 
          "../rhino/js.jar"
        ]
      },

      "environment" :
      {
        "simulator.testBrowser" : "*firefox",
        "simulator.selServer" : "localhost",
        "simulator.selPort" : 4444,
        "simulator.autHost" : "http://localhost",
        "simulator.autPath" : "/${APPLICATION}/source/index.html"
      }
    }

See the :ref:`job reference <pages/tool/generator_default_jobs#simulation-run>` for a listing of all supported settings and their default values.
Additional runtime options are available, although their default settings should be fine for most cases. See the :ref:`simulate job key reference <pages/tool/generator_config_ref#simulate>` for details.

.. _pages/development/simulator#writing_tests:

Writing Test Cases
------------------

As mentioned above, Simulator test cases are qooxdoo classes living (at least by default) in the application's **simulation** name space. 
They inherit from simulator.unit.TestCase, which includes the assertion functions from qx.core.MAssert. 
Simulator tests look very similar to qooxdoo unit tests as they follow the same pattern of **setUp**, **testSomething**, **tearDown**. Typically, each test* method will use the QxSelenium API to interact with some part of the AUT,
then use assertions to check if the AUT's state has changed as expected, e.g. by querying the value of a qooxdoo property.

.. _pages/development/simulator#locators:

Locating Elements
-----------------

In order to simulate interaction with a qooxdoo widget, Selenium needs to locate it first. This is accomplished by using one or more of the locator strategies described on this page:

* :ref:`Locating elements <pages/development/simulator_locators#simulator_locators>`

.. _pages/development/simulator#interaction:

Simulating Interaction
----------------------

In addition to Selenium's built-in commands, a number of qooxdoo-specific methods are available in the simulator.QxSelenium and simulator.Simulation classes. Run **generate.py api** in the *component/simulator* directory of the qooxdoo SDK to create an API Viewer for these classes.

.. _pages/development/simulator#tools:

Test Development Tools
----------------------

.. _pages/development/simulator#selenium_ide:

Selenium IDE
============

This Firefox plugin allows test developers to run Selenium commands against a web application, making it a very useful to debug locators and check if commands produce the expected results. In order to use Selenium IDE with the qooxdoo-specific locators and commands, open the Options menu and enter the path to the qooxdoo extensions for Selenium in the field labeled *Selenium Core extensions*, e.g.:

::

  C:\workspace\qooxdoo-1.4-sdk\component\simulator\tool\user-extensions\user-extensions.js
  
Inspector
=========

qooxdoo's :ref:`Inspector component <pages/application/inspector_selenium#using_the_qooxdoo_inspector_to_write_selenium_tests>` can provide assistance to test developers by automatically determining locators for widgets.

.. _pages/development/simulator#generating:

Generating the Simulator
------------------------
The "simulation-build" job explained above is used to generate the Simulator application (in the AUT's root directory):

::

  generate.py simulation-build

Note that the Simulator application contains the test classes. This means that it must be re-generated whenever existing tests are modified or new ones are added.

.. _pages/development/simulator#server_start:

Starting the Selenium server
----------------------------

The Selenium server must be started with the *-userExtensions* command line option pointing to the qooxdoo user extenions for Selenium mentioned above:

::

  java -jar selenium-server-standalone-2.22.0.jar -userExtensions <QOOXDOO-TRUNK>/component/simulator/tool/user-extensions/user-extensions.js

.. _pages/development/simulator#running_tests:

Running the Tests
-----------------

Once the Simulator application is configured and compiled and the Selenium server is running, the test suite can be executed using the "simulation-run" job:

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

.. _pages/development/simulator#platforms:

Testing multiple browser/OS combinations
----------------------------------------

General
=======

Since the Simulator uses Selenium RC to start the browser and run tests, the relevant sections from the `Selenium documentation <http://seleniumhq.org/docs/05_selenium_rc.html>`_ apply. Due to the special nature of qooxdoo applications, however, some browsers require additional configuration steps before they can be tested.

Firefox, Chrome
===============

Firefox and Chrome are generally well supported by Selenium, just make sure to use a Selenium version that isn't (much) older than the browser you intend to use for testing.

Internet Explorer 6, 7, 8 and 9
===============================

Starting the server
___________________

When testing with IE, the Selenium server **must** be started with the *-singleWindow* option so the AUT will be loaded in an iframe. This is deactivated by default so two separate windows are opened for Selenium and the AUT. IE restricts cross-window JavaScript object access, causing the tests to fail.

::

  java -jar selenium-server-standalone.jar -singleWindow -userExtension [...]


Launching the browser
_____________________

To launch IE, the *\*iexploreproxy* launcher should be used. The *\*iexplore* launcher starts the embedded version of IE which in some ways behaves differently from the full-blown browser.

::

  "simulation-run" :
  {
    "environment" :
    {
      "simulator.testBrowser" : "*iexploreproxy",
      [...]
    }
  }
  
