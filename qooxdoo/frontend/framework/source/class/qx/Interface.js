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
    /** Registers all defined interfaces */
    __registry : {},

    /**
     * Interface config
     *
     * Example:
     * <pre>
     * qx.Interface.define("name",
     * {
     *   extend: [SuperInterfaces],
     *
     *   statics: {
     *     PI : 3.14
     *   }
     *
     *   members:
     *   {
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </pre>
     *
     * @type static
     * @name define
     * @access public
     * @param name {String} name of the interface
     * @param config {Map} config structure
     * @return {void}
     * @throws TODOC
     */
    define : function(name, config)
    {

      /*
      ---------------------------------------------------------------------------
        Verify in configuration map
      ---------------------------------------------------------------------------
      */

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
            throw new Error("Invalid key '" + key + "' in class '" + name + "'! The value is undefined/null!");
          }
        }
      }


     /*
      ---------------------------------------------------------------------------
        Initialize aliases
      ---------------------------------------------------------------------------
      */

      var extend = config.extent;
    	if (extend && !(extend instanceof Array)) {
      	extend = [ extend ];
     	}

      var statics = config.statics || {};
      var members = config.members || {};
      var properties = config.properties;

      var blacklist = {};


      /*
      ---------------------------------------------------------------------------
        Create Interface
      ---------------------------------------------------------------------------
      */

      // Initialize object
      var obj = {};

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, obj, false);

      // Add to registry
      qx.Interface.__registry[name] = obj;

      // Attach data fields
      obj.name = name;
      obj.basename = basename;
      obj.blacklist = blacklist;
      obj.statics = statics;
      obj.members = members;


      /*
      ---------------------------------------------------------------------------
        Process properties
      ---------------------------------------------------------------------------
      */

      // properties are only checked in source builds
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        if (properties) {
          for (var key in properties) {
            var getterName = "get" + qx.lang.String.toFirstUp(key);
            var setterName = "set" + qx.lang.String.toFirstUp(key);
            obj.members[getterName] = new Function();
            obj.members[setterName] = new Function();
          }
        }
      }


      /*
      ---------------------------------------------------------------------------
        Validate local statics
      ---------------------------------------------------------------------------
      */

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




      /*
      ---------------------------------------------------------------------------
        Interfaces to extend from
      ---------------------------------------------------------------------------
      */

      if (extend)
      {
        var eblacklist, emembers, estatics;

        for (var i=0, l=extend.length; i<l; i++)
        {
          // Combine blacklist
          eblacklist = extend[i].blacklist;

          for (var key in eblacklist) {
            blacklist[key] = true;
          }

          // Copy members (instance verification)
          emembers = extend[i].members;

          for (var key in emembers) {
            members[key] = emembers[key];
          }
        }

        // Separate loop because we must
        // be sure that the blacklist is correct
        // before proceding with copying of statics
        for (var i=0, l=extend.length; i<l; i++)
        {
          var estatics = extend[i].statics;

          // Copy constants etc.
          for (var key in estatics)
          {
            if (key in blacklist) {
              continue;
            }

            // Already in? Mark it in the blacklist and delete old entry
            if (key in statics)
            {
              delete statics[key];
              blacklist[key] = true;
              continue;
            }

            // Finally copy entry
            statics[key] = estatics[key];
          }
        }
      }
    },


    /**
     * Determine if Interface exists
     *
     * @type static
     * @name isDefined
     * @access public
     * @param name {String} Interface name to check
     * @return {Boolean} true if Interface exists
     */
    isDefined : function(name) {
      return arguments.callee.self.byName(name) !== undefined;
    },


    /**
     * Whether a given class implements an interface.
     *
     * @param clazz {Class} class to check
     * @param vInterface {Interface} the interface to check for
     * @return {Boolean} whether the class implements the interface
     */
    hasInterface: function(clazz, vInterface)
    {
      var clazz = clazz.constructor || clazz;

      try {
        this.assertInterface(clazz, vInterface, false);
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
     * @param wrap {Boolean?true} whether the class chould be extended with precondition checks
     *   from the interfaces.
     */
    assertInterface: function(clazz, vInterface, wrap)
    {
      if (!clazz.$$IMPLEMENTS) {
        clazz.$$IMPLEMENTS = {};
      }

      // check whether the interface is in the registry of the class
      if (clazz.$$IMPLEMENTS[vInterface.name]) {
        return true;
      }


      // do the full check

      // Validate members
      var interfaceMembers = vInterface.members;
      var prot = clazz.prototype;

      for (var key in interfaceMembers)
      {
        if (typeof prot[key] != "function") {
          throw new Error('Implementation of method "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + vInterface.name + '"');
        }
        if (wrap && typeof(interfaceMembers[key]) == "function") {
          prot[key] = this.__wrapFunctionWithPrecondition(vInterface.name, prot[key], key, interfaceMembers[key]);
        }
      }

      // Validate statics
      var interfaceStatics = vInterface.statics;
      for (var key in interfaceStatics)
      {
        if (typeof(interfaceStatics[key]) == "function") {
          if (typeof clazz[key] != "function") {
            throw new Error('Implementation of static method "' + key + '" is missing in Class "' + clazz.classname + '" required by interface "' + vInterface.name + '"');
          }
          if (wrap) {
            clazz[key] = this.__wrapFunctionWithPrecondition(vInterface.name, clazz[key], key, interfaceStatics[key]);
          }
        }
      }

      clazz.$$IMPLEMENTS[vInterface.name] = vInterface;
    },


    /**
     * Wrap a method with a precondition check.
     *
     * @param method {Function} function to wrap.
     * @param name {String} name of the function. (Used in error messages).
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
    }
  }
});
