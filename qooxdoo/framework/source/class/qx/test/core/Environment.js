/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.core.Environment",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    // /////////////////////////////////
    // TESTS FOR THE ENVIRONMENT CLASS
    // ////////////////////////////// //
    testGet : function() {
      // fake the check
      qx.core.Environment._checks["affe"] = function() {
        return "affe";
      }
      this.assertEquals("affe", qx.core.Environment.get("affe"));
      // clear the fake check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },

    testGetAsync : function() {
      // fake the check
      qx.core.Environment._asyncChecks["affe"] = function(clb, self) {
        window.setTimeout(function() {
          clb.call(self, "affe");
        }, 0);
      }

      qx.core.Environment.getAsync("affe", function(result) {
        this.resume(function() {
          this.assertEquals("affe", result);
          // clear the fake check
          delete qx.core.Environment._asyncChecks["affe"];
          qx.core.Environment.invalidateCacheKey("affe");
        }, this);
      }, this);

      this.wait();
    },

    testSelect : function() {
      // fake the check
      qx.core.Environment._checks["affe"] = function() {
        return "affe";
      }
      var test;
      test = qx.core.Environment.select("affe", {
        "affe" : "affe"
      });

      this.assertEquals(test, "affe");
      // clear the fake check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },

    testSelectDefault : function() {
      // fake the check
      qx.core.Environment._checks["affe"] = function() {
        return "affe";
      }
      var test;
      test = qx.core.Environment.select("affe", {
        "default" : "affe"
      });

      this.assertEquals(test, "affe");
      // clear the fake check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testSelectAsync :function() {
      // fake the check
      qx.core.Environment.addAsync("affe", function(clb, self) {
        window.setTimeout(function() {
          clb.call(self, "AFFE");
        }, 0);
      });


      qx.core.Environment.selectAsync("affe", {
        "affe" : function(result) {
          this.resume(function() {
            // clear the fake check
            delete qx.core.Environment._checks["affe"];
            qx.core.Environment.invalidateCacheKey("affe");
            this.assertEquals("AFFE", result);
          }, this);
        }
      }, this);

      this.wait();
    },


    testCache: function() {
      // fake the check
      qx.core.Environment._checks["affe"] = function() {
        return "affe";
      }
      this.assertEquals("affe", qx.core.Environment.get("affe"));
      // clear the fake check
      delete qx.core.Environment._checks["affe"];

      this.assertEquals("affe", qx.core.Environment.get("affe"));

      qx.core.Environment.invalidateCacheKey("affe");
    },

    testCacheInvalidation: function() {
      // fake the check
      qx.core.Environment._checks["affe"] = function() {
        return "affe";
      }
      this.assertEquals("affe", qx.core.Environment.get("affe"));

      qx.core.Environment.invalidateCacheKey("affe");

      // fake another check
      qx.core.Environment._checks["affe"] = function() {
        return "affe2";
      }
      this.assertEquals("affe2", qx.core.Environment.get("affe"));

      // clear the fake check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testAddFunction : function() {
      qx.core.Environment.add("affe", function() {
        return "AFFE";
      });

      this.assertEquals("AFFE", qx.core.Environment.get("affe"));

      // clear the check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testAddValue : function() {
      qx.core.Environment.add("affe", "AFFE");

      this.assertEquals("AFFE", qx.core.Environment.get("affe"));

      // clear the check
      delete qx.core.Environment._checks["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testAddAsyncFunction : function() {
      qx.core.Environment.addAsync("affe", function(clb, self) {
        window.setTimeout(function() {
          clb.call(self, "AFFE");
        }, 0);
      });

      qx.core.Environment.getAsync("affe", function(result) {
        this.resume(function() {
          this.assertEquals("AFFE", result);
          // clear the fake check
          delete qx.core.Environment._asyncChecks["affe"];
          qx.core.Environment.invalidateCacheKey("affe");
        }, this);
      }, this);

      this.wait();
    },


    // //////////////////////////////
    // TESTS FOR THE CHECKS
    // //////////////////////////////
    testEngineName : function() {
      this.assertNotEquals("", qx.core.Environment.get("engine.name"));
    },

    testEngineVersion : function() {
      this.assertNotEquals("", qx.core.Environment.get("engine.version"));
    },

    testBrowser : function() {
      this.assertNotEquals("", qx.core.Environment.get("browser.name"));
      this.assertNotEquals("", qx.core.Environment.get("browser.version"));

      qx.core.Environment.get("browser.documentmode");
      this.assertBoolean(qx.core.Environment.get("browser.quirksmode"));
    },

    testLocale : function() {
      this.assertNotEquals("", qx.core.Environment.get("locale"));
    },

    testVariant : function() {
      // just make sure the call is working
      qx.core.Environment.get("locale.variant");
    },

    testOS : function() {
      // just make sure the call is working
      this.assertString(qx.core.Environment.get("os.name"));
      this.assertString(qx.core.Environment.get("os.version"));
    },

    testQuicktime : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.quicktime"));
      qx.core.Environment.get("plugin.quicktime.version");
    },

    testWmv : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.windowsmedia"));
      qx.core.Environment.get("plugin.windowsmedia.version");
    },

    testDivx : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.divx"));
      qx.core.Environment.get("plugin.divx.version");
    },

    testSilverlight : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.silverlight"));
      qx.core.Environment.get("plugin.silverlight.version");
    },

    testFlash : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.flash"));
      qx.core.Environment.get("plugin.flash.version");
      this.assertBoolean(qx.core.Environment.get("plugin.flash.express"));
      this.assertBoolean(qx.core.Environment.get("plugin.flash.strictsecurity"));
    },

    testIO : function() {
      // just make sure the call is working
      qx.core.Environment.get("io.maxrequests");
      this.assertBoolean(qx.core.Environment.get("io.ssl"));
    },

    testIOXhr : function() {
      var xhr = qx.core.Environment.get("io.xhr");
      this.assertString(xhr);

      // Should return "xhr" when standard XHR is available
      if (window.XMLHttpRequest &&
          window.location.protocol !== "file:") {
        this.assertEquals("xhr", xhr);
      }
    },

    testHtml : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("html.webworker"));
      this.assertBoolean(qx.core.Environment.get("html.geolocation"));
      this.assertBoolean(qx.core.Environment.get("html.audio"));

      this.assertString(qx.core.Environment.get("html.audio.ogg"));
      this.assertString(qx.core.Environment.get("html.audio.mp3"));
      this.assertString(qx.core.Environment.get("html.audio.wav"));
      this.assertString(qx.core.Environment.get("html.audio.aif"));
      this.assertString(qx.core.Environment.get("html.audio.au"));

      this.assertBoolean(qx.core.Environment.get("html.video"));
      this.assertString(qx.core.Environment.get("html.video.ogg"));
      this.assertString(qx.core.Environment.get("html.video.h264"));
      this.assertString(qx.core.Environment.get("html.video.webm"));
      this.assertBoolean(qx.core.Environment.get("html.storage.local"));
      this.assertBoolean(qx.core.Environment.get("html.storage.session"));
      this.assertBoolean(qx.core.Environment.get("html.classlist"));
      this.assertBoolean(qx.core.Environment.get("html.xpath"));
      this.assertBoolean(qx.core.Environment.get("html.xul"));
      this.assertBoolean(qx.core.Environment.get("html.canvas"));
      this.assertBoolean(qx.core.Environment.get("html.svg"));
      this.assertBoolean(qx.core.Environment.get("html.vml"));
    },

    testGears : function() {
      this.assertBoolean(qx.core.Environment.get("plugin.gears"));
    },

    testCss : function() {
      this.assertNotEquals("", qx.core.Environment.get("css.boxmodel"));
      this.assertBoolean(qx.core.Environment.get("css.textoverflow"));
      this.assertBoolean(qx.core.Environment.get("css.placeholder"));
      this.assertBoolean(qx.core.Environment.get("css.borderradius"));
      this.assertBoolean(qx.core.Environment.get("css.boxshadow"));
      this.assertBoolean(qx.core.Environment.get("css.gradients"));
      this.assertBoolean(qx.core.Environment.get("css.translate3d"));
    },

    testPhoneGap : function() {
      this.assertBoolean(qx.core.Environment.get("phonegap"));
      this.assertBoolean(qx.core.Environment.get("phonegap.notification"));
    },

    testEvent : function() {
      this.assertBoolean(qx.core.Environment.get("event.touch"));
      this.assertBoolean(qx.core.Environment.get("event.pointer"));
    },

    testEcmaScript : function() {
      this.assertBoolean(qx.core.Environment.get("ecmascript.objectcount"));
    },

    testDataUrl : function() {
      qx.core.Environment.getAsync("html.dataurl", function(result) {
        this.resume(function() {
          this.assertBoolean(result);
        }, this);
      }, this);
      this.wait();
    },

    testDevice : function() {
      this.assertString(qx.core.Environment.get("device.name"));
    },

    testOldSettings : function() {
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlSettings"), "1");
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlVariants"), "2");
      this.assertString(qx.core.Environment.get("qx.application"), "3");
      this.assertBoolean(qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"), "4");
      this.assertNumber(qx.core.Environment.get("qx.disposerDebugLevel"), "5");
      this.assertBoolean(qx.core.Environment.get("qx.globalErrorHandling"), "6");
      this.assertBoolean(qx.core.Environment.get("qx.ioRemoteDebug"), "7");
      this.assertBoolean(qx.core.Environment.get("qx.ioRemoteDebugData"), "8");
      this.assertBoolean(qx.core.Environment.get("qx.jsonEncodeUndefined"), "9");
      this.assertBoolean(qx.core.Environment.get("qx.jsonDebugging"), "10");
      this.assertBoolean(qx.core.Environment.get("qx.nativeScrollBars"), "11");
      this.assertNumber(qx.core.Environment.get("qx.propertyDebugLevel"), "12");
    },

    testOldVariants : function() {
      this.assertBoolean(qx.core.Environment.get("qx.debug"), "1");
      this.assertBoolean(qx.core.Environment.get("qx.aspects"), "2");
      this.assertBoolean(qx.core.Environment.get("qx.dynlocale"), "3");
      this.assertBoolean(qx.core.Environment.get("qx.mobile.emulatetouch"), "4");
      this.assertBoolean(qx.core.Environment.get("qx.mobile.nativescroll"), "5");
    }
  }
});
