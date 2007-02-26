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

qx.Clazz.define("qx.Theme",
{
  statics:
  {
    /**
     * Theme config
     *
     * Example:
     * <pre><code>
     * qx.Theme.define("name",
     * {
     *   extend : otherTheme,
     *   title : "MyThemeTitle"
     *   icons : {},
     *   widgets : {},
     *   colors : {},
     *   appearances : {}
     * });
     * </code></pre>
     *
     * @type static
     * @param name {String} name of the mixin
     * @param config {Map} config structure
     * @return {void}
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

      // Create alias
      var theme = config;

      // Assign to namespace
      var basename = qx.Clazz.createNamespace(name, theme);

      // Add name and basename to object
      theme.name = name;
      theme.basename = basename;
      theme.isTheme = true;

      // Register to managers
      if (theme.appearances) {
        qx.manager.object.AppearanceManager.getInstance().registerAppearanceTheme(theme);
      }

      if (theme.colors) {
        qx.manager.object.ColorManager.getInstance().registerColorTheme(theme);
      }

      if (theme.widgets) {
        qx.manager.object.ImageManager.getInstance().registerWidgetTheme(theme);
      }

      if (theme.icons) {
        qx.manager.object.ImageManager.getInstance().registerIconTheme(theme);
      }

      // Store class reference in global class registry
      this.__registry[name] = theme;
    },


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @type static
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     * @return {void}
     * @throws TODOC
     */
    __validateConfig : function(name, config)
    {
      var allowedKeys =
      {
        "title"       : "string",    // String
        "extend"      : "object",    // Theme-Object
        "colors"      : "object",    // Map
        "icons"       : "object",    // Map
        "widgets"     : "object",    // Map
        "appearances" : "object"     // Map
      };

      for (var key in config)
      {
        if (!allowedKeys[key]) {
          throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
        }

        if (config[key] == null) {
          throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
        }

        if (typeof config[key] !== allowedKeys[key]) {
          throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowedKeys[key] + '"!');
        }
      }
    },


    /**
     * Returns a theme by name
     *
     * @type static
     * @param name {String} theme name to check
     * @return {Object ? void} theme object
     */
    getByName : function(name) {
      return this.__registry[name];
    },


    /**
     * Determine if theme exists
     *
     * @type static
     * @param name {String} theme name to check
     * @return {Boolean} true if theme exists
     */
    isDefined : function(name) {
      return this.getByName(name) !== undefined;
    },


    /**
     * Determine the number of themes which are defined
     *
     * @type static
     * @return {Number} the number of classes
     */
    getNumber : function() {
      return qx.lang.Object.getLength(this.__registry);
    },


    /** {var} TODOC */
    __registry : {}
  }
});
