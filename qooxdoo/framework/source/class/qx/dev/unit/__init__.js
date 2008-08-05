/**
 * The classes in this package provide an interface to qooxdoo's unit test
 * framework. Using these classes you will be able to utilize the 'make test'
 * build target of your skeleton based application. Invoking this target the
 * build process will generate a test application that automatically detects
 * your test classes and exposes them in a TestRunner-like GUI.
 *
 * In order to achieve this, you have to follow these steps:
 * * Add test classes to your application. Those test classes have to comply
 *   with the following constraints:
 *   * They have to be in the namespace of your application
 *   * They have to inherit from *qx.dev.unit.TestCase*
 *   * They have to define member functions with names starting with test*; these
 *     methods will be available as individual tests
 *   * Apart from that you are free to add other member functions, properties
 *     etc., and to instantiate other classes to your own content. But you will
 *     usually want to instantiate classes of your current application and invoke
 *     their methods in the test functions.
 *   * To communicate the test results back to the TestRunner framework
 *     exceptions are used. No exception means the test went fine, throwing an
 *     exception from the test method signals a failure. Return values from the
 *     test methods are not evaluated. To model your test method behaviour, you
 *     can use the methods inherited from qx.dev.unit.TestCase which encapsulate
 *     exceptions in the form of assertions:
 *     * <b>assert, assertFalse, assertEquals, assertNumber</b>, ... - These functions
 *       take values which are compared (either among each other or to some
 *       predefined value) and a message string, and raise an exception if the
 *       comparison fails.
 *     * A similar list of methods of the form <b>assert*DebugOn</b> is available,
 *       which are only evaluated if the debug variant qx.debug is on (see
 *       Variants).
 *     * See the documentation for the {@link qx.dev.unit.TestCase} class for more
 *       information on the available assertions.
 *  * Run *make test* from the directory of your application Makefile. This will
 *    generate the appropriate test application for you, which will be available
 *    in the subfolder test as test/index.html. Open this file in your browser and
 *    run your tests.
 */
