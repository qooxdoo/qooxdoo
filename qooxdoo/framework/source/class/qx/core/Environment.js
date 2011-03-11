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
    
    /** Maps containing the check functions. */
    _checks : {},
    _asyncChecks : {},

    /** Internal cache for all checks. */ 
    __cache : {},



    get : function(key) {
      // check the cache
      if (this.__cache[key] != undefined) {
        return this.__cache[key];
      }

      // search for a fitting check
      var check = this._checks[key];
      if (check) {
        // execute the check and write the result in the cache
        var value = check();
        this.__cache[key] = value;
        return value;
      }

      // debug flag
      if (this.useCheck("qx.debug")) {
        qx.Bootstrap.warn(key + " can not be checked.");
      }
    },


    getAsync : function(key, callback, self) {
      // check the cache
      var env = this;
      if (this.__cache[key] != undefined) {
        // force async behavior
        window.setTimeout(function() {
          callback.call(self, env.__cache[key]);
        }, 0);
        return;
      }

      var check = this._asyncChecks[key];
      if (check) {
        check(function(result) {
          env.__cache[key] = result;
          callback.call(self, result);
        });
        return;
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



    invalidateCacheKey : function(key) {
      delete this.__cache[key];
    },


    add : function(key, getter) {
      if (this._checks[key] == undefined) {
        if (getter instanceof Function) {
          this._checks[key] = getter;
        } else {
          this._checks[key] = qx.Bootstrap.bind(function() {
            return this;
          }, getter);
        }

      } else {
        if (this.useCheck("qx.debug")) {
          qx.Bootstrap.warn("The key '" + key + "' is already in use." + 
            " The old value '" + this.get(key) + "' is still valid.");
        }
      }
    },


    _initDefaultQxValues : function() {
      this.add("qx.allowUrlSettings", function() {return false;});
      this.add("qx.allowUrlVariants", function() {return false;});
      this.add("qx.propertyDebugLevel", function() {return 0;});
    },


    /**
     * Import checks from global qx.$$environemnt into current environment.
     */
    __importFromGenerator : function()
    {
      // @deprecated since 1.4: import from settings map in case someone 
      // added it manually
      if (window.qxsettings)
      {
        for (var key in window.qxsettings) {
          var check = qx.Bootstrap.bind(function() {
            return this;
          }, window.qxsettings[key]);
          this._checks[key] = check;
        }
      }
      
      if (qx && qx.$$environment)
      {
        for (var key in qx.$$environment) {
          var check = qx.Bootstrap.bind(function() {
            return this;
          }, qx.$$environment[key]);
          this._checks[key] = check;
        }
      }
    },
    
    
    __importFromUrl : function() {
      var urlChecks = document.location.search.slice(1).split("&");

      for (var i = 0; i < urlChecks.length; i++)
      {
        var check = urlChecks[i].split(":");
        if (check.length != 3 || check[0] != "qxenv") {
          continue;
        }
        
        var key = check[1];
        var value = decodeURIComponent(check[2]);
        
        var checkFunction = qx.Bootstrap.bind(function() {
          return this;
        }, value);
        this._checks[key] = checkFunction;
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


    /**
     * Initializer for the 
     */
    _initChecksMap : function() {
      // /////////////////////////////////////////
      // Engine 
      // /////////////////////////////////////////      
      if (this.useCheck("engine.version")) {
        this._checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      if (this.useCheck("engine.name")) {
        this._checks["engine.name"] = qx.bom.client.Engine.getName;        
      }

      // /////////////////////////////////////////
      // Browser
      // /////////////////////////////////////////
      if (this.useCheck("browser.name")) {
        this._checks["browser.name"] = qx.bom.client.Browser.getName;   
      }
      if (this.useCheck("browser.version")) {
        this._checks["browser.version"] = qx.bom.client.Browser.getVersion;        
      }
      if (this.useCheck("browser.documentmode")) {
        this._checks["browser.documentmode"] = qx.bom.client.Browser.getDocumentMode;
      }
      if (this.useCheck("browser.quirksmode")) {
        this._checks["browser.quirksmode"] = qx.bom.client.Browser.getQuirksMode;
      }

      // /////////////////////////////////////////
      // DEVICE
      // /////////////////////////////////////////
      if (this.useCheck("device.name")) {
        this._checks["device.name"] = qx.bom.client.Device.getName;        
      }
      
      // /////////////////////////////////////////
      // LOCALE
      // /////////////////////////////////////////
      if (this.useCheck("locale")) {
        this._checks["locale"] = qx.bom.client.Locale.getLocale;        
      }
      
      if (this.useCheck("locale.variant")) {
        this._checks["locale.variant"] = qx.bom.client.Locale.getVariant;        
      }

      // /////////////////////////////////////////
      // OPERATING SYSTEM
      // /////////////////////////////////////////
      if (this.useCheck("os.name")) {
        this._checks["os.name"] = qx.bom.client.OperatingSystem.getName;
      }
      if (this.useCheck("os.version")) {
        this._checks["os.version"] = qx.bom.client.OperatingSystem.getVersion;
      }

      // /////////////////////////////////////////
      // plugin
      // /////////////////////////////////////////
      if (this.useCheck("plugin.gears")) {
        this._checks["plugin.gears"] = qx.bom.client.Plugin.getGears;
      }
            
      if (this.useCheck("plugin.quicktime")) {
        this._checks["plugin.quicktime"] = qx.bom.client.Plugin.getQuicktime;
      }
      if (this.useCheck("plugin.quicktime.version")) {
        this._checks["plugin.quicktime.version"] = qx.bom.client.Plugin.getQuicktimeVersion;
      }

      if (this.useCheck("plugin.windowsmedia")) {
        this._checks["plugin.windowsmedia"] = qx.bom.client.Plugin.getWindowsMedia;
      }
      if (this.useCheck("plugin.windowsmedia.version")) {
        this._checks["plugin.windowsmedia.version"] = qx.bom.client.Plugin.getWindowsMediaVersion;
      }

      if (this.useCheck("plugin.divx")) {
        this._checks["plugin.divx"] = qx.bom.client.Plugin.getDivX;
      }
      if (this.useCheck("plugin.divx.version")) {
        this._checks["plugin.divx.version"] = qx.bom.client.Plugin.getDivXVersion;
      }

      if (this.useCheck("plugin.silverlight")) {
        this._checks["plugin.silverlight"] = qx.bom.client.Plugin.getSilverlight;
      }
      if (this.useCheck("plugin.silverlight.version")) {
        this._checks["plugin.silverlight.version"] = qx.bom.client.Plugin.getSilverlightVersion;
      }

      if (this.useCheck("plugin.flash")) {
        this._checks["plugin.flash"] = qx.bom.client.Flash.isAvailable;
      }
      if (this.useCheck("plugin.flash.version")) {
        this._checks["plugin.flash.version"] = qx.bom.client.Flash.getVersion;
      }
      if (this.useCheck("plugin.flash.express")) {
        this._checks["plugin.flash.express"] = qx.bom.client.Flash.getExpressInstall;
      }
      if (this.useCheck("plugin.flash.strictsecurity")) {
        this._checks["plugin.flash.strictsecurity"] = qx.bom.client.Flash.getStrictSecurityModel;
      }

      // /////////////////////////////////////////
      // IO
      // /////////////////////////////////////////      
      if (this.useCheck("io.maxrequests")) {
        this._checks["io.maxrequests"] = qx.bom.client.Transport.getMaxConcurrentRequestCount;
      }
      if (this.useCheck("io.ssl")) {
        this._checks["io.ssl"] = qx.bom.client.Transport.getSSL;
      }
      if (this.useCheck("io.xhr")) {
        this._checks["io.xhr"] = qx.bom.client.Transport.getXmlHttpRequest;
      }

      // /////////////////////////////////////////
      // EVENTS
      // /////////////////////////////////////////
      if (this.useCheck("event.touch")) {
        this._checks["event.touch"] = qx.bom.client.Event.getTouch;
      }

      if (this.useCheck("event.pointer")) {
        this._checks["event.pointer"] = qx.bom.client.Event.getPointer;
      }

      // /////////////////////////////////////////
      // ECMA SCRIPT
      // /////////////////////////////////////////
      if (this.useCheck("ecmascript.objectcount")) {
        this._checks["ecmascript.objectcount"] = 
          qx.bom.client.EcmaScript.getObjectCount;
      }

      // /////////////////////////////////////////
      // HTML
      // /////////////////////////////////////////      
      if (this.useCheck("html.webworker")) {
        this._checks["html.webworker"] = qx.bom.client.Html.getWebWorker;
      }
      if (this.useCheck("html.geolocation")) {
        this._checks["html.geolocation"] = qx.bom.client.Html.getGeoLocation;
      }
      if (this.useCheck("html.audio")) {
        this._checks["html.audio"] = qx.bom.client.Html.getAudio;
      }
      if (this.useCheck("html.video")) {
        this._checks["html.video"] = qx.bom.client.Html.getVideo;
      }
      if (this.useCheck("html.storage.local")) {
        this._checks["html.storage.local"] = qx.bom.client.Html.getLocalStorage;
      }
      if (this.useCheck("html.storage.session")) {
        this._checks["html.storage.session"] = qx.bom.client.Html.getSessionStorage;
      }
      if (this.useCheck("html.classlist")) {
        this._checks["html.classlist"] = qx.bom.client.Html.getClassList;
      }

      if (this.useCheck("html.xpath")) {
        this._checks["html.xpath"] = qx.bom.client.Html.getXPath;
      }
      if (this.useCheck("html.xul")) {
        this._checks["html.xul"] = qx.bom.client.Html.getXUL;
      }

      if (this.useCheck("html.canvas")) {
        this._checks["html.canvas"] = qx.bom.client.Html.getCanvas;
      }
      if (this.useCheck("html.svg")) {
        this._checks["html.svg"] = qx.bom.client.Html.getSVG;
      }
      if (this.useCheck("html.vml")) {
        this._checks["html.vml"] = qx.bom.client.Html.getVML;
      }
      if (this.useCheck("html.dataurl")) {
        this._asyncChecks["html.dataurl"] = qx.bom.client.Html.getDataUrl;
      }

      // /////////////////////////////////////////
      // CSS
      // /////////////////////////////////////////
      if (this.useCheck("css.textoverflow")) {
        this._checks["css.textoverflow"] = qx.bom.client.Css.getTextOverflow;        
      }

      if (this.useCheck("css.placeholder")) {
        this._checks["css.placeholder"] = qx.bom.client.Css.getPlaceholder;        
      }

      if (this.useCheck("css.borderradius")) {
        this._checks["css.borderradius"] = qx.bom.client.Css.getBorderRadius;        
      }

      if (this.useCheck("css.boxshadow")) {
        this._checks["css.boxshadow"] = qx.bom.client.Css.getBoxShadow;        
      }

      if (this.useCheck("css.gradients")) {
        this._checks["css.gradients"] = qx.bom.client.Css.getGradients;        
      }

      if (this.useCheck("css.boxmodel")) {
        this._checks["css.boxmodel"] = qx.bom.client.Css.getBoxModel;
      }
    }
  },


  defer : function(statics) {
    // create default values for the environment class
    statics._initDefaultQxValues();
    // first initialize the defined checks
    statics._initChecksMap();
    // load the checks from the generator
    statics.__importFromGenerator();
    // load the checks from the url
    if (statics.get("qx.allowUrlSettings") != true) {
      statics.__importFromUrl();
    }
  }
});