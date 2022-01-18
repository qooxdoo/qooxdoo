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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Radio buttons are used to manage a single selection. Radio buttons only
 * make sense used in a group of two or more of them. They are managed (connected)
 * to a {@link qx.ui.form.RadioGroup} to handle the selection.
 */
qx.Class.define("qx.ui.toolbar.RadioButton", {
  extend: qx.ui.toolbar.CheckBox,
  include: [qx.ui.form.MModelProperty],
  implement: [qx.ui.form.IModel, qx.ui.form.IRadioItem],

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct(label, icon) {
    super(label, icon);

    // ARIA attrs
    // Important: (Grouped) radio btns should be children of a div with role 'radiogroup'
    const contentEl = this.getContentElement();
    contentEl.setAttribute("role", "radio");
    contentEl.setAttribute("aria-checked", false);
    contentEl.removeAttribute("aria-pressed");
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
    _applyValue(value, old) {
      super._applyValue(value, old);

      // ARIA attrs
      const contentEl = this.getContentElement();
      contentEl.removeAttribute("aria-pressed");
      contentEl.setAttribute("aria-checked", Boolean(value));

      if (value) {
        var grp = this.getGroup();
        if (grp) {
          grp.setSelection([this]);
        }
      }
    },

    // overridden
    _onExecute(e) {
      var grp = this.getGroup();
      if (grp && grp.getAllowEmptySelection()) {
        this.toggleValue();
      } else {
        this.setValue(true);
      }
    }
  }
});
