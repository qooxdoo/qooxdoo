/**
 * The classes in this package provide an interface to
 * qooxdoo's unit test framework. In order to create unit
 * tests for your application, you have to follow these steps:
 *
 *  - Add test classes to your application. Those test classes have to comply
 *    with the following constraints:
 *
 *    - They have to be in the namespace of your application, preferrably in a
 *      namespace ending in ".test"
 *
 *    - They have to inherit from {@link qx.dev.unit.TestCase}
 *
 *    - They have to define member functions with names starting with test*;
 *      these methods will be available as individual tests
 *
 *  - Apart from that you are free to add other member functions,
 *    properties etc., and to instantiate other classes to your own
 *    content. But you will usually want to instantiate classes of your
 *    current application and invoke their methods in the test functions.
 *
 *  - To communicate the test results back to the TestRunner framework
 *    exceptions are used. No exception means the test went fine, throwing
 *    an exception from the test method signals a failure. Return values from
 *    the test methods are not evaluated. To model your test method behaviour,
 *    you can use the methods inherited from {@link qx.dev.unit.TestCase}
 *    which encapsulate exceptions in the form of assertions. These
 *    functions take values which are compared (either among each other
 *    or to  some predefined value) and a message string, and raise an
 *    exception if the comparison fails. See the documentation for {@link
 *    qx.dev.unit.TestCase} for more information on the available assertions.
 *
 * Please refer to the
 * [documentation](https://qooxdoo.org/docs/#/development/testing/unit_testing)
 * to see how to run your tests.
 *
 */
