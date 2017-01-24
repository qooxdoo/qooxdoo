/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A menu item.
 */
qx.Class.define("qx.ui.table.columnmenu.MenuItem",
{
  extend     : qx.ui.menu.CheckBox,
  implement  : qx.ui.table.IColumnMenuItem,

  properties :
  {
    /**
     * Whether the table column associated with this menu item is visible.
     */
    visible :
    {
      check : "Boolean",
      init  : true,
      apply : "_applyVisible",
      event : "changeVisible"
    }
  },

  /**
   * Create a new instance of an item for insertion into the table column
   * visibility menu.
   *
   * @param text {String}
   *   Text for the menu item, most typically the name of the column in the
   *   table.
   */
  construct : function(text)
  {
    this.base(arguments, text);

    // Mirror native "value" property in our "visible" property
    this.addListener("changeValue",
                     function(e)
                     {
                       this.bInListener = true;
                       this.setVisible(e.getData());
                       this.bInListener = false;
                     });
  },

  members :
  {
    /**
     * Keep menu in sync with programmatic changes of visibility
     *
     * @param value {Boolean}
     *   New visibility value
     *
     * @param old {Boolean}
     *   Previous visibility value
     */
    _applyVisible : function(value, old)
    {
      // avoid recursion if called from listener on "changeValue" property
      if (! this.bInListener)
      {
        this.setValue(value);
      }
    }
  }
});
