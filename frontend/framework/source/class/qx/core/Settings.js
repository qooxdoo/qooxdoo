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
#require(qx.core.Bootstrap)
#ignore(auto-require)
#ignore(auto-use)

************************************************************************ */

qx.Clazz.define("qx.core.Settings",
{
  statics :
  {
    /** Define the defaults */
    __settings : {},

    /**
     * Get setting by key
     *
     * @type static
     * @name get
     * @access public
     * @param key {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
     */
    get : function(key)
    {
      if (qx.core.Variant.select("qx.debug", "on"))
      {
        if (typeof this.__settings[key] === "undefined") {
          throw new Error('Setting key "' + key + '" does not exist!');
        }
      }

      return this.__settings[key];
    },

    /**
     * Set a value if not yet defined. This is only
     * useful to setup defaults.
     *
     * @type static
     * @name set
     * @access public
     * @param key {String} Unique key
     * @param value {var} Any value supported by JavaScript
     * @return {void}
     * @throws TODOC
     */
    set : function(key, value)
    {
      if (qx.core.Variant.select("qx.debug", "on"))
      {
        if ((key.split(".")).length !== 2) {
          throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
        }
      }

      if (typeof this.__settings[key] === "undefined") {
        this.__settings[key] = value;
      }
    },

    /**
     * Import settings from global qxsettings into current environment
     *
     * @type static
     * @name init
     * @access public
     * @return {void}
     */
    init : function()
    {
      if (window.qxsettings)
      {
        for (var key in qxsettings)
        {
          if ((key.split(".")).length !== 2) {
            throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
          }
          this.__settings[key] = qxsettings[key];
        }

        delete window.qxsettings;
      }
    }
  }
});

qx.core.Settings.init();
