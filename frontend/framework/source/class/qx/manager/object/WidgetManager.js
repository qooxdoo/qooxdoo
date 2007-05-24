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

/** This singleton selects the widget theme to use. */
qx.Class.define("qx.manager.object.WidgetManager",
{
  type : "singleton",
  extend : qx.core.Target,





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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
    }
  }
});
