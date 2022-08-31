/* ************************************************************************

   qooxdoo

   https://qooxdoo.org

   Copyright:
     2022 OETIKER+PARTNER AG

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tobias Oetiker (oetiker)

************************************************************************ */

/**
 * A toolbar-aware version of the {@link qx.ui.form.FileSelectorButton}.
 */

qx.Class.define("qx.ui.toolbar.FileSelectorButton", {
  extend: qx.ui.form.FileSelectorButton,
  construct(label, icon, command) {
    super(label, icon, command);
    // Toolbar buttons should not support the keyboard events
    this.removeListener("keydown", this._onKeyDown);
    this.removeListener("keyup", this._onKeyUp);
  },
  properties: {
    appearance: {
      refine: true,
      init: "toolbar-button"
    },

    show: {
      refine: true,
      init: "inherit"
    },

    focusable: {
      refine: true,
      init: false
    }
  },

  members: {
    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);
      // trigger a appearance recalculation of the parent
      let parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    }
  }
});
