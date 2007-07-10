/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(client)
#require(qx.html2.client.Engine)
#require(qx.html2.client.Features)
#require(qx.html2.client.Platform)

************************************************************************ */

qx.Class.define("qx.html2.client.Select",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */  
  
  statics :
  {
    /** 
     * Whether the given key evaluates to <code>true</code>
     * 
     * @type static
     * @param key {String} A valid expression
     * @throws an error if the key could not be parsed or evaluated
     * @return {Boolean} The evaluated value of the given key
     */
    isSet : function(key)
    {
      var cache = this.__cache;
      
      if (cache[key]!==undefined) {
        return cache[key]; 
      }
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {        
        if (/^[a-z0-9_\(\),\|<>=\.]+$/.exec(key) == null) {
          throw new Error("Could not parse key: " + key); 
        }
      }
      
      var code = key.replace(/,/g, "&&").replace(/\|/g, "||").replace(/\b([a-z][a-z0-9_]+)\b/g, "this.__active.$1");
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {        
        try
        {
          if (cache[key] = !!eval(code)) {
            return true;   
          }
        }
        catch(ex) 
        {
          throw new Error('Could not evaluate key: "' + key + '" (' + code + ')'); 
        }
      }
      else
      {
        if (cache[key] = !!eval(code)) {
          return true;   
        }          
      }
      
      return false;      
    },
    
    
    /**
     * Selects from a map of keys the first which evaluates to <code>true</code>. It works
     * like a long <code>OR</code> expression, the first enabled entry wins.
     *
     * @type static
     * @param map {Map} A map where the key is an expression.
     * @return {var} The first key which evaluates to <code>true</code>
     * @throws an exception if none of the given keys evaluates to <code>true</code>
     */
    select : function(map)
    {
      var code;
      
      for (var key in map)
      {
        if (this.isSet(key)) {
          return map[key]; 
        }
      }
      
      if (map["default"] !== undefined) {
        return map["default"];
      }
      
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        throw new Error('No match for selection in map [' + qx.lang.Object.getKeysAsString(map) +
          '] found, and no default ("default") given');
      }
    },
    
    
    /** Internal map which stores the evaluated value for each already evaluated key */
    __cache : {
      "default" : false  
    },
    
    
    /** Internal data structures with all flags or numeric value which should be available in expressions */
    __keys : 
    {
      Engine : [ "OPERA", "KHTML", "WEBKIT", "WEBKIT419", "WEBKIT420", "GECKO",
        "GECKO17", "GECKO18", "GECKO181", "GECKO19", "MSHTML", "MSHTML6", "MSHTML7", "VERSION" ],
      Features : [ "STANDARD_MODE", "QUIRKS_MODE", "CONTENT_BOX", "BORDER_BOX", "SVG", "CANVAS", "VML", "XPATH" ],
      Platform : [ "WIN", "MAC", "UNIX" ]
    },
    

    /** Internal data strucure which contains all enabled flags and numeric values of the __keys structure */
    __active : {},
    
    
    /** Automatically fills the __active map from the information of the __keys map */
    __init : function()
    {
      var keys = this.__keys;
      var prop;
      var value;
      
      for (var main in keys)
      {
        for (var i=0, a=keys[main], l=a.length; i<l; i++) 
        {
          prop = a[i];
          value = qx.html2.client[main][prop];
          
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (value === undefined) {
              throw new Error("Unknown property: " + prop); 
            }
            
            if (!(typeof value === "boolean" || typeof value === "number")) {
              throw new Error("Invalid value in property: " + prop + "! Must be boolean or number!");
            }
          }
          
          if (value !== false) {
            this.__active[prop.toLowerCase()] = value; 
          }
        }
      }
    }
  },
  
  
  
  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */  
  
  defer : function(statics) {
    statics.__init(); 
  }  
});
