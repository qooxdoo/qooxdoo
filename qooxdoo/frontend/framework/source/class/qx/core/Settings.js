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

qx.Clazz.define("qx.core.Settings",
{
  statics :
  {
    /**
     * Define the defaults
     */
    data : {},

    /**
     * Get setting by key
     */
    get : function(key)
    {
      if (qx.DEBUG)
      {
        if (typeof this.data[key] === "undefined") {
          throw new Error('Setting key "' + key + '" does not exist!');
        }
      }

      return this.data[key];
    },

    /**
     * Set a value if not yet defined. This is only
     * useful to setup defaults.
     *
     * @param key {String} Unique key
     * @param value {var} Any value supported by JavaScript
     */
    set : function(key, value)
    {
      if (qx.DEBUG)
      {
        if ((key.split(".")).length !== 2) {
          throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
        }
      }

      if (typeof this.data[key] === "undefined") {
        this.data[key] = value;
      }
    },

    /**
     * Import settings from global qxsettings into current environment
     */
    init : function()
    {
      if (window.qxsettings)
      {
        for (var key in qxsettings)
        {
          if (qx.DEBUG)
          {
            if ((key.split(".")).length !== 2) {
              throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
            }
          }

          this.data[key] = qxsettings[key];
        }

        delete window.qxsettings;
      }
    }
  }
});

qx.core.Settings.init();
