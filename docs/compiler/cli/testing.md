# Testing of your application

Testing of your qooxdoo app can be done by the qooxdoo cli command `qx test`.
For this purpose you need to install one of the provided test plugins:
  - qooxdoo/qxl.testtapper: Runs units tests based on `qx.dev.unit.TestCase`

## Preparing your application

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
   
   