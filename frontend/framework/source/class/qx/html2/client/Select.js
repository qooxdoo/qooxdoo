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
  statics :
  {
    select : function(map)
    {
      var code;
      
      for (var key in map)
      {
        if (this.__cache[key]) {
          return map[key]; 
        }
        
        if (/^[a-z0-9_\(\),\|]+$/.exec(key) == null) {
          throw new Error("Could not parse key: " + key); 
        }
        
        code = key.replace(",", "&&").replace("|", "||").replace(/\b([a-z0-9_]+)\b/g, "this.__active.$1");
        
        if (this.__cache[key] = !!eval(code)) {
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
    
    __cache : 
    {
      "default" : false  
    },
    
    __keys : 
    {
      Engine : [ "OPERA", "KHTML", "WEBKIT", "WEBKIT419", "WEBKIT420", "GECKO",
        "GECKO17", "GECKO18", "GECKO181", "GECKO19", "MSHTML", "MSHTML6", "MSHTML7" ],
      Features : [ "STANDARD_MODE", "QUIRKS_MODE", "CONTENT_BOX", "BORDER_BOX", "SVG", "CANVAS", "VML", "XPATH" ],
      Platform : [ "WIN", "MAC", "UNIX" ]
    },
    
    __active : {},
    
    __init : function()
    {
      var keys = this.__keys;
      
      for (var main in keys)
      {
        for (var i=0, a=keys[main], l=a.length; i<l; i++) 
        {
          if (qx.html2.client[main][a[i]]) {
            this.__active[a[i].toLowerCase()] = true; 
          }
        }
      }
    }
  },
  
  defer : function(statics) {
    statics.__init(); 
  }  
});
