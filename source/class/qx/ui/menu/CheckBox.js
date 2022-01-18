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
     * Fabian Jakobs (fjakobs)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Renders a special checkbox button inside a menu. The button behaves like
 * a normal {@link qx.ui.form.CheckBox} and shows a check icon when
 * checked; normally shows no icon when not checked (depends on the theme).
 */
qx.Class.define("qx.ui.menu.CheckBox", {
  extend: qx.ui.menu.AbstractButton,
  implement: [qx.ui.form.IBooleanForm],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param label {String} Initial label
   * @param menu {qx.ui.menu.Menu} Initial sub menu
   */
  construct(label, menu) {
    super();

    // ARIA attrs
    const contenEl = this.getContentElement();
    contenEl.setAttribute("role", "checkbox");
    contenEl.setAttribute("aria-checked", false);

    // Initialize with incoming arguments
    if (label != null) {
      // try to translate every time you create a checkbox [BUG #2699]
      if (label.translate) {
        this.setLabel(label.translate());
      } else {
        this.setLabel(label);
      }
    }

    if (menu != null) {
      this.setMenu(menu);
    }

    this.addListener("execute", this._onExecute, this);
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
      init: "menu-checkbox"
    },

    /** Whether the button is checked */
    value: {
      check: "Boolean",
      init: false,
      apply: "_applyValue",
      event: "changeValue",
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  /* eslint-disable @qooxdoo/qx/no-refs-in-members */
  members: {
    // overridden (from MExecutable to keep the icon out of the binding)
    /**
     * @lint ignoreReferenceField(_bindableProperties)
     */
    _bindableProperties: ["enabled", "label", "toolTipText", "value", "menu"],

    // property apply
    _applyValue(value, old) {
      value ? this.addState("checked") : this.removeState("checked");

      // ARIA attrs
      this.getContentElement().setAttribute("aria-checked", Boolean(value));
    },

    /**
     * Handler for the execute event.
     *
     * @param e {qx.event.type.Event} The execute event.
     */
    _onExecute(e) {
      this.toggleValue();
    }
  }
});
