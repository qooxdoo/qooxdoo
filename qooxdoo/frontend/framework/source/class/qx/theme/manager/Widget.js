/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
qx.Class.define("qx.theme.manager.Widget",
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
    /** currently used widget theme */
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
      if (qx.theme.manager.Meta.getInstance().getAutoSync()) {
        this.syncWidgetTheme();
      }
    },

    /**
     * Sync dependend objects with internal database
     * @type member
     * @return {void}
     */
    syncWidgetTheme : function()
    {
      var value = this.getWidgetTheme();
      var alias = qx.io.Alias.getInstance();
      value ? alias.add("widget", value.widgets.uri) : alias.remove("widget");
    }
  }
});
