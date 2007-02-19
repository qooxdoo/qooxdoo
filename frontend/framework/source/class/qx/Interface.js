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
      if (!config) {
        var config = {};
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      var iface = this.__createInterface(name, config);

      this.__processProperties(iface, config.properties);
      this.__checkStatics(name, iface.statics);
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
     * Whether a given class implements an interface.
     *
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class implements the interface
     */
    hasInterface: function(clazz, iface)
    {
      var clazz = clazz.constructor || clazz;

      try {
        this.assertInterface(clazz, iface, false);
      } catch (e) {
        return false;
      }

      return true;
    },


    /**
     * Assert that the given class implements an interface. If the class doesn't implement
     * the interface an exception is thrown. This method can optionally wrap the interface
     * methods of the class with precondition checks from the interface.
     *
     * @param clazz {Class} class to check
     * @param vInterface {Interface} the interface the class must implement
     * @param wrap {Boolean?true} whether the class should be extended with precondition checks
     *   from the interfaces.
     */
    assertInterface: function(clazz, vInterface, wrap)
    {
      if (!clazz.$$implements) {
        clazz.$$implements = {};
      }

      // check whether the interface is in the registry of the class
      if (clazz.$$implements[vInterface.name]) {
        return true;
      }

      // do the full check

      // Validate members
      var prot = clazz.prototype;

      this.__membersIterator(vInterface, function(key, member) {
        if (typeof prot[key] != "function") {
          throw new Error('Implementation of method "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + vInterface.name + '"');
        }
        if (wrap && typeof(member) == "function") {
          prot[key] = qx.Interface.__wrapFunctionWithPrecondition(vInterface.name, prot[key], key, member);
        }
      });

      // Validate statics
      this.__staticsIterator(vInterface, function(key, vStatic) {
        if (typeof vStatic == "function") {
          if (typeof clazz[key] != "function") {
            throw new Error('Implementation of static method "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + vInterface.name + '"');
          }
          if (wrap) {
            clazz[key] = qx.Interface.__wrapFunctionWithPrecondition(vInterface.name, clazz[key], key, vStatic);
          }
        }
      });

      this.__extendsIterator(vInterface, function(iface) {
        clazz.$$implements[iface.name] = iface;      
      });
    },


    /**
     * Copy all primitive static fields of the interface (including inherited fields)
     * from the interface to the statics of the given class.
     * 
     * @param clazz {Class} Class to attach the statics to
     * @param iface {Interface} Interface to copy the statics from
     * @param forceOverwrite {Boolean?false} whether existing fields should be overwritten.
     */
    copyPrimitiveStaticFields: function(clazz, iface, forceOverwrite) 
    {
      this.__staticsIterator(iface, function(name, vStatic) {
        // Attach statics
        // Validation is done in qx.Interface
        if (typeof (vStatic) != "function") {
          if (!forceOverwrite && clazz[name]) {
            throw new Error('Overwriting static member "' + name + '" of Class "' + clazz.classname + '" by interface "' + iface.name + '" is not allowed!');            
          }
          clazz[name] = vStatic;
        }
      });
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
     * @param interfaceName {String} Name of the interface, where the pre condition
     *   was defined. (Used in error messages).
     * @param origFunction {Function} function to wrap.
     * @param functionName {String} name of the function. (Used in error messages).
     * @param preCondition {Fucntion}. This function gets called with the arguments of the
     *   original function. If this fucntion return true the original function is called.
     *   Otherwhise an exception is thrown.
     * @return {Function} wrapped function
     */
    __wrapFunctionWithPrecondition: function(interfaceName, origFunction, functionName, preCondition)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        return function()
        {
          if (!preCondition.apply(this, arguments)) {
            throw new Error('Pre condition of method "' + functionName + '" defined by "' + interfaceName + '" failed.');
          }

          return origFunction.apply(this, arguments);
        }
      }
      else
      {
        return origFunction;
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
        var allowedKeys = {
          "extend": 1,
          "statics": 1,
          "members": 1,
          "properties": 1
        }

        for (var key in config) {
          if (!allowedKeys[key]) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }
          if (config[key] == null) {
            throw new Error("Invalid key '" + key + "' in interface '" + name + "'! The value is undefined/null!");
          }

        }

        // check extends
        var extend = config.extend
        if (extend && extend instanceof Array)
        {
          for (var i=0; i<extend.length; i++)
          {
            if (!extend[i]) {
              throw new Error("The extend number '" + i+1 + "' in interface '" + name + "' is undefined!");
            }
          }
        }
      }
    },


    /**
     * Creates an interface.
     *
     * @param name {String} Full name of the interface
     * @param config {Map} Interface definition map
     * @return {Interface} The resulting interface
     */
    __createInterface : function(name, config)
    {
      // Initialize the interface
      var interf = config;

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, interf, false);

      // Add to registry
      qx.Interface.__registry[name] = interf;

      // Attach data fields
      interf.isInterface = true;
      interf.name = name;
      interf.basename = basename;
      interf.statics = interf.statics || {};
      interf.members = interf.members || {};

    	if (interf.extend && !(interf.extend instanceof Array)) {
       	interf.extend = [ interf.extend ];
     	}
      interf.extend = interf.extend || [];      

      return interf;
    },


    /**
     * Convert properties defined in the interface to checks for their
     * getter and setter.
     *
     * @param interf {Interface} The interface
     * @param properties {String[]} list of proerty names
     */
    __processProperties: function(interf, properties)
    {
      // properties are only checked in source builds
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        if (properties) {
          for (var key in properties) {
            var getterName = "get" + qx.lang.String.toFirstUp(key);
            var setterName = "set" + qx.lang.String.toFirstUp(key);
            interf.members[getterName] = interf.members[setterName] = function() { return true; };
          }
        }
      }
    },


    /**
     * Check the statics
     *
     * @param name {String} name of the interface
     * @param statics {Map} Map the the statics
     */
    __checkStatics: function(name, statics)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (statics)
        {
          for (var key in statics)
          {
            // The key should be uppercase by convention
            if (
              typeof(statics[key]) != "function" &&
              key.toUpperCase() !== key &&
              (statics[key] instanceof Object)) {
              throw new Error("Invalid key '" + key + "' in interface '" + name + "'! Static constants must be all uppercase and of type a primitive type.")
            }
          }
        }
      }
    },


    /**
     * Iterate over all members of the interface and it's inherited interfaces
     * 
     * @param iface {Interface} the Interface to iterate over
     * @param callback {Function} function(memberName, member) is called for every member
     */
    __membersIterator: function(iface, callback)
    {
      for (memberName in iface.members) {
        callback(memberName, iface.members[memberName]);
      }
      for (var i=0; i<iface.extend.length; i++) {
        this.__membersIterator(iface.extend[i], callback);
      }
    },
    

    /**
     * Iterate over all statics of the interface and it's inherited interfaces
     * 
     * @param iface {Interface} the Interface to iterate over
     * @param callback {Function} function(memberName, member) is called for every static
     */
    __staticsIterator: function(iface, callback)
    {
      for (staticName in iface.statics) {
        callback(staticName, iface.statics[staticName]);
      }
      for (var i=0; i<iface.extend.length; i++) {
        this.__staticsIterator(iface.extend[i], callback);
      }
    },
    

    /**
     * Call a callback on the interface and recursively all interfaces the interface extends.
     * 
     * @param iface {Interface} the Interface to iterate over
     * @param callback {Function} function(interface) is called for every interface
     */    
    __extendsIterator: function(iface, callback)
    {
      callback(iface);
      
      for (var i=0; i<iface.extend.length; i++) {
        this.__extendsIterator(iface.extend[i], callback);
      }
    }    

  }
});
