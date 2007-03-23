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

/**
 * This class is used to define interfaces.
 *
 * To define a new interface the {@link #define} method is used.
 */
qx.Class.define("qx.Interface",
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
     * For properties only the names are required so the value of the properties
     * can be empty maps.
     *
     * Example:
     * <pre>
     * qx.Interface.define("name",
     * {
     *   extend: [SuperInterfaces],
     *
     *   statics:
     *   {
     *     PI : 3.14,
     *     staticMethod: function(z) { return typeof z == "string"; }
     *   },
     *
     *   properties: {"color": {}, "name": {} },
     *
     *   members:
     *   {
     *     meth1: function() { return true; },
     *     meth2: function(a, b) { return arguments.length == 2; },
     *     meth3: function(c) { return qx.Interface.hasInterface(c, qx.some.IInterface); }
     *   },
     *
     *   events :
     *   {
     *     keydown : qx.event.type.KeyEvent
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
     *     <tr><th>statics</th><td>Map</td><td>
     *         Map of statics of the interface. The statics will not get copied into the target class.
     *         This is the same behaviour as statics in Mixins ({@link qx.Mixin#define}).
     *     </td></tr>
     *     <tr><th>properties</th><td>Map</td><td>Map of properties.</td></tr>
     *   </table>
     */
    define : function(name, config)
    {
      if (config)
      {
        // Normalize include
        if (config.extend && !(config.extend instanceof Array)) {
          config.extend = [config.extend];
        }

        // Validate incoming data
        if (qx.core.Variant.isSet("qx.debug", "on")) {
          this.__validateConfig(name, config);
        }

        // Create Interface from statics
        var iface = config.statics ? config.statics : {};

        // Attach configuration
        if (config.extend) {
          iface.$$extends = config.extend;
        }

        if (config.properties) {
          iface.$$properties = config.properties;
        }

        if (config.members) {
          iface.$$members = config.members;
        }

        if (config.events) {
          iface.$$events = config.events;
        }
      }
      else
      {
        // Create empty Interface
        var iface = {};
      }

      // Add Basics
      iface.$$type = "Interface";
      iface.name = name;

      // Attach toString
      iface.toString = this.genericToString;

      // Assign to namespace
      iface.basename = qx.Class.createNamespace(name, iface);

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
     * Determine the number of interfaces which are defined
     *
     * @type static
     * @return {Number} the number of classes
     */
    getNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
    },


    /**
     * Generates a list of all interfaces given plus all the
     * interfaces these extends plus... (deep)
     *
     * @param ifaces {Interface[] ? []} List of interfaces
     * @returns {Array} List of all interfaces
     */
    flatten : function(ifaces)
    {
      if (!ifaces) {
        return [];
      }

      // we need to create a copy and not to modify the existing array
      var list = ifaces.concat();

      for (var i=0, l=ifaces.length; i<l; i++)
      {
        if (ifaces[i].$$extends) {
          list.push.apply(list, this.flatten(ifaces[i].$$extends));
        }
      }

      // console.log("Flatten: " + ifaces + " => " + list);

      return list;
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
    assert : function(clazz, iface, wrap)
    {
      // Validate members
      var members = iface.$$members;
      if (members)
      {
        var proto = clazz.prototype;

        for (var key in members)
        {
          if (typeof members[key] === "function")
          {
            if (typeof proto[key] !== "function") {
              throw new Error('Implementation of method "' + key + '" is missing in class "' + clazz.classname + '" required by interface "' + iface.name + '"');
            }

            // Only wrap members if the interface was not applied yet which could be easily
            // checked by the recursive hasInterface method.
            if (wrap === true && !qx.Class.hasInterface(clazz, iface)) {
              proto[key] = this.__wrapInterfaceMember(iface, proto[key], key, members[key]);
            }
          }
          else
          {
            // Other members are not checked more detailed because of
            // JavaScript's loose type handling
            if (typeof proto[key] === undefined)
            {
              if (typeof proto[key] !== "function") {
                throw new Error('Implementation of member "' + key + '" is missing in class "' + clazz.classname + '" required by interface "' + iface.name + '"');
              }
            }
          }
        }
      }

      // Validate properties
      if (iface.$$properties)
      {
        for (var key in iface.$$properties)
        {
          if (!qx.Class.hasProperty(clazz, key)) {
            throw new Error('The property "' + key + '" is not supported by Class "' + clazz.classname + '"!');
          }
        }
      }

      // Validate events
      if (iface.$$events)
      {
        for (var key in iface.$$events)
        {
          if (!qx.Class.supportsEvent(clazz, key)) {
            throw new Error('The event "' + key + '" is not supported by Class "' + clazz.classname + '"!');
          }
        }
      }

      // Validate extends, recursive
      var extend = iface.$$extends;
      if (extend)
      {
        for (var i=0, l=extend.length; i<l; i++) {
          this.assert(clazz, extend[i], wrap);
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all interface to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The interface identifier
     */
    genericToString : function() {
      return "[Interface " + this.name + "]";
    },


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
    __wrapInterfaceMember : function(iface, origFunction, functionName, preCondition)
    {
      function wrappedFunction()
      {
        if (!preCondition.apply(this, arguments)) {
          throw new Error('Pre condition of method "' + functionName + '" defined by "' + iface.name + '" failed.');
        }

        return origFunction.apply(this, arguments);
      }

      origFunction.wrapper = wrappedFunction;

      return wrappedFunction;
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
        // Validate keys
        var allowedKeys =
        {
          "extend"     : "object", // Interface | Interface[]
          "statics"    : "object", // Map
          "members"    : "object", // Map
          "properties" : "object", // Map
          "events"     : "object"  // Map
        };

        for (var key in config)
        {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error("Invalid key '" + key + "' in interface '" + name + "'! The value is undefined/null!");
          }

          if (typeof config[key] !== allowedKeys[key]) {
            throw new Error('Invalid type of key "' + key + '" in interface "' + name + '"! The type of the key must be "' + allowedKeys[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "statics", "members", "properties", "events" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in interface "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate extends
        if (config.extend)
        {
          for (var i=0, a=config.extend, l=a.length; i<l; i++)
          {
            if (a[i] == null) {
              throw new Error("Extends of interfaces must be interfaces. The extend number '" + i+1 + "' in interface '" + name + "' is undefined/null!");
            }

            if (a[i].$$type !== "Interface") {
              throw new Error("Extends of interfaces must be interfaces. The extend number '" + i+1 + "' in interface '" + name + "' is not an interface!");
            }
          }
        }

        // Validate statics
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
