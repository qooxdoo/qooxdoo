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

#module(oo)
#module(core)
#require(qx.Clazz)

************************************************************************ */

qx.Clazz.define("qx.Mixin",
{
  statics :
  {
    /**
     * Registers all defined Mixins
     */
    registry : {},


    /**
     * Mixin config
     *
     * Example:
     * <pre>
     * qx.Mixin.define("name",
     * {
     *   "includes": [SuperMixins],
     *
     *   "properties": {
     *     "tabIndex": {type: "number", init: -1}
     *   },
     *
     *   "members":
     *   {
     *     prop1: "foo",
     *     meth1: function() {},
     *     meth2: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String} name of the mixin
     * @param config {Map} config structure
     * @return {void}
     * @throws TODOC
     */
    define : function(name, config)
    {
      var key, value;
      var extend, properties = {}, members = {};




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
              value = [value];
            }

            extend = value;
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
        Create Mixin
      ---------------------------------------------------------------------------
      */

      // Initialize object
      var obj = {};

      // Create namespace
      var basename = qx.Clazz.createNamespace(name, obj);

      // Add to registry
      qx.Mixin.registry[name] = obj;

      // Attach data fields
      obj.name = name;
      obj.basename = basename;
      obj.properties = properties;
      obj.members = members;





      /*
      ---------------------------------------------------------------------------
        Extend Mixin
      ---------------------------------------------------------------------------
      */

      if (extend)
      {
        var emembers, eproperties;

        if (qx.DEBUG) {
          arguments.callee.statics.compatible(extend, 'extend list in Mixin "' + name + '".');
        }

        for (var i=0, l=extend.length; i<l; i++)
        {
          // Attach members
          emembers = extend[i].members;
          for (key in emembers) {
            members[key] = emembers[key];
          }

          // Attach members
          eproperties = extend[i].properties;
          for (key in eproperties) {
            properties[key] = eproperties[key];
          }
        }
      }
    },


    /**
     * Determine if Mixin exists
     *
     * @param name {String} Mixin name to check
     * @return {Boolean} true if Mixin exists
     */
    isDefined : function(name) {
      return arguments.callee.statics.byName(name) !== undefined;
    },


    /**
     * Checks a list of Mixins for conflicts.
     *
     * @param list {Array} List of Mixins
     */
    compatible : function(list, msg)
    {
      // Preflight check to test for double-definitions
      if (list.length > 1)
      {
        var kmembers = {};
        var kproperties = {};

        for (var i=0, l=list.length; i<l; i++)
        {
          // Check members
          emembers = list[i].members;
          for (key in emembers)
          {
            if (key in kmembers) {
              throw new Error('Double defintion of member "' + key + '" through ' + msg);
            }

            kmembers[key] = true;
          }

          // Check properties
          eproperties = list[i].properties;
          for (key in eproperties)
          {
            if (key in kproperties) {
              throw new Error('Double defintion of property "' + key + '" through ' + msg);
            }

            kproperties[key] = true;
          }
        }
      }
    }
  }
});
