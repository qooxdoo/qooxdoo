.. _pages/frame_apps_testrunner#the_qooxdoo_test_runner:

The qooxdoo Test Runner
***********************

"Test Runner" is a `unit testing <http://en.wikipedia.org/wiki/Unit_test>`_ framework that fully supports testing qooxdoo classes. It is similar to but does not require JSUnit or any other JavaScript unit testing framework. If you look at the component section of a qooxdoo distribution under ``component/testrunner/``, you will find the Test Runner sources, together with a mockup test class. In the ``framework/`` section you can create a Test Runner instance with all test classes from the qooxdoo framework by running:

::

    ./generate.py test

Test Runner provides a convenient interface to test classes that have been written to that end. You can run single tests, or run a whole suite of them at once.

.. image:: /pages/_static/testrunner.png
   :width: 270 px
   :height: 203 px
   :target: ../../_images/testrunner.png

.. note::

    See the Test Runner in action in the `online demo <http://demo.qooxdoo.org/%{version}/testrunner/>`_. 

The Test Runner framework can also be deployed for *your own* application. It provides a GUI, a layer of infrastructure and a certain interface for arbitrary test classes. So now you can write your own test classes and take advantage of the Test Runner environment.

.. _pages/frame_apps_testrunner#how_to_deploy_test_runner_for_your_own_development:

How to deploy Test Runner for your own development
==================================================

This section assumes that your qooxdoo application bears on the structure of the qooxdoo :ref:`skeleton <pages/getting_started/helloworld#create_your_application>` application. Then this is what you have to do:

.. _pages/frame_apps_testrunner#writing_test_classes:

Writing Test Classes
--------------------

* You have to code test classes that perform the individual tests. These test classes have to comply to the following constraints:

  * They have to be within the name space of your application.
  * They have to be derived from ``qx.dev.unit.TestCase``.
  * They have to define member functions with names starting with ``test*``. These methods will be available as individual tests.
  * Apart from that you are free to add other member functions, properties etc., and to instantiate other classes to your own content. But you will usually want to instantiate classes of your current application and invoke their methods in the test functions.
  * In order to communicate the test results back to the Test Runner framework exceptions are used. No exception means the test went fine, throwing an exception from the test method signals a failure. Return values from the test methods are not evaluated.
  * To model your test method behaviour, you can use the methods inherited from ``qx.dev.unit.TestCase`` which encapsulate exceptions in the form of assertions:

    * ``assert``, ``assertFalse``, ``assertEquals``, ``assertNumber``, ... - These functions take values which are compared (either among each other or to some predefined value) and a message string, and raise an exception if the comparison fails.
    * A similar list of methods of the form ``assert*DebugOn`` is available, which are only evaluated if the debug variant ``qx.debug`` is on (see :doc:`Variants <variants>`). 
    * See the documentation for the `qx.dev.unit.TestCase <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.dev.unit.TestCase>`_ class for more information on the available assertions.

.. _pages/frame_apps_testrunner#generic_setup_teardown:

Generic setUp and tearDown
^^^^^^^^^^^^^^^^^^^^^^^^^^
Test classes can optionally define a ``setUp`` method. This is used to initialize common objects needed by some or all of the tests in the class. Since ``setUp`` is executed before each test, it helps to ensure that each test function runs in a "clean" environment.
Similarly, a method named ``tearDown`` will be executed after each test, e.g. to dispose any objects created by ``setUp`` or the test itself.

.. _pages/frame_apps_testrunner#specific_teardown:

Specific tearDown
^^^^^^^^^^^^^^^^^
For cases where the generic class-wide ``tearDown`` isn't enough, methods using the naming convention ``tearDown<TestFunctionName>`` can be defined. A method named e.g. ``tearDownTestFoo`` would be called after ``testFoo`` and the generic ``tearDown`` of the class were executed.

.. _pages/frame_apps_testrunner#asynchronous_tests:

Asynchronous Tests
^^^^^^^^^^^^^^^^^^
Starting with qooxdoo 0.8.2, the unit testing framework supports asynchronous tests. This enables testing for methods that aren't called directly, such as event handlers:

