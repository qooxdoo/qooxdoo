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
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

qx.Clazz.define("qx.Interface",
{
  statics :
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new interface. Interface definitions look much like class definitions. The
     * main difference is that the function body of functions defined in <code>members</code>
     * and <code>statics</code> are treated as preconditions the the methods
     * implementing the interface. These are typically used for parameter checks.
     *
     * Primitive statics written all uppercase are copied into the classes implementing
     * the interface.
     *
     * For properties only the names are required so the value of the properties
     * can be empty maps.
     *
     * Example:
     * <pre>
     * qx.Interface.define("name",
     * {
     *   extend: [SuperInterfaces],
     *
     *   statics: {
     *     PI : 3.14,
     *     staticMethod: function(z) { return typeof(z) == "string"; }
     *   },
     *
     *   properties: {"color": {}, "name": {} },
     *
     *   members:
     *   {
     *     meth1: function() { return true; },
     *     meth2: function(a, b) { return arguments.length == 2; },
     *     meth3: function(c) { return qx.Interface.hasInterface(c, qx.some.IInterface); }
     *   }
     * });
     * </pre>
     *
     * @type static
     * @param name {String} name of the interface
     * @param config {Map ? null} Interface definition structure. The configuration map has the following keys:
     *   <table>
     *     <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *     <tr><th>extend</th><td>Class</td><td>The interfaces this interface inherits from.</td></tr>
     *     <tr><th>members</th><td>Map</td><td>Map of members of the interface.</td></tr>
     *     <tr><th>statics</th><td>Map</td><td>Map of statics of the interface.</td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of properties.</td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (config)
      {
        // Validate incoming data
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          this.__validateConfig(name, config);
        }

        // Create Interface from statics
        var iface = config.statics ? config.statics : {};

        // Attach configuration
        if (config.extend) {
          iface.extend = config.extend;
        }
        if (config.properties) {
          iface.properties = config.properties;
        }
        if (config.members) {
          iface.members = config.members;
        }
      }
      else
      {
        // Create empty Interface
        var iface = {};
      }

      // Add basics
      iface.isInterface = true;
      iface.name = name;

      // Assign to namespace
      iface.basename = qx.Clazz.createNamespace(name, iface);

      // Add to registry
      qx.Interface.__registry[name] = iface;

      // Return final Interface
      return iface;
    },


    /**
     * Returns a Interface by name
     *
     * @type static
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Determine if Interface exists
     *
     * @type static
     * @param name {String} Interface name to check
     * @return {Boolean} true if Interface exists
     */
    isDefined : function(name) {
      return arguments.callee.self.getByName(name) !== undefined;
    },


    /**
     * Whether a given class includes a interface.
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasOwnInterface : function(clazz, iface)
    {
      if (!clazz.$$implements) {
        return false;
      }

    	return clazz.$$implements[iface.name] ? true : false;
    },


    /**
     * Whether a given class includes a interface (recursive).
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasInterface : function(clazz, iface)
    {
      if (!clazz.$$implements) {
        return false;
      }

      if (clazz.$$implements[iface.name]) {
        return true;
      }

      for (var key in clazz.$$implements)
      {
        if (qx.Interface.hasInterface(clazz, clazz.$$implements[key])) {
          return true;
        }
      }

      return false;
    },


    /**
     * Wether a given class conforms to an interface (included or not)
     *
     * @type static
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    implementsInterface : function(clazz, iface)
    {
      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      try
      {
        this.assertInterface(clazz, iface);
        return true;
      }
      catch(ex)
      {
        return false;
      }
    },


    /**
     * Checks if a interface is implemented by a class
     *
     * @type static
     * @param clazz {Class} class to check interface for
     * @param iface {Interface} the Interface to verify
     * @param wrap {Boolean ? false} wrap functions required by interface to check parameters etc.
     * @return {void}
     */
    assertInterface : function(clazz, iface, wrap)
    {
      // Check extends, recursive
      var extend = iface.extend;
      if (extend)
      {
        if (extend.isInterface)
        {
          this.implementsInterface(clazz, extend);
        }
        else
        {
          for (var i=0, l=extend.length; i<l; i++) {
            this.implementsInterface(clazz, extend[i]);
          }
        }
      }

      // Validate members
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var members = iface.members;
        if (members)
        {
          var proto = clazz.prototype;

          for (var key in members)
          {
            if (typeof members[key] === "function")
            {
              if (typeof proto[key] !== "function") {
                throw new Error('Implementation of method "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + iface.name + '"');
              }

              if (wrap === true) {
                proto[key] = this.__wrapInterfaceMember(iface.name, proto[key], key, members[key]);
              }
            }
            else
            {
              // Other members are not checked more detailed because of
              // JavaScript's loose type handling
              if (typeof proto[key] === undefined)
              {
                if (typeof proto[key] !== "function") {
                  throw new Error('Implementation of member "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + iface.name + '"');
                }
              }
            }
          }
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTIONS AND DATA
    ---------------------------------------------------------------------------
    */

    /** Registry of all defined interfaces */
    __registry : {},


    /**
     * Wrap a method with a precondition check.
     *
     * @param ifaceName {String} Name of the interface, where the pre condition
     *   was defined. (Used in error messages).
     * @param origFunction {Function} function to wrap.
     * @param functionName {String} name of the function. (Used in error messages).
     * @param preCondition {Fucntion}. This function gets called with the arguments of the
     *   original function. If this fucntion return true the original function is called.
     *   Otherwhise an exception is thrown.
     * @return {Function} wrapped function
     */
    __wrapInterfaceMember : function(ifaceName, origFunction, functionName, preCondition)
    {
      return function()
      {
        if (!preCondition.apply(this, arguments)) {
          throw new Error('Pre condition of method "' + functionName + '" defined by "' + ifaceName + '" failed.');
        }

        return origFunction.apply(this, arguments);
      }
    },


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig : function(name, config)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var allowedKeys =
        {
          "extend"     : 1, // Interface | Interface[]
          "statics"    : 1, // Map
          "members"    : 1, // Map
          "properties" : 1  // Map
        }

        for (var key in config)
        {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error("Invalid key '" + key + "' in interface '" + name + "'! The value is undefined/null!");
          }
        }

        // Check extends
        if (config.extend && config.extend instanceof Array)
        {
          for (var i=0; i<config.extend.length; i++)
          {
            if (!config.extend[i]) {
              throw new Error("The extend number '" + i+1 + "' in interface '" + name + "' is undefined!");
            }
          }
        }

        // Check statics
        if (config.statics)
        {
          for (var key in config.statics)
          {
            if (key.toUpperCase() !== key) {
              throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all uppercase.');
            }

            switch(typeof config.statics[key])
            {
              case "boolean":
              case "string":
              case "number":
                break;

              default:
                throw new Error('Invalid key "' + key + '" in interface "' + name + '"! Static constants must be all of a primitive type.')
            }
          }
        }
      }
    }
  }
});
