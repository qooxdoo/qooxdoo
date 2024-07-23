/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021 Zenesis Ltd (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * This is a marker interface for classes which can act as a children of
 * {@link qx.ui.form.List}
 */
qx.Interface.define("qx.ui.form.IListItem", {
    /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /** Fired when the value was modified */
    changeReadOnly: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /*
    ---------------------------------------------------------------------------
      READONLY PROPERTY
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the element's value.
     *
     * @param value {Boolean|null} The new value of the element.
     * @return {Boolean|null}
     */
    setReadOnly(value) {
      this.assertArgumentsCount(arguments, 1, 1);
    },

    /**
     * Resets the element's value to its initial value.
     */
    resetReadOnly() {},

    /**
     * The element's user set value.
     *
     * @return {Boolean|null} The value.
     */
    getReadOnly() {}
  }
});
