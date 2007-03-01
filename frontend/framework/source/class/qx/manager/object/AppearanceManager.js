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
qx.Class.define("qx.manager.object.AppearanceManager",
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
    this.base(arguments);

    // Themes
    this._appearanceThemes = {};
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
      allowNull : false,
      instance  : "qx.renderer.theme.AppearanceTheme"
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
      this._appearanceThemes[vThemeClass.classname] = vThemeClass;

      if (vThemeClass.classname == qx.core.Setting.get("qx.appearanceTheme")) {
        this.setAppearanceTheme(vThemeClass.getInstance());
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
     * @return {Boolean} TODOC
     */
    _modifyAppearanceTheme : function(propValue, propOldValue, propData)
    {
      var vComp = qx.core.Init.getInstance().getComponent();

      if (vComp && vComp.isUiReady()) {
        qx.ui.core.ClientDocument.getInstance()._recursiveAppearanceThemeUpdate(propValue, propOldValue);
      }

      return true;
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

      // Themes
      this._appearanceThemes = null;

      return this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.appearanceTheme" : "qx.theme.appearance.Classic"
  }
});
