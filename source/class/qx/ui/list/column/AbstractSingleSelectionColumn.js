/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (https://githuib.com/johnspackman, john.spackman@zenesis.com)

************************************************************************ */

/**
 * Implementation of a column that contains a select box
 */
qx.Class.define("qx.ui.list.column.AbstractSingleSelectionColumn", {
  extend: qx.ui.list.column.AbstractColumn,

  properties: {
    /** the path to bind to */
    path: {
      init: null,
      check: "String"
    },

    /** binding options, @see `qx.data.SingleValueBinding.bind#options` */
    options: {
      init: null,
      nullable: true
    }
  },

  members: {
    /**
     * @Override
     */
    _bindCellWidget(widget, model) {
      return {
        model: model,
        selection: this._bindSingleSelection(
          widget,
          model,
          this.getPath(),
          this.getOptions()
        )
      };
    },

    /**
     * @Override
     */
    _unbindCellWidget(widget, bindData) {
      this._unbindSingleSelection(bindData.selection);
    },

    /**
     * @Override
     */
    _updateEditableImpl(bindData, enabled, readOnly) {
      this._updateEditableSingleSelection(
        bindData.selection,
        enabled,
        readOnly
      );
    }
  }
});
