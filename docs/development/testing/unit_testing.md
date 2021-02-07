# Unit Testing

Qooxdoo comes with its own, nicely integrated
[Unit Testing](https://en.wikipedia.org/wiki/Unit_testing) environment, similar
to JSUnit and based on the
[Sinon library (v1.9.1)](https://sinonjs.org/releases/v1.17.7). See Qooxdoo's
[unit testing API](apps://apiviewer/#qx.dev.unit).

Unit Testing is best suited for isolated pieces of functionality without side
effects, such as libraries. If you want to test the business logic of your
application which involves change of application state, we recommend to use
Qooxdoo's [GUI Testing](gui_testing.md) infrastructure, which uses an external
testrunner.

## Writing a test class

```javascript
qx.Class.define("MyApp.test.DemoTest", {
  extend: qx.dev.unit.TestCase,

  members: {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */

    /**
     * Here are some simple tests
     */
    testSimple: function () {
      this.assertEquals(4, 3 + 1, "This should never fail!");
      this.assertFalse(false, "Can false be true?!");
    },

    /**
     * Here are some more advanced tests
     */
    testAdvanced: function () {
      var a = 3;
      var b = a;
      this.assertIdentical(a, b, "A rose by any other name is still a rose");
      this.assertInRange(
        3,
        1,
        10,
        "You must be kidding, 3 can never be outside [1,10]!"
      );
    }
  }
});
```

If you use `qx create` to create your app an example test class is generated for
you!

## Preparing your application for browser tests

To run browser based test you have to

- install testapper with `qx package install qooxdoo/qxl.testtapper --save=0`
- prepare testapper application in your `compile.json` by adding your test
  namespace:

```json
  "environment": {
    "testtapper.testNameSpace": "myapp.test"
  },
```

- include your test classes

```json
  "include": [
    "myapp.test.*"
  ],
```

- write some tests:

```javascript
qx.Class.define("myapp.test.MyTest",
{
  extend : qx.dev.unit.TestCase,
  members :
  {
    testOne : function() {
      this.assertTrue(1 === 1);
  }
});
```

## Mocking a server backend

If you want to test behavior of your application that depends on making HTTP
requests to a backend, you can use the built-in [Fake Server](fake_server.md) to
mock server responses.

## Running the tests

The unit tests can be run using the
[TestTapper application](https://github.com/qooxdoo/qxl.testtapper/blob/master/README.md)
, which you can easily install by executing
`npx qx package install --save=0 qooxdoo/qxl.testtapper`. (`--save=0` ensures
that this test runner is not registered as a permanent dependency of your
application).

- If you want to see the results of your tests in the browsers, execute
  `npx qx serve -S`. This will run the built-in server. Open the link that is
  printed to the console, which opens the Qooxdoo application server startpage.
  There, click on "TestTapper" to start the visual testrunner.
- To see the test results as output of a command line script (in the syntax of
  the [TAP protocol](https://node-tap.org/tap-protocol/)), execute
  `npx qx test`. This will run the server similarly to `npx qx serve`, and run
  the tests in a headless browser. To run a single test, you can use
  `qx test --class myapp.test.MyTest --method testOne`
