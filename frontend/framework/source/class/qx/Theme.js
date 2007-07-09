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

************************************************************************ */

/**
 * This class helps to create and manager so-named theme classes.
 *
 * Supported are: color, border, fonts, icons, widgets,
 * appearances and meta themes.
 */
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
     * <pre class='javascript'>
     * qx.Theme.define("name",
     * {
     *   title : "MyThemeTitle",
     *   extend : otherTheme,
     *   include : [MMixinTheme],
     *   colors : {},
     *   borders : {},
     *   fonts : {},
     *   icons : {},
     *   widgets : {},
     *   appearances : {},
     *   meta : {}
     * });
     * </pre>
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

      if (config.include && !(config.include instanceof Array)) {
        config.include = [config.include];
      }

      // Validate incoming data
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.__validateConfig(name, config);
      }

      // Create alias
      var theme =
      {
        $$type : "Theme",
        name : name,
        title : config.title,
        type : config.type || "normal",

        // Attach toString
        toString : this.genericToString
      };

      // Remember extend
      if (config.extend) {
        theme.supertheme = config.extend;
      }

      // Assign to namespace
      theme.basename = qx.Class.createNamespace(name, theme);

      // Convert theme entry from Object to Function (for prototype inheritance)
      this.__convert(theme, config);

      // Store class reference in global class registry
      this.__registry[name] = theme;

      // Include mixin themes
      if (config.include)
      {
        for (var i=0, a=config.include, l=a.length; i<l; i++) {
          this.include(theme, a[i]);
        }
      }
    },


    /**
     * Return a map of all known themes
     *
     * @type static
     * @return {Map} known themes
     */
    getAll : function() {
      return this.__registry;
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
    getTotalNumber : function() {
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


    /**
     * Extract the inheritable key (could be only one)
     *
     * @param config {Map} The map from where to extract the key
     * @return {String} the key which was found
     */
    __extractInheritableKey : function(config)
    {
      for (var i=0, keys=this.__inheritableKeys, l=keys.length; i<l; i++)
      {
        if (config[keys[i]]) {
          return keys[i];
        }
      }
    },


    /**
     * Convert existing entry to a prototype based inheritance function
     *
     * @param theme {Theme} newly created theme object
     * @param config {Map} incoming theme configuration
     */
    __convert : function(theme, config)
    {
      var keyCurrent = this.__extractInheritableKey(config);

      if (config.extend)
      {
        var keyExtended = this.__extractInheritableKey(config.extend);

        // Use theme key from extended theme if own one is not available
        if (!keyCurrent) {
          keyCurrent = keyExtended;
        }
      }

      // Return if there is no key defined at all
      if (!keyCurrent) {
        return;
      }

      // Create pseudo class
      var clazz = function() {};

      // Process extend config
      if (config.extend) {
        clazz.prototype = new config.extend.$$clazz;
      }

      var target = clazz.prototype;
      var source = config[keyCurrent];

      // Copy entries to prototype
      for (var id in source) {
        target[id] = source[id];
      }

      // store pseudo class
      theme.$$clazz = clazz;

      // and create instance under the old key
      theme[keyCurrent] = new clazz;
    },


    /** {Map} Internal theme registry */
    __registry : {},


    /** {Array} Keys which support inheritance */
    __inheritableKeys : [ "colors", "borders", "fonts", "icons", "widgets", "appearances", "meta" ],


    /** {Map} allowed keys in theme definition */
    __allowedKeys : qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "title"       : "string", // String
        "type"        : "string", // String
        "extend"      : "object", // Theme
        "colors"      : "object", // Map
        "borders"     : "object", // Map
        "fonts"       : "object", // Map
        "icons"       : "object", // Map
        "widgets"     : "object", // Map
        "appearances" : "object", // Map
        "meta"        : "object", // Map
        "include"     : "object"  // Array
      },

      "default" : null
    }),

    /** {Map} allowed keys inside a meta theme block */
    __metaKeys :qx.core.Variant.select("qx.debug",
    {
      "on":
      {
        "color" : "object",
        "border" : "object",
        "font" : "object",
        "widget" : "object",
        "icon" : "object",
        "appearance" : "object"
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
            throw new Error('The configuration key "' + key + '" in theme "' + name + '" is not allowed!');
          }

          if (config[key] == null) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value is undefined/null!');
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error('Invalid type of key "' + key + '" in theme "' + name + '"! The type of the key must be "' + allowed[key] + '"!');
          }
        }

        // Test for title
        if (config.title === undefined) {
          throw new Error("Missing title definition in theme: " + name);
        }

        // Validate maps
        var maps = [ "colors", "borders", "fonts", "icons", "widgets", "appearances", "meta" ];
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key] !== undefined && (config[key] instanceof Array || config[key] instanceof RegExp || config[key] instanceof Date || config[key].classname !== undefined)) {
            throw new Error('Invalid key "' + key + '" in theme "' + name + '"! The value needs to be a map!');
          }
        }

        // Check conflicts (detect number ...)
        var counter = 0;
        for (var i=0, l=maps.length; i<l; i++)
        {
          var key = maps[i];

          if (config[key]) {
            counter++;
          }

          if (counter > 1) {
            throw new Error("You can only define one theme category per file! Invalid theme: " + name);
          }
        }

        // At least one entry
        if (!config.extend && counter === 0) {
          throw new Error("You must define at least one entry in your theme configuration :" + name);
        }

        // Validate meta
        if (config.meta)
        {
          var value;
          for (var key in config.meta)
          {
            value = config.meta[key];

            if (this.__metaKeys[key] === undefined) {
              throw new Error('The key "' + key + '" is not allowed inside a meta theme block.');
            }

            if (typeof value !== this.__metaKeys[key]) {
              throw new Error('The type of the key "' + key + '" inside the meta block is wrong.');
            }

            if (!(typeof value === "object" && value !== null && value.$$type === "Theme")) {
              throw new Error('The content of a meta theme must reference to other themes. The value for "' + key + '" in theme "' + name + '" is invalid: ' + value);
            }
          }
        }

        // Validate extend
        if (config.extend && config.extend.$$type !== "Theme") {
          throw new Error('Invalid extend in theme "' + name + '": ' + config.extend);
        }
      },

      "default" : function() {}
    }),


    /**
     * Include all keys of the given mixin theme into the theme. The mixin may
     * include keys which are already defined in the target theme. Existing
     * features of equal name will be overwritten.
     *
     * @type static
     * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
     * @param mixinTheme {Theme} The theme to be included.
     */
    patch : function(theme, mixinTheme)
    {
      var keyCurrent = this.__extractInheritableKey(mixinTheme);
      if (keyCurrent !== this.__extractInheritableKey(mixinTheme)) {
        throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
      }

      var source = mixinTheme[keyCurrent];
      var target = theme[keyCurrent];

      for (var key in source) {
        target[key] = source[key];
      }
    },


    /**
     * Include all keys of the given mixin theme into the theme. The mixin must
     * not include any keys that are already available in the
     * class. This would only be possible using the {@link #patch} method.
     *
     * @type static
     * @param theme {Theme} An existing theme which should be modified by including the mixin theme.
     * @param mixinTheme {Theme} The theme to be included.
     */
    include : function(theme, mixinTheme)
    {
      var keyCurrent = this.__extractInheritableKey(mixinTheme);
      if (keyCurrent !== this.__extractInheritableKey(mixinTheme)) {
        throw new Error("The mixins '" + theme.name + "' are not compatible '" + mixinTheme.name + "'!");
      }

      var source = mixinTheme[keyCurrent];
      var target = theme[keyCurrent];

      for (var key in source)
      {
        if (target[key] !== undefined) {
          throw new Error("It is not allowed to overwrite the key '" + key + "' of theme '" + theme.name + "' by mixin theme '"+mixinTheme.name+"'.");
        }

        target[key] = source[key];
      }
    }
  }
});
