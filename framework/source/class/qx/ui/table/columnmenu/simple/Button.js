/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The traditional qx.ui.menu.MenuButton to access the column visibility menu.
 */
qx.Class.define("qx.ui.table.columnmenu.simple.Button",
{
  extend     : qx.ui.form.MenuButton,
  implement  : qx.ui.table.IColumnMenu,

  construct : function(label, icon, menu)
  {
    this.base(arguments, label, icon, menu);
  },

  members :
  {
    __columnMenuButtons : null,

    factory : function(item, text)
    {
      switch(item)
      {
      case "menu":
        var menu = new qx.ui.menu.Menu();
        this.setMenu(menu);
        return menu;

      case "checkbox":
        return new qx.ui.menu.CheckBox(text);

      case "button":
        var button = new qx.ui.menu.Button(text);
        button.set(
          {
            appearance: "table-column-reset-button"
          });
        return button;

      case "separator":
        return new qx.ui.menu.Separator();

      default:
        throw new Error("Unrecognized factory request: " + item);
      }
    },

    empty : function()
    {
      var menu = this.getMenu();
      var entries = menu.getChildren();

      for (var i=0,l=entries.length; i<l; i++)
      {
        entries[0].destroy();
      }
    }
  }
});
