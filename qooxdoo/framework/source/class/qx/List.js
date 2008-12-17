/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This class may be used to declare classes for array-like data structures.
 * Useful to create queues, string builders, etc.
 */
qx.Bootstrap.define("qx.List",
{
  statics :
  {
    /**
     * Defines a new array-like data structure class.
     *
     * @param name {String} Name of the class
     * @param config {Map ? null} Class definition structure. The configuration
     *     map has the following keys:
     *     <table>
     *       <tr>
     *         <th>Name</th><th>Type</th><th>Description</th>
     *       </tr>
     *       <tr>
     *         <th>statics</th><td>Map</td>
     *         <td>Map of static members of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>members</th>
     *         <td>Map</td><td>Map of instance members of the class.</td>
     *       </tr>
     *       <tr>
     *         <th>defer</th><td>Function</td>
     *         <td>
     *           Function that is called at the end of processing the class
     *           declaration. It allows access to the declared statics, members
     *           and properties.
     *         </td>
     *       </tr>
     *     </table>
     * @return {void}
     */
    define : function(name, config)
    {
      if (!config) {
        var config = {};
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      // Create class
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        try
        {
          var html = new ActiveXObject("htmlfile");
          html.open();
          html.write("<html><script><" + "/script></html>");
          html.close();
  
          var clazz = html.parentWindow.Array
          var proto = clazz.prototype;
          
          proto.toArray = this.__toArray;
          proto.getLength = this.__getLength;
          
          // We need to keep the document referenced somewhere
          // otherwise IE will garbage collect it and throws
          // an "unexpected access" error.
          clazz.__html = html;          
        }
        catch (e)
        {
          delete(clazz.__html);
          
          var clazz = this.__createArrayWrapper();
          var proto = clazz.prototype;
        }
      }
      else
      {
        var clazz = function()
        {
          Array.call(this);
          this.push.apply(this, arguments);
        };

        clazz.prototype = new Array;
        var proto = clazz.prototype;
        
        // modify toString
        proto.toString = proto.join;
        proto.toLocaleString = proto.join;

        proto.toArray = this.__toArray;
        proto.getLength = this.__getLength;
        
        // need to reimplement concat since it does not work properly otherwise
        clazz.prototype.concat = this.__concat;         
      }

      // Create namespace
      var basename = qx.Bootstrap.createNamespace(name, clazz, false);



      // Attach data
      clazz.classname = name;
      proto.classname = name;
      proto.basename = clazz.basename = basename;
      
      // Modify toString on clazz
      clazz.toString = this.genericToString;
      
      // Attach statics
      var statics = config.statics;
      if (statics)
      {
        for (var key in statics) {
          clazz[key] = statics[key];
        }
      }

      // Attach members
      var members = config.members;
      if (members)
      {
        for (var key in members) {
          proto[key] = members[key];
        }
      }

      // Process defer
      if (config.defer)
      {
        config.defer.self = clazz;
        config.defer(clazz, proto);
      }

      // Store class reference in global class registry
      this.$$registry[name] = clazz;
    },

    
    __createArrayWrapper : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (this.__arrayWrapper) {
          return this.__arrayWrapper;
        }
        
        function createWrapperFunction(method) {
          return function() {
            return method.apply(this.__array, arguments);
          }
        }
        
        var ArrayWrapper = function() {
          this.__array = Array.prototype.slice.call(arguments, 0);
        };
        
        ArrayWrapper.prototype = {
          toArray : function() {
            return this.__array;
          },
          getLength : function() {
            return this.__array.length;
          }
        };
  
        var methods = [
          "concat",
          "join",
          "pop",
          "push",
          "reverse",
          "shift",
          "slice",
          "sort",
          "splice",
          "toLocaleString",
          "toString",
          "unshift"
        ]
        for (var i=0; i<methods.length; i++)
        {
          var name = methods[i];
          var method = Array.prototype[name];
          if (typeof method == "function") {
            ArrayWrapper.prototype[name] = createWrapperFunction(method);
          }
        }
              
        this.__arrayWrapper = ArrayWrapper;
        return ArrayWrapper;
      },
      
      "default": null
    }),
    

    /**
     * This method will be attached to all lists to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The interface identifier
     */
    genericToString : function() {
      return "[List " + this.classname + "]";
    },
    
    
    /**
     * Reimplementation of the concat method
     */
    __concat : function()
    {
      var copy = this.slice(0, this.length);
      return copy.concat.apply(copy, arguments);
    },
    
    
    __toArray : function() {
      return this;
    },
    
    
    __getLength : function() {
      return this.length;
    },
    

    /** Stores all defined classes */
    $$registry : qx.Bootstrap.$$registry,


    /** {Map} allowed keys in non-static class definition */
    __allowedKeys : qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "statics"    : "object",    // Map
        "members"    : "object",    // Map
        "defer"      : "function"   // Function
      },

      "default" : null
    }),


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     * @return {void}
     * @throws TODOC
     */
    __validateConfig : qx.core.Variant.select("qx.debug",
    {
      "on": function(name, config)
      {
        var allowed = this.__allowedKeys;
        for (var key in config)
        {
          if (allowed[key] === undefined) {
            throw new Error(
              'The configuration key "' + key + '" in list "' + name +
              '" is not allowed!'
            );
          }

          if (config[key] == null) {
            throw new Error(
              'Invalid key "' + key + '" in list "' + name +
              '"! The value is undefined/null!'
            );
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error(
              'Invalid type of key "' + key + '" in list "' + name +
              '"! The type of the key must be "' + allowed[key] + '"!'
            );
          }
        }
      },

      "default" : null
    })
  }
});
