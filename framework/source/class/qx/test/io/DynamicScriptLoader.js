/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Visionet GmbH, http://www.visionet.de
     2016 OETIKER+PARTNER AG, https://www.oetiker.ch

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dietrich Streifert (level420)
     * Tobias Oetiker (oetiker)

************************************************************************ */

/* ************************************************************************
 ************************************************************************ */
/**
 *
 * @asset(qx/test/dynamicscriptloader/*)
 *
 * @ignore(qx.test.DYNAMICSCRIPTTEST.*)
 * @ignore(qx.dynamicScriptLoadTest.*)
 */

qx.Class.define("qx.test.io.DynamicScriptLoader", {
  extend: qx.dev.unit.TestCase,

  members: {
    setUp: function() {
      if (qx.test.DYNAMICSCRIPTTEST) {
        delete qx.test.DYNAMICSCRIPTTEST;
      }
    },

    tearDown: function() {
      if (qx.test.DYNAMICSCRIPTTEST) {
        delete qx.test.DYNAMICSCRIPTTEST;
      }
    },

    "test 1: dynamic script loading sequential succeeds": function() {
        var loader = qx.io.DynamicScriptLoader.getInstance();
        var lastScript;
        var lastScriptLoaded = false;
        var loadId = loader.addListener('loaded',function(e){
            var data = e.getData();
            if (data.script == lastScript){
                lastScriptLoaded = true;
                loader.removeListenerById(loadId);
            }
        },this);

        loader.addListenerOnce('ready',function(){
            this.assertTrue(lastScriptLoaded);
        },this);

        var lastScript = loader.load([
          "qx/test/dynamicscriptloader/first.js",
          "qx/test/dynamicscriptloader/second.js",
          "qx/test/dynamicscriptloader/third.js"
        ],function(){
          this.resume(function(){
            console.log(qx.test.DYNAMICSCRIPTTEST);
            this.assertEquals(qx.test.DYNAMICSCRIPTTEST.second.third,"dynamically loaded");
          },this);
        },this);
        this.wait();
    },

    "test 2: do not load again": function() {
        var loader = qx.io.DynamicScriptLoader.getInstance();
        var noEvent = true;
        var checkId = loader.addListener('loaded',function(e){
          noEvent = false;
        });
        loader.addListenerOnce('ready',function(){
          this.resume(function(){
            this.assertTrue(noEvent);
          },this);
          loader.removeListenerById(checkId);
        },this);
        var lastScript = loader.load([
          "qx/test/dynamicscriptloader/first.js",
          "qx/test/dynamicscriptloader/second.js",
          "qx/test/dynamicscriptloader/third.js"
        ]);
        this.assertTrue( lastScript == null );
        this.wait();
    },
    "test 3: fail to load": function() {
        var loader = qx.io.DynamicScriptLoader.getInstance();
        loader.addListenerOnce('failed',function(e){
          this.resume(function(){
            this.assertEquals(e.getData().script,"qx/test/dynamicscriptloader/xyc.js");
         },this);
        },this);
        loader.load([
          "qx/test/dynamicscriptloader/xyc.js",
        ]);
        this.wait();
     }
  }
});
