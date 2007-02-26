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
      if (theme.appearances)
      {
        qx.manager.object.AppearanceManager.getInstance().registerAppearanceTheme(theme);

        theme.initialFrom = this._initialAppearanceFrom;
        theme.stateFrom = this._stateAppearanceFrom;
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


    },





    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    _initialAppearanceFrom : function(id)
    {
      var appearance = this.appearances[id];

      if (appearance)
      {
        if (appearance.setup)
        {
          appearance.setup(this);
          appearance.setup = null;
        }

        try {
          return appearance.initial ? appearance.initial(this) : {};
        } catch(ex) {
          this.error("Couldn't apply initial appearance", ex);
        }
      }
      else
      {
        return this.error("Missing appearance: " + id);
      }
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "state" function
     */
    _stateAppearanceFrom : function(id, states)
    {
      var appearance = this.appearances[id];

      if (appearance)
      {
        if (appearance.setup)
        {
          appearance.setup(this);
          appearance.setup = null;
        }

        try {
          return appearance.state ? appearance.state(this, states) : {};
        } catch(ex) {
          this.error("Couldn't apply state appearance", ex);
        }
      }
      else
      {
        return this.error("Missing appearance: " + id);
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
