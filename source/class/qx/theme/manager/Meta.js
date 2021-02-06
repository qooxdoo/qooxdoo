/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Manager for meta themes
 */
qx.Class.define("qx.theme.manager.Meta",
{
  type : "singleton",
  extend : qx.core.Object,

  events :
  {
    /** Fires if any theme manager has been changed. */
    "changeTheme" : "qx.event.type.Event"
  },


  properties :
  {
    /**
     * Meta theme. Applies the defined color, decoration, ... themes to
     * the corresponding managers.
     */
    theme :
    {
      check : "Theme",
      nullable : false,
      apply : "_applyTheme"
    }
  },


  members :
  {
    // property apply
    _applyTheme : function(value, old)
    {
      // collect changes
      var colorChanged = true;
      var decorationChanged = true;
      var fontChanged = true;
      var iconChanged = true;
      var appearanceChanged = true;

      if (old) {
        colorChanged = value.meta.color !== old.meta.color;
        decorationChanged = value.meta.decoration !== old.meta.decoration;
        fontChanged = value.meta.font !== old.meta.font;
        iconChanged = value.meta.icon !== old.meta.icon;
        appearanceChanged = value.meta.appearance !== old.meta.appearance;
      }


      var colorMgr = qx.theme.manager.Color.getInstance();
      var decorationMgr = qx.theme.manager.Decoration.getInstance();
      var fontMgr = qx.theme.manager.Font.getInstance();
      var iconMgr = qx.theme.manager.Icon.getInstance();
      var appearanceMgr = qx.theme.manager.Appearance.getInstance();

      // suspend listeners
      this._suspendEvents();


      // apply meta changes
      if (colorChanged) {
        // color theme changed, but decorator not? force decorator
        if (!decorationChanged) {
          var dec = decorationMgr.getTheme();
          decorationMgr._applyTheme(dec);
        }
        colorMgr.setTheme(value.meta.color);
      }
      decorationMgr.setTheme(value.meta.decoration);
      fontMgr.setTheme(value.meta.font);
      iconMgr.setTheme(value.meta.icon);
      appearanceMgr.setTheme(value.meta.appearance);

      // fire change event only if at least one theme manager changed
      if (colorChanged || decorationChanged || fontChanged || iconChanged || appearanceChanged) {
        this.fireEvent("changeTheme");
      }

      // re add listener
      this._activateEvents();
    },


    __timer : null,


    /**
     * Fires <code>changeTheme</code> event.
     *
     * @param e {qx.event.type.Data} Data event.
     */
    _fireEvent : function(e)
    {
      if (e.getTarget() === qx.theme.manager.Color.getInstance()) {
        // force clearing all previously created CSS rules, to be able to
        // re-create decorator rules with changed color theme
        qx.theme.manager.Decoration.getInstance().refresh();
      }

      this.fireEvent("changeTheme");
    },


    /**
     * Removes listeners for <code>changeTheme</code> event of all
     * related theme managers.
     */
    _suspendEvents : function()
    {
      var colorMgr = qx.theme.manager.Color.getInstance();
      var decorationMgr = qx.theme.manager.Decoration.getInstance();
      var fontMgr = qx.theme.manager.Font.getInstance();
      var iconMgr = qx.theme.manager.Icon.getInstance();
      var appearanceMgr = qx.theme.manager.Appearance.getInstance();

      // suspend listeners
      if (colorMgr.hasListener("changeTheme")) {
        colorMgr.removeListener("changeTheme", this._fireEvent, this);
      }

      if (decorationMgr.hasListener("changeTheme")) {
        decorationMgr.removeListener("changeTheme", this._fireEvent, this);
      }

      if (fontMgr.hasListener("changeTheme")) {
        fontMgr.removeListener("changeTheme", this._fireEvent, this);
      }

      if (iconMgr.hasListener("changeTheme")) {
        iconMgr.removeListener("changeTheme", this._fireEvent, this);
      }

      if (appearanceMgr.hasListener("changeTheme")) {
        appearanceMgr.removeListener("changeTheme", this._fireEvent, this);
      }
    },


    /**
     * Activates listeners for <code>changeTheme</code> event of all related
     * theme managers, to forwards the event to this meta manager instance.
     */
    _activateEvents : function()
    {
      var colorMgr = qx.theme.manager.Color.getInstance();
      var decorationMgr = qx.theme.manager.Decoration.getInstance();
      var fontMgr = qx.theme.manager.Font.getInstance();
      var iconMgr = qx.theme.manager.Icon.getInstance();
      var appearanceMgr = qx.theme.manager.Appearance.getInstance();

      // add listeners to check changes
      if (!colorMgr.hasListener("changeTheme")) {
        colorMgr.addListener("changeTheme", this._fireEvent, this);
      }

      if (!decorationMgr.hasListener("changeTheme")) {
        decorationMgr.addListener("changeTheme", this._fireEvent, this);
      }

      if (!fontMgr.hasListener("changeTheme")) {
        fontMgr.addListener("changeTheme", this._fireEvent, this);
      }

      if (!iconMgr.hasListener("changeTheme")) {
        iconMgr.addListener("changeTheme", this._fireEvent, this);
      }

      if (!appearanceMgr.hasListener("changeTheme")) {
        appearanceMgr.addListener("changeTheme", this._fireEvent, this);
      }
    },


    /**
     * Initialize the themes which were selected using the settings. Should only
     * be called from qooxdoo based application.
     */
    initialize : function()
    {
      var env = qx.core.Environment;
      var theme, obj;

      theme = env.get("qx.theme");
      if (theme)
      {
        obj = qx.Theme.getByName(theme);
        if (!obj) {
          throw new Error("The theme to use is not available: " + theme);
        }

        this.setTheme(obj);
      }
    }
  },




  /*
  *****************************************************************************
     ENVIRONMENT SETTINGS
  *****************************************************************************
  */

  environment : {
    "qx.theme" : "qx.theme.Modern"
  }
});
