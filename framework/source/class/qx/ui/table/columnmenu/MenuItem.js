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

    this.setValue(this.__columnVisible);

    // Mirror native "value" property in our "visible" property
    this.addListener("changeValue",
                     function(e)
                     {
                       this.bInListener = true;
                       this.setVisible(e.getData());
                       this.bInListener = false;
                     });
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  events :
  {
    /**
     * Dispatched when a column changes visibility state. The event data is a
     * boolean indicating whether the table column associated with this menu
     * item is now visible.
     */
    changeVisible : "qx.event.type.Data"
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __columnVisible : true, // {Boolean}


    // Interface implementation
    setVisible : function(value)
    {
      if (value !== this.__columnVisible)
      {
        this.__columnVisible = value;

        // avoid recursion if called from listener on "changeValue" property
        if (! this.bInListener) {
          this.setValue(value);
        }

        this.fireDataEvent("changeVisible", value, this.__columnVisible);
      }
    },


    // Interface implementation
    getVisible : function() {
      return this.__columnVisible;
    }
  }
});
