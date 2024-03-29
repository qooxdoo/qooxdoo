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

************************************************************************ */

/**
 * The button to fill the menubar
 *
 * @childControl arrow {qx.ui.basic.Image} arrow widget to show a submenu is available
 */
qx.Class.define("qx.ui.toolbar.MenuButton", {
  extend: qx.ui.menubar.Button,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /** Appearance of the widget */
    appearance: {
      refine: true,
      init: "toolbar-menubutton"
    },

    /** Whether the button should show an arrow to indicate the menu behind it */
    showArrow: {
      check: "Boolean",
      init: false,
      themeable: true,
      apply: "_applyShowArrow"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);

      // hide the menu too
      var menu = this.getMenu();
      if (value != "visible" && menu) {
        menu.hide();
      }

      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    },

    // overridden
    _createChildControlImpl(id, hash) {
      var control;

      switch (id) {
        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);
          this._addAt(control, 10);
          break;
      }

      return control || super._createChildControlImpl(id);
    },

    // property apply routine
    _applyShowArrow(value, old) {
      if (value) {
        this._showChildControl("arrow");
      } else {
        this._excludeChildControl("arrow");
      }
    }
  }
});
