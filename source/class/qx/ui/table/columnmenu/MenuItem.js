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



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

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

    // Two way binding this.columnVisible <--> this.value
    this.bind("value", this, "columnVisible");
    this.bind("columnVisible", this, "value");
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    columnVisible :
    {
      check : "Boolean",
      init  : true,
      event : "changeColumnVisible"
    }
  }
});