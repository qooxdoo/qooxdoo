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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Popups are widgets, which can be placed on top of the application.
 * They are automatically added to the application root.
 *
 * Popups are used to display menus, the lists of combo or select boxes,
 * tooltips, etc.
 */
qx.Class.define("qx.ui.popup.Popup", {
  extend: qx.ui.container.Composite,
  include: qx.ui.core.MPlacement,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct(layout) {
    super(layout);

    // Initialize visibility
    this.initVisibility();
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "popup"
    },

    // overridden
    visibility: {
      refine: true,
      init: "excluded"
    },

    /**
     * Whether to let the system decide when to hide the popup. Setting
     * this to false gives you better control but it also requires you
     * to handle the closing of the popup.
     */
    autoHide: {
      check: "Boolean",
      init: true
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    show() {
      // Lazy adding to the root element, otherwise it could happen that
      // IE scrolls automatically to top, see bug #3955 for details.
      if (this.getLayoutParent() == null) {
        // Automatically add to application's root
        qx.core.Init.getApplication().getRoot().add(this);
      }
      super.show();
    },

    // overridden
    _applyVisibility(value, old) {
      super._applyVisibility(value, old);

      var mgr = qx.ui.popup.Manager.getInstance();
      value === "visible" ? mgr.add(this) : mgr.remove(this);
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    if (!qx.ui.popup.Manager.getInstance().isDisposed()) {
      qx.ui.popup.Manager.getInstance().remove(this);
    }
  }
});
