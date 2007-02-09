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
    registry : {},

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
      var key, value;
      var extend, blacklist = {}, statics = {}, members = {}, properties;




      /*
      ---------------------------------------------------------------------------
        Read in configuration map
      ---------------------------------------------------------------------------
      */

      for (key in config)
      {
        value = config[key];

        if (value == null) {
          throw new Error("Invalid key '" + key + "' in class '" + name + "'! The value is undefined/null!");
        }

        switch(key)
        {
          case "extend":
            // Normalize to Array
            if (!(value instanceof Array)) {
              value = [ value ];
            }

            extend = value;
            break;

          case "statics":
            statics = value;
            break;
            
          case "properties":
            properties = value;
            break;

          case "members":
            members = value;
            break;

          default:
            throw new Error("The configuration key '" + key + "' in class '" + name + "' is not allowed!");
        }
      }




      /*
      ---------------------------------------------------------------------------
        Create Interface
      ---------------------------------------------------------------------------
      */

      // Initialize object
      var obj = {};

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, obj);

      // Add to registry
      qx.Interface.registry[name] = obj;

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
            var getterName = "get" + qx.OO.toFirstUp(key);
            var setterName = "set" + qx.OO.toFirstUp(key);
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
          for (key in statics)
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

          for (key in eblacklist) {
            blacklist[key] = true;
          }

          // Copy members (instance verification)
          emembers = extend[i].members;

          for (key in emembers) {
            members[key] = emembers[key];
          }
        }

        // Separate loop because we must
        // be sure that the blacklist is correct
        // before proceding with copying of statics
        for (var i=0, l=extend.length; i<l; i++)
        {
          estatics = extend[i].statics;

          // Copy constants etc.
          for (key in estatics)
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
      return arguments.callee.statics.byName(name) !== undefined;
    }
    
  }
});
