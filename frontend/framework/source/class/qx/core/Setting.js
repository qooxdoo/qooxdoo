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

qx.Clazz.define("qx.core.Setting",
{
  statics :
  {
    /** {var} TODOC */
    __settings : {},

    /**
     * Define a setting
     *
     * @type static
     * @name define
     * @access public
     * @param key {var} TODOC
     * @param allowedValues {var} TODOC
     * @return {void}
     * @throws TODOC
     */
    define : function(key, defaultValue)
    {
      if (defaultValue == undefined) {
        throw new Error('Default value of setting "' + key + '" must be defined!');
      }

      if (!this.__settings[key]) {
        this.__settings[key] = {};
      } else if (this.__settings[key].defaultValue !== undefined) {
        throw new Error('Setting "' + key + '" is already defined!');
      }

      this.__settings[key].defaultValue = defaultValue;
    },

    /**
     * TODOC
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
      if (this.__settings[key] == undefined) {
        throw new Error('Setting "' + key + '" is not defined.');
      }

      if (this.__settings[key].defaultValue == undefined) {
        throw new Error('Setting "' + key + '" is not supported by API.');
      }

      return this.__settings[key].value || this.__settings[key].defaultValue;
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

          if (!this.__settings[key]) {
            this.__settings[key] = {};
          }

          this.__settings[key].value = qxsettings[key];
        }

        window.qxsettings = null;
      }
    }
  }
});

qx.core.Setting.init();
qx.core.Setting.define("qx.version", "0.0");
