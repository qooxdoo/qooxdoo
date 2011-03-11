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
      
      var engine = qx.core.Environment.get("engine.name");
      var version = qx.core.Environment.get("engine.version");

      if (engine == "mshtml" && version < 8) {
        this.assertFalse(xhr);
      } else {
        this.assertTrue(xhr);
      }
    },

    testHtml : function() {
      // just make sure the call is working
      this.assertBoolean(qx.core.Environment.get("html.webworker"));
      this.assertBoolean(qx.core.Environment.get("html.geolocation"));
      this.assertBoolean(qx.core.Environment.get("html.audio"));
      this.assertBoolean(qx.core.Environment.get("html.video"));
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
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlSettings"));
      this.assertBoolean(qx.core.Environment.get("qx.allowUrlVariants"));
      this.assertString(qx.core.Environment.get("qx.application"));
      this.assertString(qx.core.Environment.get("qx.bom.htmlarea.HtmlArea.debug"));
      this.assertNumber(qx.core.Environment.get("qx.disposerDebugLevel"));
      this.assertString(qx.core.Environment.get("qx.globalErrorHandling"));
      this.assertBoolean(qx.core.Environment.get("qx.ioRemoteDebug"));
      this.assertBoolean(qx.core.Environment.get("qx.ioRemoteDebugData"));
      this.assertBoolean(qx.core.Environment.get("qx.jsonEncodeUndefined"));
      this.assertBoolean(qx.core.Environment.get("qx.jsonDebugging"));
      this.assertBoolean(qx.core.Environment.get("qx.nativeScrollBars"));
      this.assertNumber(qx.core.Environment.get("qx.propertyDebugLevel"));
      // TODO why is that key missing
      // this.assertBoolean(qx.core.Environment.get("qx.tableResizeDebug"));
    }
  }
});