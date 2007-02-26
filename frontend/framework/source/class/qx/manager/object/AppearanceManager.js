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

#module(ui_core)

************************************************************************ */

/**
 * This singleton manages the current theme
 */
qx.Clazz.define("qx.manager.object.AppearanceManager",
{
  type : "singleton",
  extend : qx.manager.object.ObjectManager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.manager.object.ObjectManager.call(this);

    // Themes
    this.__themes = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** currently used apperance theme */
    appearanceTheme :
    {
      _legacy   : true,
      type      : "object",
      allowNull : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      REGISTRATION
    ---------------------------------------------------------------------------
    */

    /**
     * Register an theme class.
     * The theme is applied if it is the default apperance
     *
     * @type member
     * @param vThemeClass {qx.renderer.theme.AppearanceTheme} TODOC
     * @return {void}
     */
    registerAppearanceTheme : function(vThemeClass)
    {
      this.__themes[vThemeClass.name] = vThemeClass;

      if (vThemeClass.name == qx.core.Setting.get("qx.appearanceTheme")) {
        this.setAppearanceTheme(vThemeClass);
      }
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyAppearanceTheme : function(propValue, propOldValue, propData)
    {
      var vComp = qx.core.Init.getInstance().getComponent();

      if (vComp && vComp.isUiReady()) {
        qx.ui.core.ClientDocument.getInstance()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
      }

			// Reset cache
			if (propValue) {
				this.__cache = {};
			}

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      THEME HELPER
    ---------------------------------------------------------------------------
    */


    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    initialFrom : function(id) {
      return this.initialFromTheme(this.getAppearanceTheme(), id);
    },


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "state" function
     */
    stateFrom : function(id, states) {
      return this.stateFromTheme(this.getAppearanceTheme(), id, states);
    },


    /**
     * Get the result of the "initial" function for a given id
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @return {Map} map of widget properties as returned by the "initial" function
     */
    initialFromTheme : function(theme, id)
    {
      var entry = theme.appearances[id];

      if (!entry) {
        throw new Error("Missing appearance entry: " + id);
      }

      if (entry.setup)
      {
        this.warn("Executing deprecated setup() in appearance entry '" + id + "'");

        entry.setup(this);
        entry.setup = null;
      }

      var ret;

      if (entry.initial)
      {
        ret = entry.initial(this);
      }

      if (entry.extend)
      {
        var extend = this.initialFromTheme(theme, entry.extend);

        if (ret)
        {
          qx.lang.Object.carefullyMergeWith(ret, extend);
        }
        else
        {
          ret = extend;
        }
      }

      return ret;
    },

    __cache : {},


    /**
     * Get the result of the "state" function for a given id and states
     *
     * @type member
     * @param theme {Object} appearance theme
     * @param id {String} id of the apperance (e.g. "button", "label", ...)
     * @param states {Map} hash map defining the set states
     * @return {Map} map of widget properties as returned by the "state" function
     */
    stateFromTheme : function(theme, id, states)
    {
			var cache = this.__cache;
      var entry = theme.appearances[id];

      if (!entry) {
        throw new Error("Missing appearance entry: " + id);
      }

      if (entry.setup)
      {
        this.warn("Executing deprecated setup() in appearance entry '" + id + "'");

        entry.setup(this);
        entry.setup = null;
      }

      // Creating cache-able ID
      var helper = [];
			for (var state in states) {
				helper.push(state);
			}
			helper.sort().unshift(id);
			var unique = helper.join(":");
 
      // Using cache if available
      if (cache[unique] !== undefined) {
				return cache[unique];
			}
			
      // Otherwise "compile" the appearance
      var ret;

      if (entry.state)
      {
        ret = entry.state(this, states);
      }

      if (entry.extend)
      {
        var extend = this.stateFromTheme(theme, entry.extend, states);

        if (ret)
        {
          qx.lang.Object.carefullyMergeWith(ret, extend);
        }
        else
        {
          ret = extend;
        }
      }

			cache[unique] = ret || null;
			//console.log("Cached: " + qx.lang.Object.getLength(cache) + " :: " + unique);

      return ret;
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Disposer
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      this.__cache = null;
      this.__themes = null;

      return qx.manager.object.ObjectManager.prototype.dispose.call(this);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.appearanceTheme" : "qx.theme.appearance.Classic"
  }
});
