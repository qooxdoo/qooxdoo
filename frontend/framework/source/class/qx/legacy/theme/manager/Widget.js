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

/** This singleton selects the widget theme to use. */
qx.Class.define("qx.legacy.theme.manager.Widget",
{
  type : "singleton",
  extend : qx.core.Object,





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
      if (qx.legacy.theme.manager.Meta.getInstance().getAutoSync()) {
        this.syncWidgetTheme();
      }
    },

    /**
     * Sync dependend objects with internal database
     * @return {void}
     */
    syncWidgetTheme : function()
    {
      var value = this.getWidgetTheme();
      var alias = qx.legacy.util.AliasManager.getInstance();
      value ? alias.add("widget", value.resource) : alias.remove("widget");
    }
  }
});
