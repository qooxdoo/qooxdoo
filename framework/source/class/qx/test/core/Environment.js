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

/* ************************************************************************

#require(qx.bom.htmlarea.HtmlArea)
#require(qx.io.remote.Request)
#require(qx.ui.core.scroll.MScrollBarFactory)

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
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe";
      };
      this.assertEquals("affe", qx.core.Environment.get("affe"));
      // clear the fake check
      delete qx.core.Environment.getChecks()["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },

    testGetAsync : function() {
      // fake the check
      qx.core.Environment.getAsyncChecks()["affe"] = function(clb, self) {
        window.setTimeout(function() {
          clb.call(self, "affe");
        }, 0);
      };

      qx.core.Environment.getAsync("affe", function(result) {
        this.resume(function() {
          this.assertEquals("affe", result);
          // clear the fake check
          delete qx.core.Environment.getAsyncChecks()["affe"];
          qx.core.Environment.invalidateCacheKey("affe");
        }, this);
      }, this);

      this.wait();
    },

    testSelect : function() {
      // fake the check
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe";
      };
      var test;
      test = qx.core.Environment.select("affe", {
        "affe" : "affe"
      });

      this.assertEquals(test, "affe");
      // clear the fake check
      delete qx.core.Environment.getChecks()["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },

    testSelectDefault : function() {
      // fake the check
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe";
      };
      var test;
      test = qx.core.Environment.select("affe", {
        "default" : "affe"
      });

      this.assertEquals(test, "affe");
      // clear the fake check
      delete qx.core.Environment.getChecks()["affe"];
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
            delete qx.core.Environment.getChecks()["affe"];
            qx.core.Environment.invalidateCacheKey("affe");
            this.assertEquals("AFFE", result);
          }, this);
        }
      }, this);

      this.wait();
    },


    testCache: function() {
      // fake the check
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe";
      };
      this.assertEquals("affe", qx.core.Environment.get("affe"));
      // clear the fake check
      delete qx.core.Environment.getChecks()["affe"];

      this.assertEquals("affe", qx.core.Environment.get("affe"));

      qx.core.Environment.invalidateCacheKey("affe");
    },

    testCacheInvalidation: function() {
      // fake the check
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe";
      };
      this.assertEquals("affe", qx.core.Environment.get("affe"));

      qx.core.Environment.invalidateCacheKey("affe");

      // fake another check
      qx.core.Environment.getChecks()["affe"] = function() {
        return "affe2";
      };
      this.assertEquals("affe2", qx.core.Environment.get("affe"));

      // clear the fake check
      delete qx.core.Environment.getChecks()["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testAddFunction : function() {
      qx.core.Environment.add("affe", function() {
        return "AFFE";
      });

      this.assertEquals("AFFE", qx.core.Environment.get("affe"));

      // clear the check
      delete qx.core.Environment.getChecks()["affe"];
      qx.core.Environment.invalidateCacheKey("affe");
    },


    testAddValue : function() {
      qx.core.Environment.add("affe", "AFFE");

      this.assertEquals("AFFE", qx.core.Environment.get("affe"));

      // clear the check
      delete qx.core.Environment.getChecks()["affe"];
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
          delete qx.core.Environment.getAsyncChecks()["affe"];
          qx.core.Environment.invalidateCacheKey("affe");
        }, this);
      }, this);

      this.wait();
    },


    testFilter : function() {
      // fake the checks
      qx.core.Environment.getChecks()["affe1"] = function() {
        return true;
      };
      qx.core.Environment.getChecks()["affe2"] = function() {
        return false;
      };
      qx.core.Environment.getChecks()["affe3"] = function() {
        return true;
      };

      var array = qx.core.Environment.filter({
        "affe1" : 1,
        "affe2" : 2,
        "affe3" : 3
      });

      this.assertEquals(2, array.length);
      this.assertEquals(1, array[0]);
      this.assertEquals(3, array[1]);

      // clear the fake check
      delete qx.core.Environment.getChecks()["affe1"];
      delete qx.core.Environment.getChecks()["affe2"];
      delete qx.core.Environment.getChecks()["affe3"];
      qx.core.Environment.invalidateCacheKey("affe1");
      qx.core.Environment.invalidateCacheKey("affe2");
      qx.core.Environment.invalidateCacheKey("affe3");
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

    testPdf : function()
    {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("plugin.pdf"));
      qx.core.Environment.get("plugin.pdf.version");
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
      this.assertBoolean(qx.core.Environment.get("html.storage.userdata"));
      this.assertBoolean(qx.core.Environment.get("html.classlist"));
      this.assertBoolean(qx.core.Environment.get("html.xpath"));
      this.assertBoolean(qx.core.Environment.get("html.xul"));
      this.assertBoolean(qx.core.Environment.get("html.canvas"));
      this.assertBoolean(qx.core.Environment.get("html.svg"));
      this.assertBoolean(qx.core.Environment.get("html.vml"));
      this.assertBoolean(qx.core.Environment.get("html.console"));

      this.assertBoolean(qx.core.Environment.get("html.stylesheet.createstylesheet"));
      this.assertBoolean(qx.core.Environment.get("html.stylesheet.insertrule"));
      this.assertBoolean(qx.core.Environment.get("html.stylesheet.deleterule"));
      this.assertBoolean(qx.core.Environment.get("html.stylesheet.addimport"));
      this.assertBoolean(qx.core.Environment.get("html.stylesheet.removeimport"));

      this.assertBoolean(qx.core.Environment.get("html.element.contains"));
      this.assertBoolean(qx.core.Environment.get("html.element.compareDocumentPosition"));
      this.assertBoolean(qx.core.Environment.get("html.element.textcontent"));
      this.assertBoolean(qx.core.Environment.get("html.image.naturaldimensions"));
    },

    testXml : function()
    {
      this.assertBoolean(qx.core.Environment.get("xml.implementation"));
      this.assertBoolean(qx.core.Environment.get("xml.domparser"));
      this.assertBoolean(qx.core.Environment.get("xml.selectsinglenode"));
      this.assertBoolean(qx.core.Environment.get("xml.selectnodes"));
      this.assertBoolean(qx.core.Environment.get("xml.getelementsbytagnamens"));
      this.assertBoolean(qx.core.Environment.get("xml.domproperties"));
      this.assertBoolean(qx.core.Environment.get("xml.attributens"));
      this.assertBoolean(qx.core.Environment.get("xml.createnode"));
      this.assertBoolean(qx.core.Environment.get("xml.getqualifieditem"));
      this.assertBoolean(qx.core.Environment.get("xml.createelementns"));
    },

    testGears : function() {
      this.assertBoolean(qx.core.Environment.get("plugin.gears"));
    },

    testActiveX : function() {
      this.assertBoolean(qx.core.Environment.get("plugin.activex"));
    },

    testCss : function() {
      this.assertNotEquals("", qx.core.Environment.get("css.boxmodel"));
      this.assertBoolean(qx.core.Environment.get("css.placeholder"));
      this.assertBoolean(qx.core.Environment.get("css.rgba"));
      var boxShadow = qx.core.Environment.get("css.boxshadow");
      this.assert(typeof boxShadow === "string" || boxShadow === null);
      var borderRadius = qx.core.Environment.get("css.borderradius");
      this.assert(typeof borderRadius == "string" || borderRadius === null);
      var borderImage = qx.core.Environment.get("css.borderimage");
      this.assert(typeof borderImage == "string" || borderImage === null);
      var borderImageSyntax = qx.core.Environment.get("css.borderimage.standardsyntax");
      this.assert(typeof borderImageSyntax == "boolean" || borderImageSyntax === null);
      var textOverflow = qx.core.Environment.get("css.textoverflow");
      this.assert(typeof textOverflow == "string" || textOverflow === null);
      var userSelect = qx.core.Environment.get("css.userselect");
      this.assert(typeof userSelect == "string" || userSelect === null);
      var userSelectNone = qx.core.Environment.get("css.userselect.none");
      this.assert(typeof userSelectNone == "string" || userSelectNone === null);
      var userModify = qx.core.Environment.get("css.usermodify");
      this.assert(typeof userModify == "string" || userModify === null);
      var appearance = qx.core.Environment.get("css.appearance");
      this.assert(typeof appearance == "string" || appearance === null);
      var floatProp = qx.core.Environment.get("css.float");
      this.assert(floatProp === "cssFloat" || floatProp === "styleFloat");
      var boxSizing = qx.core.Environment.get("css.boxsizing");
      this.assert(typeof boxSizing == "string" || boxSizing === null);
      var inlineBlock = qx.core.Environment.get("css.inlineblock");
      this.assert(typeof inlineBlock == "string" || inlineBlock === null);
      this.assertBoolean(qx.core.Environment.get("css.opacity"));
      this.assertBoolean(qx.core.Environment.get("css.overflowxy"));
      var linearGradient = qx.core.Environment.get("css.gradient.linear");
      this.assert(typeof linearGradient == "string" || linearGradient === null);
      this.assertBoolean(qx.core.Environment.get("css.gradient.filter"));
      var radialGradient = qx.core.Environment.get("css.gradient.radial");
      this.assert(typeof radialGradient == "string" || radialGradient === null);
      this.assertBoolean(qx.core.Environment.get("css.gradient.legacywebkit"));
    },

    testPhoneGap : function() {
      this.assertBoolean(qx.core.Environment.get("phonegap"));
      this.assertBoolean(qx.core.Environment.get("phonegap.notification"));
    },

    testEvent : function() {
      this.assertBoolean(qx.core.Environment.get("event.touch"));
      this.assertBoolean(qx.core.Environment.get("event.pointer"));
      this.assertBoolean(qx.core.Environment.get("event.help"));
      this.assertBoolean(qx.core.Environment.get("event.hashchange"));
    },

    testEcmaScript : function() {
      var stackTrace = qx.core.Environment.get("ecmascript.stacktrace");
      this.assert(typeof stackTrace == "string" || stackTrace === null);
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

    testDeviceType : function() {
      this.assertString(qx.core.Environment.get("device.type"));
    },

    testJson : function() {
      this.assertBoolean(qx.core.Environment.get("json"));
    },

    testOldSettings : function() {
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlSettings"), "1");
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlVariants"), "2");
      this.assertString(qx.core.Environment.get("qx.application"), "3");
      this.assertBoolean(qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"), "4");
      this.assertNumber(qx.core.Environment.get("qx.debug.dispose.level"), "5");
      this.assertBoolean(qx.core.Environment.get("qx.globalErrorHandling"), "6");
      this.assertBoolean(qx.core.Environment.get("qx.debug.io.remote"), "7");
      this.assertBoolean(qx.core.Environment.get("qx.debug.io.remote.data"), "8");
      this.assertBoolean(qx.core.Environment.get("qx.nativeScrollBars"), "9");
      this.assertNumber(qx.core.Environment.get("qx.debug.property.level"), "10");
    },

    testOldVariants : function() {
      this.assertBoolean(qx.core.Environment.get("qx.debug"), "1");
      this.assertBoolean(qx.core.Environment.get("qx.aspects"), "2");
      this.assertBoolean(qx.core.Environment.get("qx.dynlocale"), "3");
      this.assertBoolean(qx.core.Environment.get("qx.mobile.emulatetouch"), "4");
      this.assertBoolean(qx.core.Environment.get("qx.mobile.nativescroll"), "5");
    },


    testAnimationAndTransform : function() {
      // smoke test... make sure the method is doing something
      qx.core.Environment.get("css.animation");
      qx.core.Environment.get("css.transform");

      // 3d transform support
      this.assertBoolean(qx.core.Environment.get("css.transform.3d"));
    }
  }
});