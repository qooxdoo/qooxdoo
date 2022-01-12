/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * A menubar button
 */
qx.Class.define("qx.ui.menubar.Button", {
  extend: qx.ui.form.MenuButton,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    appearance: {
      refine: true,
      init: "menubar-button"
    },

    show: {
      refine: true,
      init: "inherit"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Inspects the parent chain to find the MenuBar
     *
     * @return {qx.ui.menubar.MenuBar} MenuBar instance or <code>null</code>.
     */
    getMenuBar() {
      var parent = this;
      while (parent) {
        /* this method is also used by toolbar.MenuButton, so we need to check
           for a ToolBar instance. */
        if (parent instanceof qx.ui.toolbar.ToolBar) {
          return parent;
        }

        parent = parent.getLayoutParent();
      }

      return null;
    },

    // overridden
    open(selectFirst) {
      super.open(selectFirst);

      var menubar = this.getMenuBar();
      if (menubar) {
        menubar._setAllowMenuOpenHover(true);
      }
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for visibility property changes of the attached menu
     *
     * @param e {qx.event.type.Data} Property change event
     */
    _onMenuChange(e) {
      var menu = this.getMenu();
      var menubar = this.getMenuBar();

      if (menu.isVisible()) {
        this.addState("pressed");

        // Sync with open menu property
        if (menubar) {
          menubar.setOpenMenu(menu);
        }
      } else {
        this.removeState("pressed");

        // Sync with open menu property
        if (menubar && menubar.getOpenMenu() == menu) {
          menubar.resetOpenMenu();
          menubar._setAllowMenuOpenHover(false);
        }
      }
    },

    // overridden
    _onPointerUp(e) {
      super._onPointerUp(e);

      // Set state 'pressed' to visualize that the menu is open.
      var menu = this.getMenu();
      if (menu && menu.isVisible() && !this.hasState("pressed")) {
        this.addState("pressed");
      }
    },

    /**
     * Event listener for pointerover event
     *
     * @param e {qx.event.type.Pointer} pointerover event object
     */
    _onPointerOver(e) {
      // Add hovered state
      this.addState("hovered");

      // Open submenu
      if (this.getMenu() && e.getPointerType() == "mouse") {
        var menubar = this.getMenuBar();

        if (menubar && menubar._isAllowMenuOpenHover()) {
          // Hide all open menus
          qx.ui.menu.Manager.getInstance().hideAll();

          // Set it again, because hideAll remove it.
          menubar._setAllowMenuOpenHover(true);

          // Then show the attached menu
          if (this.isEnabled()) {
            this.open();
          }
        }
      }
    }
  }
});
