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
      // engine version
      if (this.useCheck("engine.version")) {
        this.__checks["engine.version"] = qx.bom.client.Engine.getVersion;
      }
      // engine name
      if (this.useCheck("engine.name")) {
        this.__checks["engine.name"] = qx.bom.client.Engine.getName;        
      }
      
      // browser name
      if (this.useCheck("browser.name")) {
        this.__checks["browser.name"] = qx.bom.client.Browser.getName;   
      }
      // browser version
      if (this.useCheck("browser.version")) {
        this.__checks["browser.version"] = qx.bom.client.Browser.getVersion;        
      }
    }
  },


  defer : function(statics) {
    statics.__initChecksMap();
  }
});