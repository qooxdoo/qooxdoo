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
     * Fabian Jakobs (fjakobs)

   ======================================================================

   This class uses ideas and code snipplets presented at
   <http://webreflection.blogspot.com/2008/05/habemus-array-unlocked-length-in-ie8.html>

   Author:
       Andrea Giammarchi

   License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * This class may be used to declare classes for array-like data structures.
 * Useful to create queues, string builders, etc.
 *
 * @deprecated Use qx.Class.define() instead and derive from qx.type.BaseArray
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
      qx.log.Logger.deprecatedClassWarning(
        this, "Use qx.Class.define() instead and derive from qx.type.BaseArray"
      );

      if (!config) {
        var config = {};
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      function clazz(length)
      {
        if (arguments.length == 1 && typeof(length) == "number")
        {
          var isInteger = (length % 1 === 0);
          if (length > 0 && isInteger) {
            this.length = length;
          } else {
            this.length = this.push(arguments[0]);
          }
        }
        else if (arguments.length)
        {
          this.push.apply(this, arguments);
        }
      }

      var Array = function() {};
      Array.prototype = [];

      clazz.prototype = new Array();

      var proto = clazz.prototype;

      // In IE don't inherit Array but use an empty object as prototype
      // and copy the methods from Array
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        clazz.prototype = {
          $$isArray: true
        };
        var proto = clazz.prototype;
        var methodNames = [
          "pop", "push", "reverse", "shift", "sort", "splice",
          "unshift", "join", "slice"
        ];
        for (var i=0; i<methodNames.length; i++)
        {
          var methodName = methodNames[i];
          proto[methodName] = window.Array.prototype[methodName];
        }
      }

      proto.length = 0;
      proto.constructor = clazz;

      proto.toString = proto.join;
      proto.toLocaleString = this.__toLocaleString;
      clazz.prototype.concat = this.__concat;

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


    /**
     * Reimplement toLocaleString method
     */
    __toLocaleString : function() {
      return this.slice(0).toLocaleString();
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
