/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2005-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Bootstrap.define("qx.core.Environment", 
{
  statics : {
    
    __checks : {},
    __asyncChecks : {},


    get : function(key) {
      // TODO add caching
      var check = this.__checks[key];
      if (check) {
        return check();
      }

      // debug flag
      if (this.useCheck("qx.debug")) {
        qx.Bootstrap.warn(key + " can not be checked.");
      }
    },


    getAsync : function(key, callback, self) {
      // TODO add caching
      var check = this.__asyncChecks[key];
      if (check) {
        check(callback, self);
      }

      // debug flag
      if (this.useCheck("qx.debug")) {
        qx.Bootstrap.warn(key + " can not be checked.");        
      }
    },


    select : function(key, values) {
      var key = this.get(key);
      
      var value = values[key];
      if (value) {
        return value;
      } 

      if (values["default"] !== undefined) {
        return values["default"];
      }
      
      if (this.useCheck("qx.debug", "on"))
      {
        throw new Error('No match for variant "' + key +
          '" in variants [' + qx.Bootstrap.getKeysAsString(values) +
          '] found, and no default ("default") given');
      }      
    },
    
    
    
    /**
     * Internal helper for the generator to flag that this block contains the 
     * dependency for the given check key.
     * 
     * @internal
     * @param key {String} the check key.
     * @return {Boolean} Always true
     */
    useCheck : function(key) {
      return true;
    },
    

    
    __initChecksMap : function() {
      // /////////////////////////////////////////
      // Engine 
      // /////////////////////////////////////////      
      if (this.useCheck("engine.version")) {
        this.__checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      if (this.useCheck("engine.name")) {
        this.__checks["engine.name"] = qx.bom.client.Engine.getName;        
      }

      // /////////////////////////////////////////
      // Browser
      // /////////////////////////////////////////
      if (this.useCheck("browser.name")) {
        this.__checks["browser.name"] = qx.bom.client.Browser.getName;   
      }
      if (this.useCheck("browser.version")) {
        this.__checks["browser.version"] = qx.bom.client.Browser.getVersion;        
      }
      if (this.useCheck("browser.documentmode")) {
        this.__checks["browser.documentmode"] = qx.bom.client.Browser.getDocumentMode;        
      }

      // /////////////////////////////////////////
      // DEVICE
      // /////////////////////////////////////////
      if (this.useCheck("device.name")) {
        this.__checks["device.name"] = qx.bom.client.Device.getName;        
      }
      
      // /////////////////////////////////////////
      // LOCALE
      // /////////////////////////////////////////
      if (this.useCheck("locale")) {
        this.__checks["locale"] = qx.bom.client.Locale.getLocale;        
      }
      
      if (this.useCheck("locale.variant")) {
        this.__checks["locale.variant"] = qx.bom.client.Locale.getVariant;        
      }

      // /////////////////////////////////////////
      // OPERATING SYSTEM
      // /////////////////////////////////////////
      if (this.useCheck("os.name")) {
        this.__checks["os.name"] = qx.bom.client.OperatingSystem.getName;
      }
      if (this.useCheck("os.version")) {
        this.__checks["os.version"] = qx.bom.client.OperatingSystem.getVersion;
      }

      // /////////////////////////////////////////
      // plugin
      // /////////////////////////////////////////
      if (this.useCheck("plugin.gears")) {
        this.__checks["plugin.gears"] = qx.bom.client.Plugin.getGears;
      }
            
      if (this.useCheck("plugin.quicktime")) {
        this.__checks["plugin.quicktime"] = qx.bom.client.Plugin.getQuicktime;
      }
      if (this.useCheck("plugin.quicktime.version")) {
        this.__checks["plugin.quicktime.version"] = qx.bom.client.Plugin.getQuicktimeVersion;
      }

      if (this.useCheck("plugin.windowsmedia")) {
        this.__checks["plugin.windowsmedia"] = qx.bom.client.Plugin.getWindowsMedia;
      }
      if (this.useCheck("plugin.windowsmedia.version")) {
        this.__checks["plugin.windowsmedia.version"] = qx.bom.client.Plugin.getWindowsMediaVersion;
      }

      if (this.useCheck("plugin.divx")) {
        this.__checks["plugin.divx"] = qx.bom.client.Plugin.getDivX;
      }
      if (this.useCheck("plugin.divx.version")) {
        this.__checks["plugin.divx.version"] = qx.bom.client.Plugin.getDivXVersion;
      }

      if (this.useCheck("plugin.silverlight")) {
        this.__checks["plugin.silverlight"] = qx.bom.client.Plugin.getSilverlight;
      }
      if (this.useCheck("plugin.silverlight.version")) {
        this.__checks["plugin.silverlight.version"] = qx.bom.client.Plugin.getSilverlightVersion;
      }

      if (this.useCheck("plugin.flash")) {
        this.__checks["plugin.flash"] = qx.bom.client.Flash.isAvailable;
      }
      if (this.useCheck("plugin.flash.version")) {
        this.__checks["plugin.flash.version"] = qx.bom.client.Flash.getVersion;
      }
      if (this.useCheck("plugin.flash.express")) {
        this.__checks["plugin.flash.express"] = qx.bom.client.Flash.getExpressInstall;
      }
      if (this.useCheck("plugin.flash.strictsecurity")) {
        this.__checks["plugin.flash.strictsecurity"] = qx.bom.client.Flash.getStrictSecurityModel;
      }

      // /////////////////////////////////////////
      // IO
      // /////////////////////////////////////////      
      if (this.useCheck("io.maxrequests")) {
        this.__checks["io.maxrequests"] = qx.bom.client.Transport.getMaxConcurrentRequestCount;
      }
      if (this.useCheck("io.ssl")) {
        this.__checks["io.ssl"] = qx.bom.client.Transport.getSSL;
      }

      // /////////////////////////////////////////
      // EVENTS
      // /////////////////////////////////////////
      if (this.useCheck("event.touch")) {
        this.__checks["event.touch"] = qx.bom.client.Event.getTouch;
      }

      if (this.useCheck("event.pointer")) {
        this.__checks["event.pointer"] = qx.bom.client.Event.getPointer;
      }

      // /////////////////////////////////////////
      // ECMA SCRIPT
      // /////////////////////////////////////////
      if (this.useCheck("ecmascript.objectcount")) {
        this.__checks["ecmascript.objectcount"] = 
          qx.bom.client.EcmaScript.getObjectCount;
      }

      // /////////////////////////////////////////
      // HTML
      // /////////////////////////////////////////      
      if (this.useCheck("html.webworker")) {
        this.__checks["html.webworker"] = qx.bom.client.Html.getWebWorker;
      }
      if (this.useCheck("html.geolocation")) {
        this.__checks["html.geolocation"] = qx.bom.client.Html.getGeoLocation;
      }
      if (this.useCheck("html.audio")) {
        this.__checks["html.audio"] = qx.bom.client.Html.getAudio;
      }
      if (this.useCheck("html.video")) {
        this.__checks["html.video"] = qx.bom.client.Html.getVideo;
      }
      if (this.useCheck("html.storage.local")) {
        this.__checks["html.storage.local"] = qx.bom.client.Html.getLocalStorage;
      }
      if (this.useCheck("html.storage.session")) {
        this.__checks["html.storage.session"] = qx.bom.client.Html.getSessionStorage;
      }
      if (this.useCheck("html.classlist")) {
        this.__checks["html.classlist"] = qx.bom.client.Html.getClassList;
      }

      if (this.useCheck("html.xpath")) {
        this.__checks["html.xpath"] = qx.bom.client.Html.getXPath;
      }
      if (this.useCheck("html.xul")) {
        this.__checks["html.xul"] = qx.bom.client.Html.getXUL;
      }

      if (this.useCheck("html.canvas")) {
        this.__checks["html.canvas"] = qx.bom.client.Html.getCanvas;
      }
      if (this.useCheck("html.svg")) {
        this.__checks["html.svg"] = qx.bom.client.Html.getSVG;
      }
      if (this.useCheck("html.vml")) {
        this.__checks["html.vml"] = qx.bom.client.Html.getVML;
      }
      if (this.useCheck("html.dataurl")) {
        this.__asyncChecks["html.dataurl"] = qx.bom.client.Html.getDataUrl;
      }

      // /////////////////////////////////////////
      // CSS
      // /////////////////////////////////////////
      if (this.useCheck("css.textoverflow")) {
        this.__checks["css.textoverflow"] = qx.bom.client.Css.getTextOverflow;        
      }

      if (this.useCheck("css.placeholder")) {
        this.__checks["css.placeholder"] = qx.bom.client.Css.getPlaceholder;        
      }

      if (this.useCheck("css.borderraidus")) {
        this.__checks["css.borderraidus"] = qx.bom.client.Css.getBorderRadius;        
      }

      if (this.useCheck("css.boxshadow")) {
        this.__checks["css.boxshadow"] = qx.bom.client.Css.getBoxShadow;        
      }

      if (this.useCheck("css.gradients")) {
        this.__checks["css.gradients"] = qx.bom.client.Css.getGradients;        
      }

      if (this.useCheck("css.boxmodel")) {
        this.__checks["css.boxmodel"] = qx.bom.client.Css.getBoxModel;
      }
    }
  },


  defer : function(statics) {
    statics.__initChecksMap();
  }
});