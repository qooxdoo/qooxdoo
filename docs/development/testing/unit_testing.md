# Unit Testing

qooxdoo comes with its own, nicely integrated unit testing environment.
While being similar to JSUnit, the solution that ships with the qooxdoo SDK does not require any
additional software.

## Writing a test class

```
qx.Class.define("MyApp.test.DemoTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */
  
    /**
     * Here are some simple tests
     */
    testSimple : function()
    {
      this.assertEquals(4, 3+1, "This should never fail!");
      this.assertFalse(false, "Can false be true?!");
    },

    /**
     * Here are some more advanced tests
     */
    testAdvanced: function () 
    {
      var a = 3;
      var b = a;
      this.assertIdentical(a, b, "A rose by any other name is still a rose");
      this.assertInRange(3, 1, 10, "You must be kidding, 3 can never be outside [1,10]!");
    }
  }
});
```

If you use `qx create` to create your app an example test class is generated for you!

## Preparing your application for browser tests
To run browser based test you have to

  - install testapper with `qx package install qooxdoo/qxl.testtapper --save=0`
  - prepare testapper application in your `compile.json` by adding your test namespace:
  
```
      "environment": {
        "testtapper.testNameSpace": "myapp.test"
      },
```	  

   - include your test classes

```	  
      "include": [
        "myapp.test.*"
      ],
```	  

   - write some tests:
```
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
   
   - run `qx test` and check result.

## Hints   

   - to run a single test you can use `qx test --class myapp.test.MyTest --method testOne`
   

