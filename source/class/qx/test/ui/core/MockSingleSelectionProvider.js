/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2025 Qooxdoo contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Minimal ISingleSelectionProvider implementation for unit testing.
 *
 * @internal
 */
qx.Class.define("qx.test.ui.core.MockSingleSelectionProvider", {
  extend: qx.core.Object,
  implement: [qx.ui.core.ISingleSelectionProvider],

  construct(items) {
    super();
    this._items = items;
  },

  members: {
    _items: null,

    getItems() {
      return this._items || [];
    },

    isItemSelectable(item) {
      return true;
    }
  }
});
