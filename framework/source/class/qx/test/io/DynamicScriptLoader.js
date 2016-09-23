/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2016 Visionet GmbH, http://www.visionet.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dietrich Streifert (level420)

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

qx.Class.define("qx.test.io.DynamicScriptLoader",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function()
    {
      if(qx.test.DYNAMICSCRIPTTEST) {
        delete qx.test.DYNAMICSCRIPTTEST;
      }
      
      qx.Class.define("qx.dynamicScriptLoadTest.Base",
      {
        extend : qx.core.Object,
        include : qx.io.MDynamicScriptLoader,
        
        construct : function() {
          this._initStatesAndListeners();
        },
        
        members :
        {
          _scriptsReadyCalled : false,
          _scriptsLoadingCompleteCalled : false,
          _scriptSuccessCalled : null,
          _scriptFailedCalled : null,
          
          _initStatesAndListeners : function() {
            this._scriptsReadyCalled = false;
            this._scriptsLoadingCompleteCalled = false;
            this._scriptSuccessCalled = [];
            this._scriptFailedCalled = [];
             
            this.addListener('scriptSuccess', this._onScriptSuccess, this);
            this.addListener('scriptFailed', this._onScriptFailed, this);
            this.addListener('scriptsReady', this._onScriptsReady, this);
            this.addListener('scriptsLoadingComplete', this._onScriptsLoadingComplete, this);
          },
          
          _onScriptsReady : function() {
            this.debug("_onScriptsReady");
            this._scriptsReadyCalled = true;
          },
          
          _onScriptsLoadingComplete : function() {
            this.debug("_onScriptsLoadingComplete");
            this._scriptsLoadingCompleteCalled = true;
          },

          _onScriptSuccess : function(e) {
            var d = e.getData();
            this.debug("_onScriptSuccess: script: " + d.script + ", status: " + d.status);
            this._scriptSuccessCalled.push(d);
          },
          
          _onScriptFailed : function(e) {
            var d = e.getData();
            this.debug("_onScriptFailed: script: " + d.script + ", status: " + d.status);
            this._scriptFailedCalled.push(d);
          }
        }
      });
      
    },

    tearDown : function()
    {
      if(qx.dynamicScriptLoadTest.Success) {
        qx.Class.undefine("qx.dynamicScriptLoadTest.Success");
      }
      if(qx.dynamicScriptLoadTest.Failed) {
        qx.Class.undefine("qx.dynamicScriptLoadTest.Failed");
      }
      if(qx.dynamicScriptLoadTest.Base) {
        qx.Class.undefine("qx.dynamicScriptLoadTest.Base");
      }

      if(qx.test.DYNAMICSCRIPTTEST) {
        delete qx.test.DYNAMICSCRIPTTEST;
      }
    },


    "test 1: dynamic script loading sequential succeeds" : function()
    {
      qx.Class.define("qx.dynamicScriptLoadTest.Success",
      {
        extend : qx.dynamicScriptLoadTest.Base,
        include : qx.io.MDynamicScriptLoader,
        
        construct : function() {
          this.base(arguments);
          
          this._loadScriptsDynamic([
            "qx/test/dynamicscriptloader/first.js",
            "qx/test/dynamicscriptloader/second.js",
            "qx/test/dynamicscriptloader/third.js"
          ]);
        }
      });

      var i1 = new qx.dynamicScriptLoadTest.Success();
      
      // as script loading is asynchronously, we should wait
      // a bit to allow loading to complete
      //
      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          
          // the first instance should have fired event scriptsLoadingComplete
          this.assertTrue(i1._scriptsLoadingCompleteCalled);
          // both instances should have fired event scriptsReady
          this.assertTrue(i1._scriptsReadyCalled);
          
          // the first instance should have loaded all scripts and have no failed script
          this.assertEquals(i1._scriptSuccessCalled.length, 3);
          this.assertEquals(i1._scriptFailedCalled.length, 0);
          
          // check the availability of the object path which is initialized in the test files
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST !== undefined));
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST.second !== undefined));
          this.assertEquals("dynamically loaded", qx.test.DYNAMICSCRIPTTEST.second.third);
          
          // we create a second instance to verify that loading is
          // only done once
          //
          var i2 = new qx.dynamicScriptLoadTest.Success();

          qx.event.Timer.once(function(e) {
            var self = this;
            
            this.resume(function() {
            
              // the second instance should not have fired event scriptsLoadingComplete
              this.assertFalse(i2._scriptsLoadingCompleteCalled);
              // both instances should have fired event scriptsReady
              this.assertTrue(i2._scriptsReadyCalled);
              
              // the second instance shouldn't load any script and have no failed script
              this.assertEquals(i2._scriptSuccessCalled.length, 0);
              this.assertEquals(i2._scriptFailedCalled.length, 0);
              
              // check the availability of the object path which is initialized in the test files
              this.assertTrue((qx.test.DYNAMICSCRIPTTEST !== undefined));
              this.assertTrue((qx.test.DYNAMICSCRIPTTEST.second !== undefined));
              this.assertEquals("dynamically loaded", qx.test.DYNAMICSCRIPTTEST.second.third);
              
              i2.dispose();
            }, self);
            
          }, this, 100);
          
          this.wait()         

          i1.dispose();
          
        }, self);
      }, this, 1000);


      this.wait();
    },


    "test 2: dynamic script loading parallel succeeds" : function()
    {
      qx.Class.define("qx.dynamicScriptLoadTest.Success",
      {
        extend : qx.dynamicScriptLoadTest.Base,
        include : qx.io.MDynamicScriptLoader,
        
        construct : function() {
          this.base(arguments);
          
          this._loadScriptsDynamic([
            "qx/test/dynamicscriptloader/first.js",
            "qx/test/dynamicscriptloader/second.js",
            "qx/test/dynamicscriptloader/third.js"
          ]);
        }
      });

      var i1 = new qx.dynamicScriptLoadTest.Success();
      var i2 = new qx.dynamicScriptLoadTest.Success();
      
      // as script loading is asynchronously, we should wait
      // a bit to allow loading to complete
      //
      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          
          // only one instance should have fired event scriptsLoadingComplete
          this.assertEquals((i1._scriptsLoadingCompleteCalled?1:0)+(i2._scriptsLoadingCompleteCalled?1:0),1);

          // both instances should have fired event scriptsReady
          this.assertTrue(i1._scriptsReadyCalled);
          this.assertTrue(i2._scriptsReadyCalled);
          
          // the sum of loaded scripts across all instances should be 3
          this.assertEquals(i1._scriptSuccessCalled.length+i2._scriptSuccessCalled.length, 3);
          // none of the instances should have a failed script
          this.assertEquals(i1._scriptFailedCalled.length+i2._scriptFailedCalled.length, 0);
          
          // as a result we should have the object path available up to .second
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST !== undefined));
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST.second !== undefined));
          this.assertEquals("dynamically loaded", qx.test.DYNAMICSCRIPTTEST.second.third);
          
          i1.dispose();
          i2.dispose()
          
        }, self);
      }, this, 1000);


      this.wait();
    },
    
    "test 3: dynamic script loading fails" : function()
    {
      qx.Class.define("qx.dynamicScriptLoadTest.Failed",
      {
        extend : qx.dynamicScriptLoadTest.Base,
        
        construct : function() {
          this.base(arguments);
          
          this._loadScriptsDynamic([
            "qx/test/dynamicscriptloader/first.js",
            "qx/test/dynamicscriptloader/second.js",
            // this script does not exists and should lead ot an error
            "qx/test/dynamicscriptloader/the-x-files.js"
          ]);
        }
      });

      var i1 = new qx.dynamicScriptLoadTest.Failed();
      var i2 = new qx.dynamicScriptLoadTest.Failed();
      
      qx.event.Timer.once(function(e) {
        var self = this;
        this.resume(function() {
          
          // no instance should have fired the event scriptsLoadingComplete
          this.assertFalse(i1._scriptsLoadingCompleteCalled);
          this.assertFalse(i2._scriptsLoadingCompleteCalled);
          
          // no instance should have fired the event scriptsLoadingComplete
          this.assertFalse(i1._scriptsReadyCalled);
          this.assertFalse(i2._scriptsReadyCalled);
          
          // the sum of loaded scripts across all instances should be 2
          this.assertEquals(i1._scriptSuccessCalled.length+i2._scriptSuccessCalled.length, 2);
          // the sum of failed scripts across all instances should be 1
          this.assertEquals(i1._scriptFailedCalled.length+i2._scriptFailedCalled.length, 1);
          
          // as a result we should have the object path available up to .second
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST !== undefined));
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST.second !== undefined));
          this.assertTrue((qx.test.DYNAMICSCRIPTTEST.second.third === undefined));
          
          i1.dispose();
          i2.dispose();
          
        }, self);
      }, this, 1000);


      this.wait();
    }
    

  }
});