* Test classes inheriting from ``qx.dev.unit.TestCase`` have a ``wait()`` method that stops the test's execution and sets a timeout. ``wait()`` should always be the last function to be called in a test since any code following it is ignored. ``wait()`` has two optional arguments: The **amount of time to wait** in milliseconds (defaults to 5000) and a **function to be executed** when the timeout is reached. If no function is specified, reaching the timeout will cause an exception to be thrown and the test to fail.
* The ``resume()`` method is used to (surprise!) resume a waiting test. It takes two arguments, a **function to be executed** when the test is resumed, typically containing assertions, and the object context it should be executed in.

Here's an example: In our test, we want to send an AJAX request to the local web server, then assert if the response is what we expect it to be.

::

    testAjaxRequest : function()
    {
      var request = new qx.io.remote.Request("/myWebApp/index.html");
      request.addListener("completed", function (e) {
        this.resume(function() {
          this.assertEquals(200, e.getStatusCode());
        }, this);
      }, this);
      request.send();

      this.wait(10000);
    }

.. _pages/frame_apps_testrunner#create_the_test_application:

Create the Test Application
---------------------------

* Run ``generate.py test`` from the top-level directory of your application. This will generate the appropriate test application for you, which will be available in the subfolder ``test`` as ``test/index.html``. Open this file in your browser and run your tests.
* Equally, you can invoke ``generate.py test-source``. This will generate the test application, but allows you to use the *source* version of your application to run the tests on. In doing so the test application links directly into the source tree of your application. This allows for `test-driven development <http://en.wikipedia.org/wiki/Test-driven_development>`_ where you simultaneously develop your source classes, the test classes and run the tests. All you need to do is to change the URL of the "test backend application" (the textfield in the upper middle of the TestRunner frame) from ``tests.html`` (which is the default) to ``tests-source.html``. (Caveat: If ``generate.py test-source`` is the first thing you do, you might get an error when TestRunner starts, since the default tests.html has not been built; just change the URL and continue). For example, the resulting URL will look something like this: 

  ::

    html/tests-source.html?testclass=<your_app_name> 

  After that, you just reload the backend application by hitting the reload button to the right to see and test your changes in the TestRunner.
* If you're working on an application based on qx.application.Native or qx.application.Inline (e.g. by starting with an Inline skeleton), you can run ``generate.py test-native`` or ``generate.py test-inline`` to create a test application of the same type as your actual application. The TestRunner's index file will be called ``index-native.html`` or ``index-inline.html``, respectively.

Test Runner 2 (Experimental)
****************************

As an alternative to the "regular" Test Runner GUI, test applications can be run in the new "testrunner2" component. This is a modular unit testing GUI that makes use of framework features such as data binding that were introduced after the original Test Runner was created.
Its main advantage is separation of logic and UI so that specialized views for different use cases can be created, such as a lightweight HTML GUI for use on mobile devices, or a "headless" UI for server-side tests running in Rhino or node.js. 

Test Runner 2 is designed to be fully backwards compatible with existing unit test suites. At any time, developers can switch between the old an new runners using the ``TESTRUNNER_TYPE`` configuration macro. This can be defined in an application's config.json file or on the command line: 

::

    generate.py test -m TESTRUNNER_TYPE:testrunner2

The generated files and directories use the same names as the original Test Runner.

Defining Test Requirements
==========================

Test Requirements are a new feature only supported by Test Runner 2. Basically, they are conditions that must be met before a test can be run. For example, a test might rely on the application having been loaded over HTTPS and would give false results otherwise.
Requirements are defined for individual tests; if one or more aren't satisfied, the test code won't be executed and the test will be marked as "skipped" in Test Runner 2's results list.

Using Requirements
---------------------

The make use of the requirements feature, test classes must include the `MRequirements mixin <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.dev.unit.MRequirements>`_.
The mixin defines a method ``require`` that takes an array of strings: The requirement IDs. This method is called from a test function **before** the actual logic of the test, e.g.:

::

    testSslRequest : function()
    {
      this.require(["ssl"]);
      // test code goes here
    }
    
``require`` then searches the current test instance for a method that verifies the listed requirements: The naming convention is "has" + the requirement ID with the first letter capitalized, e.g. ``hasSsl``. This method is the called with the requirement ID as the only parameter. If it returns ``true``, the test code will be executed. Otherwise a `RequirementError <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.dev.unit.RequirementError>`_ is thrown. Test Runner 2 will catch these and mark the test as "skipped" in the results list. Any test code after the ``require`` call will not be executed.

In addition to the verification methods in MRequirements, test developers can define their own right in the test class.