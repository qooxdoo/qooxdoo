/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * ************************************************************************/


/**
 * Application used for unit testing.  Note that this app may not always run, intentionally,
 * because the unit tests will enable and disable features to test the compiler output.
 *
 * @asset(testapp/*)
 * @asset(qx/test/script.js)
 * @asset(abc/def/myicon.gif)
 * @require(qx.io.remote.Rpc)
 * @require(testapp.WrongClassName)
 * @require(testapp.Issue153)
 */
qx.Class.define("testapp.Application", {
  extend: qx.application.Standalone,

  properties: {
    annoProperty: {
      "@": [new testapp.anno.MyAnno().set({name: "hello"})],
      "nullable": true,
      "check": "String"
    }
  },

  members: {
    /**
     * This method contains the initial application code and gets called during
     * startup of the application
     *
     * @lint ignoreDeprecated(alert)
     * @ignore(TEST_EXTERNAL)
     * @ignore(SCRIPT_LOADED)
     * @ignore(jQuery)
     */
    main: function () {
      // Call super class
      this.base(arguments);
      var envVarDefault1 = qx.core.Environment.get("test.someValue") || "default1";
      try {
        console.log(undefinedValue);
      }catch(ex) {
        console.log("Found intentionally uindefined value");
      }
      
      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug")) {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle
        // visibility
        qx.log.appender.Console;
      }

      /*
       * -------------------------------------------------------------------------
       * Below is your actual application code...
       * -------------------------------------------------------------------------
       */

      // Create a button
      var button1 = new qx.ui.form.Button("First Button", "testapp/test.png");

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(button1, {
        left: 100,
        top: 50
      });

      // Add an event listener
      button1.addListener("execute", function (e) {
        dialog.Dialog.alert("Hello World!");
      });

      if (qx.core.Environment.get("test.isFalse")) {
        /* ELIMINATION_FAILED */
      }
      if (!qx.core.Environment.get("test.isTrue")) {
        /* ELIMINATION_FAILED */
      }
      if (qx.core.Environment.get("test.isFalse") || !qx.core.Environment.get("test.isTrue")) {
        /* ELIMINATION_FAILED */
      }
      if (qx.core.Environment.get("test.overridden1")) {
        /* TEST_OVERRIDDEN_1 */
      }
      if (qx.core.Environment.get("test.overridden2")) {
        /* TEST_OVERRIDDEN_2 */
      }
      var appValue = qx.core.Environment.get("test.appValue");
      var envVar1 = qx.core.Environment.get("envVar1");
      var envVar2 = qx.core.Environment.get("envVar2");
      var envVar3 = qx.core.Environment.get("envVar3");
      var envVar4 = qx.core.Environment.get("envVar4");
      var runtimeVar = qx.core.Environment.get("runtimeVar");
      var envTestOverriden3 = qx.core.Environment.get("test.overridden3");
      var envTestOverriden4 = qx.core.Environment.get("test.overridden4");
      var envTestOverriden5 = qx.core.Environment.get("test.overridden5");
      var envVarSelect1 = qx.core.Environment.select("test.someValue", {
        "none": 0,
        "some": 1,
        "all": 2
      });
      var envVarSelect2 = qx.core.Environment.select("test.isTrue", {
        "true": 1,
        "false": 0
      });
      var envVarSelect3 = qx.core.Environment.select("test.isFalse", {
        "true": 1,
        "false": 0
      });
      var envVarDefault1 = qx.core.Environment.get("test.someValue") || "default1";
      var envVarDefault2 = qx.core.Environment.get("test.noValue") || "default2";

      var mergeStrings = "abc" + "def" + "ghi";
      var mergeStringsAndNumbers = "abc" + 23 + "def" + 45 + "ghi";
      var addNumbers = 123 + 4 + 5 + 6;
      var multiplyNumbers = 123 * 2 * 3 * 4;

      if (qx.core.Environment.get("qx.promise")) {
        console.log("Promises are enabled");
      }
      
      qx.core.Assert.assertTrue(this.tr("translatedString") == "en: translatedString");
      qx.core.Assert.assertTrue(this.tr("Call \"me\"") == "en: Call \"me\"");
      qx.core.Assert.assertTrue(this.tr("This has\nsome\nnewlines") == "en: This has\nsome\nnewlines");

      console.log(JSON.stringify({
        appValue, envVar1, envVar2, envVar3, envVar4,
        envVarSelect1, envVarSelect2, envVarSelect3,
        mergeStrings, mergeStringsAndNumbers, addNumbers, multiplyNumbers
      }, null, 2));

      qx.io.PartLoader.require(["pluginFramework", "pluginOne"], function () {
        this.debug("pluginOne loaded");
        var plugin = new testapp.plugins.PluginOne();
        console.log(plugin.sayHello());
      }, this);
      qx.io.PartLoader.require(["pluginFramework", "pluginTwo"], function () {
        this.debug("pluginTwo loaded");
        var plugin = new testapp.plugins.PluginTwo();
        console.log(plugin.sayHello());
      }, this);
      
      new testapp.test.TestInnerClasses().testInnerClasses();
      
      console.log("TestThat1.toHashCode() = " + (new testapp.TestThat1()).toHashCode());
      console.log("TestThat2.toHashCode() = " + (new testapp.TestThat2()).toHashCode());
      
      new testapp.Issue309();
      new testapp.Issue206();
      new testapp.Issue240();
      new testapp.Issue186();
      new testapp.Issue461().unusedDestructedArray();
      new testapp.Issue488();
      new testapp.Issue494();
      new testapp.Issue494PartTwo();
      new testapp.Issue495();
      new testapp.Issue500();
      new testapp.Issue503();
      new testapp.InnerEs6Classes();
      new testapp.Warnings1();
      
      qx.core.Assert.assertTrue(TEST_EXTERNAL === "loaded");
      qx.core.Assert.assertTrue(SCRIPT_LOADED === true);
      qx.core.Assert.assertTrue(typeof jQuery == "function");
      qx.core.Assert.assertTrue(qx.locale.Number.getDecimalSeparator("nl").toString() === ",");
      
      qx.core.Assert.assertTrue(qx.core.Environment.get("testappCompilerApi") === "two");
      qx.core.Assert.assertTrue(qx.core.Environment.get("testappLibraryApi") === "one");
      qx.core.Assert.assertTrue(qx.core.Environment.get("testlibCompilerApi") === undefined);
      qx.core.Assert.assertTrue(qx.core.Environment.get("testlibLibraryApi") === "one");
      
      const obj = {
          foo: {
            bar: {
              baz: 42,
            },
          },
        };

      qx.core.Assert.assertTrue(obj?.foo?.bar?.baz === 42);
      qx.core.Assert.assertTrue(obj?.qux?.baz === undefined);
      
      var abc = (<div>Hello World</div>);
    },

    undocumentedMethod: function () {
      return 1;
    },

    /**
     * Does important stuff
     *
     * @param abc {String} a string goes here
     * @param def {Integer | Date ? 42} it's complicated
     * @param ghi {String[]} lots
     * @param jkl {String?} maybe baby
     * @return {MyClass} an important object
     */
    fullyDocumentedMethod: function (abc, def, ghi, jkl) {
      return new testapp.MyClass();
    }
  }
});
