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
qx.Class.define("qx.ui.table.columnmenu.Button",
{
  extend     : qx.ui.form.MenuButton,
  implement  : qx.ui.table.IColumnMenuButton,

  /**
   * Create a new instance of a column visibility menu button. This button
   * also contains the factory for creating each of the sub-widgets.
   */
  construct : function()
  {
    this.base(arguments);
  },

  members :
  {
    __columnMenuButtons : null,

    // Documented in qx.ui.table.IColumnMenu
    factory : function(item, options)
    {
      switch(item)
      {
        case "menu":
          var menu = new qx.ui.menu.Menu();
          this.setMenu(menu);
          return menu;
  
        case "menu-button":
          var menuButton =
            new qx.ui.table.columnmenu.MenuItem(options.text);
          menuButton.setVisible(options.bVisible);
          this.getMenu().add(menuButton);
          return menuButton;
  
        case "user-button":
          var button = new qx.ui.menu.Button(options.text);
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

    
    // Documented in qx.ui.table.IColumnMenu
    empty : function()
    {
      var menu = this.getMenu();
      var entries = menu.getChildren();

      for (var i=0,l=entries.length; i<l; i++)
      {
        entries[0].destroy();
      }
    },
    
        
    // overridden
    open : function(selectFirst)
    {
      // override open() to force liveupdate on the opened menu. This is
      // necessary because the table will popolate the menu after it has been
      // opened
      var menu = this.getMenu();
      menu.placeToWidget(this, true);
      menu.show();
    }
    
    
  }
});
