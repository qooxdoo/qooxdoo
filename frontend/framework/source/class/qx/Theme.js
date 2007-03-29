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
#module(oo)
#optional(qx.manager.object.AppearanceManager)
#optional(qx.manager.object.ColorManager)
#optional(qx.manager.object.ImageManager)

************************************************************************ */

qx.Class.define("qx.Theme",
{
  statics:
  {
    /*
    ---------------------------------------------------------------------------
       PUBLIC API
    ---------------------------------------------------------------------------
    */

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

      // Add name and basename to object
      theme.$$type = "Theme";
      theme.name = name;

      // Attach toString
      theme.toString = this.genericToString;

      // Assign to namespace
      theme.basename = qx.Class.createNamespace(name, theme);;

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




    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL API
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all themes to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The interface identifier
     */
    genericToString : function() {
      return "[Theme " + this.name + "]";
    },


    /** {var} TODOC */
    __registry : {},


    /** {Map} allowed keys in theme definition */
    __allowedKeys :qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "title"       : "string", // String
        "extend"      : "object", // Theme
        "colors"      : "object", // Map
        "icons"       : "object", // Map
        "widgets"     : "object", // Map
        "appearances" : "object"  // Map
      },

      "default" : null
    }),


    /**
     * Validates incoming configuration and checks keys and values
     *
     * @type static
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     * @return {void}
     * @throws TODOC
     */
    __validateConfig : qx.core.Variant.select("qx.debug",
    {
      "on": function(name, config)
      {
        var allowed = this.__allowedKeys;

        for (var key in config)
        {
          if (allowed[key] === undefined) {
            throw new Error('The configuration key "' + key + '" in class "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in class "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in class "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Validate maps
        var maps = [ "colors", "icons", "widgets", "appearances" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value needs to be a map!');
          }
        }

        // Validate extend
        if (config.extend && config.extend.$$type !== "Theme") {
          throw new Error('Invalid extend in theme "' + name + '": ' + config.extend);
        }
      },

      "default" : function() {}
    })
  }
});
