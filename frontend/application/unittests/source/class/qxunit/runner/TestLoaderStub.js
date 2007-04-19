
qx.Class.define("qxunit.runner.TestLoaderStub", {
  extend : qx.core.Object,

  type : "singleton",

  construct : function()
  {
    this.tests = [
      {
        classname : "qxunit.test.Xml",
        tests : [
          "serializeArray",
          "testParseSerializeXml",
          "testCreateDocument",
          "testXPath"
        ]
      },

      {
        classname : "qxunit.test.Lang",
        tests : [
          "testString",
          "testFormat",
          "testPad",
          "testAddRemovelistItem",
          "testAppend"
        ]
      }
    ];
  },

  members :
  {
    getTestDescriptions : function()
    {
      return this.tests;
    },

    runTests : function(testResult, className, methodName)
    {
      for (var i=0; i<this.tests.length; i++)
      {
        var testClass = this.tests[i];
        if (testClass.classname != className) {
          continue;
        }
        for (var j=0; j<testClass.tests.length; j++)
        {
          if (methodName && testClass.tests[j] != methodName) {
            continue;
          }
          var testFunction = function() {};
          var failTest = function() {
            throw new qxunit.AssertionError("Unknown error!", "Crazy error.");
          };
          var fcn = testClass.tests[j] == "testAddRemovelistItem" ? failTest : testFunction;
          var test = new qxunit.TestFunction(testClass, testClass.tests[j], fcn);
          test.run(testResult);
        }
      }
    }

  }

});