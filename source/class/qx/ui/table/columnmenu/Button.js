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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * The traditional qx.ui.menu.MenuButton to access the column visibility menu.
 */
qx.Class.define("qx.ui.table.columnmenu.Button", {
  extend: qx.ui.form.MenuButton,
  implement: qx.ui.table.IColumnMenuButton,

  /**
   * Create a new instance of a column visibility menu button. This button
   * also contains the factory for creating each of the sub-widgets.
   */
  construct() {
    super();

    // add blocker
    this.__blocker = new qx.ui.core.Blocker(this);
  },

  members: {
    __columnMenuButtons: null,
    __blocker: null,

    // Documented in qx.ui.table.IColumnMenu
    factory(item, options) {
      switch (item) {
        case "menu":
          var menu = new qx.ui.menu.Menu();
          this.setMenu(menu);
          return menu;

        case "menu-button":
          var menuButton = new qx.ui.table.columnmenu.MenuItem(options.text);
          menuButton.setColumnVisible(options.bVisible);
          this.getMenu().add(menuButton);
          return menuButton;

        case "user-button":
          var button = new qx.ui.menu.Button(options.text);
          button.set({
            appearance: "table-column-reset-button"
          });

          return button;

        case "separator":
          return new qx.ui.menu.Separator();

        default:
          throw new Error("Unrecognized factory request: " + item);
      }
    },

    /**
     * Returns the blocker of the columnmenu button.
     *
     * @return {qx.ui.core.Blocker} the blocker.
     */
    getBlocker() {
      return this.__blocker;
    },

    // Documented in qx.ui.table.IColumnMenu
    empty() {
      var menu = this.getMenu();
      var entries = menu.getChildren();

      for (var i = 0, l = entries.length; i < l; i++) {
        entries[0].destroy();
      }
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this.__blocker.dispose();
  }
});
