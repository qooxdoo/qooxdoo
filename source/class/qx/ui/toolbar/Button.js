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
 * The normal toolbar button. Like a normal {@link qx.ui.form.Button}
 * but with a style matching the toolbar.
 */
qx.Class.define("qx.ui.toolbar.Button", {
  extend: qx.ui.form.Button,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    appearance: {
      refine: true,
      init: "toolbar-button"
    },

    show: {
      refine: true,
      init: "inherit"
    }
  },

  members: {
    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);
      // trigger a appearance recalculation of the parent
      var parent = this.getLayoutParent();
      if (parent && parent instanceof qx.ui.toolbar.PartContainer) {
        qx.ui.core.queue.Appearance.add(parent);
      }
    }
  }
});
