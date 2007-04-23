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

/**
 * Manage settings for framework/application wide initial setup routines.
 *
 * *Background information*
 *
 * One of the major problem of JavaScript frameworks is that you, as the
 * user of such a framework, cannot easily control one of the initial
 * settings. For example the framework may have defaults which only can
 * be changed after the framework is loaded, but not before. Most of the
 * time this restriction is not problematic. Many stuff is just then
 * interesting when the application main gets processed. But there are
 * exceptions like things which must be configured at loadtime and not
 * after that.
 *
 * *What are settings?*
 *
 * This is where qooxdoo's new sophisticated settings system comes in.
 * And the best is that this feature is directly built into the core of
 * qooxdoo. This means that many intial settings are easily controlable
 * using a simple hash map structure or using simple generator flags.
 *
 * For example you can control the following things in qooxdoo:
 *
 * * All type of themes (colors, icons, widgets, appearance)
 * * Default log level and appender
 * * Resource-URLs of standard qooxdoo icons and widgets images
 * * Timeout of the image preloader
 * * The init component (graphical or non-graphical)
 * * Different debugging options for json, remote io, etc.
 *
 * This list shows you some of your possibilities.
 *
 * Also take a look at the documentation at:
 * http://qooxdoo.org/documentation/user_manual/settings
 *
 * *Usage*
 *
 * A setting generally should only store simple primitive types
 * like strings. Settings are not update-able. They do not fire events
 * and they do not inform depending objects. The best way to work with
 * settings is to "compile" them into the application code. This is easily
 * possible using the corresponding flags of the qooxdoo build system.
 *
 * At initialisation of this class all settings defined in the global
 * map <code>qxsettings</code> are imported. This map can also created
 * by hand and should be defined before loading qooxdoo. After the import
 * the settings system deletes the map.
 */
qx.Class.define("qx.core.Setting",
{
  statics :
  {
    /** {Map} Internal storage */
    __settings : {},


    /**
     * Define a new setting
     *
     * @type static
     * @param key {String} The key to store the value under
     * @param defaultValue {String|Boolean|Number} Primitive default value for the new setting
     * @return {void}
     * @throws an exception if the setting is already defined (overwriting is not allowed at all)
     */
    define : function(key, defaultValue)
    {
      if (defaultValue === undefined) {
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
     * Get the value of a previously defined setting
     *
     * @type static
     * @param key {String} The key where the data is stored under
     * @return {String|Boolean|Number} The primitive value stored for the given setting
     * @throws an exception is the setting does not exist or the default value was not assigned
     */
    get : function(key)
    {
      if (this.__settings[key] === undefined) {
        throw new Error('Setting "' + key + '" is not defined.');
      }

      if (this.__settings[key].defaultValue === undefined) {
        throw new Error('Setting "' + key + '" is not supported by API.');
      }

      return this.__settings[key].value || this.__settings[key].defaultValue;
    },


    /**
     * Import settings from global qxsettings into current environment
     *
     * @type static
     * @return {void}
     * @throws an exception if a setting definition is in a wrong format
     */
    __init : function()
    {
      if (window.qxsettings)
      {
        for (var key in qxsettings)
        {
          if (qx.core.Variant.compilerIsSet("qx.debug", "on"))
          {
            if ((key.split(".")).length !== 2) {
              throw new Error('Malformed settings key "' + key + '". Must be following the schema "namespace.key".');
            }
          }

          if (!this.__settings[key]) {
            this.__settings[key] = {};
          }

          this.__settings[key].value = qxsettings[key];
        }

        window.qxsettings = null;
      }
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
