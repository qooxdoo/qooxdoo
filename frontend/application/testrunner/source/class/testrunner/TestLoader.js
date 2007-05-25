/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)

#resource(data:data)
#embed(testrunner.data/*)

************************************************************************ */

qx.Class.define("testrunner.TestLoader", {

  extend: qx.application.Gui,

  construct : function()
  {
    this.base(arguments);

    // Define alias for custom resource path
    qx.io.Alias.getInstance().add("testrunner", qx.core.Setting.get("testrunner.resourceUri"));
  },


  settings : {
    "testrunner.resourceUri" : "./resource"
  },


  statics :
  {
    getInstance : function()
    {
      return this.instance;
    }
  },


  properties :
  {
    suite :
    {
      check : "testrunner.TestSuite",
      nullable : true
    }
  },


  members :
  {
    main : function()
    {
      this.base(arguments);
      testrunner.TestLoader.instance = this;

      this.setTestNamespace(this.__getClassNameFromUrl());

      if (window.top.jsUnitTestSuite) {
        this.runJsUnit();
        return;
      }

      if (window == window.top)
      {
        this.runStandAlone();
        return;
      }
    },


    __getClassNameFromUrl : function()
    {
      var params = window.location.search;
      var className = params.match(/[\?&]testclass=([A-Za-z0-9_\.]+)/);
      if (className) {
        className = className[1]
      } else {
        className = "__unknown_class__";
      }
      return className;
    },


    setTestNamespace : function(namespace)
    {
      var suite = new testrunner.TestSuite();
      suite.add(namespace);
      this.setSuite(suite);
    },


    runJsUnit : function()
    {
      var testResult = new testrunner.JsUnitTestResult();
      this.getSuite().run(testResult);
      testResult.exportToJsUnit();
    },


    runStandAlone : function()
    {
      console.log(this.getTestDescriptions());

      var testResult = new testrunner.TestResult();
      testResult.addEventListener("failure", function(e) {
        var ex = e.getData().exception;
        var test = e.getData().test;
        this.error("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
        this.error("Stack trace: " + ex.getStackTrace().join("\n"));
      });
      testResult.addEventListener("error", function(e) {
        var ex = e.getData().exception
        this.error("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
      });
      this.getSuite().run(testResult);
    },


    getTestDescriptions : function()
    {
      var desc = [];
      var classes = this.getSuite().getTestClasses();
      for (var i=0; i<classes.length; i++)
      {
        var cls = classes[i];
        var clsDesc = {};
        clsDesc.classname = cls.getName();
        clsDesc.tests = [];
        var methods = cls.getTestMethods();
        for (var j=0; j<methods.length; j++)
        {
          clsDesc.tests.push(methods[j].getName());
        }
        desc.push(clsDesc);
      }
      return qx.io.Json.stringify(desc);
    },


    runTests : function(testResult, className, methodName)
    {
      var classes = this.getSuite().getTestClasses();
      for (var i=0; i<classes.length; i++)
      {
        if (className == classes[i].getName())
        {
          var methods = classes[i].getTestMethods();
          for (var j=0; j<methods.length; j++)
          {
            if (methodName && methods[j].getName() != methodName) {
              continue;
            }
            methods[j].run(testResult);
          }
          return;
        }
      }
    },


    runTestsFromNamespace : function(testResult, namespaceName)
    {
      var classes = this.getSuite().getTestClasses();
      for (var i=0; i<classes.length; i++)
      {
        if (classes[i].getName().indexOf(namespaceName) == 0)
        {
          classes[i].run(testResult);
        }
      }
    }


  }

});