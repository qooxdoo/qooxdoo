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
    
    
    useCheck : function(key) {
      return true;
    },
    

    
    __initChecksMap : function() {
      // /////////////////////////////////////////
      // Engine 
      // /////////////////////////////////////////      
      // engine version
      if (this.useCheck("engine.version")) {
        this.__checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      // engine name
      if (this.useCheck("engine.name")) {
        this.__checks["engine.name"] = qx.bom.client.Engine.getName;        
      }

      // /////////////////////////////////////////
      // Browser
      // /////////////////////////////////////////
      // browser name
      if (this.useCheck("browser.name")) {
        this.__checks["browser.name"] = qx.bom.client.Browser.getName;   
      }
      // browser version
      if (this.useCheck("browser.version")) {
        this.__checks["browser.version"] = qx.bom.client.Browser.getVersion;        
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
            
      // /////////////////////////////////////////
      // CSS
      // /////////////////////////////////////////
      if (this.useCheck("css.textoverflow")) {
        this.__checks["css.textoverflow"] = qx.bom.client.CssFeature.getTextOverflow;        
      }

      if (this.useCheck("css.placeholder")) {
        this.__checks["css.placeholder"] = qx.bom.client.CssFeature.getPlaceholder;        
      }

      if (this.useCheck("css.borderraidus")) {
        this.__checks["css.borderraidus"] = qx.bom.client.CssFeature.getBorderRadius;        
      }

      if (this.useCheck("css.boxshadow")) {
        this.__checks["css.boxshadow"] = qx.bom.client.CssFeature.getBoxShadow;        
      }

      if (this.useCheck("css.gradients")) {
        this.__checks["css.gradients"] = qx.bom.client.CssFeature.getGradients;        
      }

      if (this.useCheck("css.pointerevents")) {
        this.__checks["css.pointerevents"] = qx.bom.client.CssFeature.getPointerEvents;
      }
    }
  },


  defer : function(statics) {
    statics.__initChecksMap();
  }
});