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
 * A button which opens the connected menu when tapping on it.
 */
qx.Class.define("qx.ui.form.MenuButton", {
  extend: qx.ui.form.Button,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param icon {String?null} Initial icon
   * @param menu {qx.ui.menu.Menu} Connect to menu instance
   */
  construct(label, icon, menu) {
    super(label, icon);

    // Initialize properties
    if (menu != null) {
      this.setMenu(menu);
    }

    // ARIA attrs
    this.getContentElement().setAttribute("role", "button");
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /** The menu instance to show when tapping on the button */
    menu: {
      check: "qx.ui.menu.Menu",
      nullable: true,
      apply: "_applyMenu",
      event: "changeMenu"
    },

    // overridden
    appearance: {
      refine: true,
      init: "menubutton"
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
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */
    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);

      // hide the menu too
      var menu = this.getMenu();
      if (value != "visible" && menu) {
        menu.hide();
      }
    },

    // property apply
    _applyMenu(value, old) {
      if (old) {
        old.removeListener("changeVisibility", this._onMenuChange, this);
        old.resetOpener();
      }

      if (value) {
        value.addListener("changeVisibility", this._onMenuChange, this);
        value.setOpener(this);

        value.removeState("submenu");
        value.removeState("contextmenu");
      }

      // ARIA attrs
      const contentEl = this.getContentElement();
      if (!contentEl) {
        return;
      }
      if (value) {
        contentEl.setAttribute("aria-haspopup", "menu");
        contentEl.setAttribute("aria-expanded", value.isVisible());
        contentEl.setAttribute(
          "aria-controls",
          value.getContentElement().getAttribute("id")
        );
      } else {
        contentEl.removeAttribute("aria-haspopup");
        contentEl.removeAttribute("aria-expanded");
        contentEl.removeAttribute("aria-controls");
      }
    },

    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Positions and shows the attached menu widget.
     *
     * @param selectFirst {Boolean?false} Whether the first menu button should be selected
     */
    open(selectFirst) {
      var menu = this.getMenu();

      if (menu) {
        // Focus this button when the menu opens
        if (
          this.isFocusable() &&
          !qx.ui.core.FocusHandler.getInstance().isFocused(this)
        ) {
          this.focus();
        }
        // Hide all menus first
        qx.ui.menu.Manager.getInstance().hideAll();

        // Open the attached menu
        menu.setOpener(this);
        menu.open();

        // Select first item
        if (selectFirst) {
          var first = menu.getSelectables()[0];
          if (first) {
            menu.setSelectedButton(first);
          }
        }
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
      const menuVisible = menu.isVisible();
      if (menuVisible) {
        this.addState("pressed");
      } else {
        this.removeState("pressed");
      }

      // ARIA attrs
      this.getContentElement().setAttribute("aria-expanded", menuVisible);
    },

    // overridden
    _onPointerDown(e) {
      // call the base function to get into the capture phase [BUG #4340]
      super._onPointerDown(e);

      // only open on left clicks [BUG #5125]
      if (e.getButton() != "left") {
        return;
      }

      var menu = this.getMenu();
      if (menu) {
        // Toggle sub menu visibility
        if (!menu.isVisible()) {
          this.open();
        } else {
          menu.exclude();
        }

        // Event is processed, stop it for others
        e.stopPropagation();
      }
    },

    // overridden
    _onPointerUp(e) {
      // call base for firing the execute event
      super._onPointerUp(e);

      // Just stop propagation to stop menu manager
      // from getting the event
      e.stopPropagation();
    },

    // overridden
    _onPointerOver(e) {
      // Add hovered state
      this.addState("hovered");
    },

    // overridden
    _onPointerOut(e) {
      // Just remove the hover state
      this.removeState("hovered");
    },

    // overridden
    _onKeyDown(e) {
      switch (e.getKeyIdentifier()) {
        case "Space":
        case "Enter":
          this.removeState("abandoned");
          this.addState("pressed");

          var menu = this.getMenu();
          if (menu) {
            // Toggle sub menu visibility
            if (!menu.isVisible()) {
              this.open();
            } else {
              menu.exclude();
            }
          }

          e.stopPropagation();
      }
    },

    // overridden
    _onKeyUp(e) {
      // no action required here
    }
  }
});
