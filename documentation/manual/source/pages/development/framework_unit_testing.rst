.. _pages/framework_unit_testing#framework_unit_testing:

Framework Unit Testing
**********************

This page is about creating unit tests for the qooxdoo framework classes. It is a developer's notebook to collect ideas and approaches to create working unit tests and a good test coverage for the framework.

Currently, it is just a list of notes:

  * With 1.2 the framework's unit test classes are part of the framework class library, under the ``qx.test.*`` name space.
  * The existing tests cover only a portion of the framework classes.
  * The potential to create a unit test for any given framework class largely depends on the level of sophistication the test should have, which condition it tests and what is considered correctness:
    * on the simplest level, a test could just run through the methods of a class and invoke them; test success is defined by the absence of runtime errors (exceptions etc.). This is sometimes called ``smoke testing``.
    * on more sophisticated levels, correctness can be defined by return values, changes of system state, manipulations of the underlying DOM, up to GUI changes in the browser. Obviously, with each level it's get harder to test and/or check the correctness.
  * Currently, we'd rather have a large test coverage with simple tests, than have sophisticated tests for only a few classes. The test sophistication level can then be increased individually step by step.
  * The **event** system should be black-box (API) testable, but there are currently only few tests written (?).
  * **io.Remote** could be tested with a suitable server backend running in the test environment
  * The **DOM/BOM** layer is black-box testable and there is acceptable test coverage
  * The **layout** system should be black-box testable.
  * The core **Widget** class should be black-box testable.
  * Higher-level **GUI widgets** are difficult to black-box test, since they require user and GUI interaction (?). Selenium RC could be used here, but requires additional environment setup.
  * Maybe we can come up with a good classification of the framework classes, and how each class can and should be tested.
  * Automated GUI tests depend on synthetic events being generated. Selenium can do this. Other possibilities?
  * The Testrunner application is a nice GUI tool for interactive testing, but for automated/continuous-integration testing we need a (nearly)non-GUI test frame.

