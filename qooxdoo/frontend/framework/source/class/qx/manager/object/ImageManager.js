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
#optional(qx.ui.form.Button)
#embed(qx.icontheme/16/apps/preferences-desktop-theme.png)

************************************************************************ */

/** This singleton manage the global image path (prefix) and allowes themed icons. */
qx.Class.define("qx.manager.object.ImageManager",
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

    // Contains known image sources (all of them, if loaded or not)
    // The value is a number which represents the number of image
    // instances which use this source
    this._sources = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    iconTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyIconTheme",
      event : "changeIconTheme"
    },

    widgetTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyWidgetTheme",
      event : "changeWidgetTheme"
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
      MODIFIERS
    ---------------------------------------------------------------------------
    */

    _applyIconTheme : function(value, old)
    {
      if (qx.manager.object.ThemeManager.getInstance().getAutoSync()) {
        this.syncIconTheme();
      }
    },

    syncIconTheme : function()
    {
      var value = this.getIconTheme();
      var alias = qx.manager.object.AliasManager.getInstance();
      value ? alias.add("icon", value.icons.uri) : alias.remove("icon");
    },

    _applyWidgetTheme : function(value, old)
    {
      if (qx.manager.object.ThemeManager.getInstance().getAutoSync()) {
        this.syncWidgetTheme();
      }
    },

    syncWidgetTheme : function()
    {
      var value = this.getWidgetTheme();
      var alias = qx.manager.object.AliasManager.getInstance();
      value ? alias.add("widget", value.widgets.uri) : alias.remove("widget");
    },









    /*
    ---------------------------------------------------------------------------
      PRELOAD API
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPreloadImageList : function()
    {
      var vPreload = {};

      for (var vSource in this._sources)
      {
        if (this._sources[vSource]) {
          vPreload[vSource] = true;
        }
      }

      return vPreload;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPostPreloadImageList : function()
    {
      var vPreload = {};

      for (var vSource in this._sources)
      {
        if (!this._sources[vSource]) {
          vPreload[vSource] = true;
        }
      }

      return vPreload;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_sources");
  }
});
