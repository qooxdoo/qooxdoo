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
 * Implementation of a Text column
 */
qx.Class.define("qx.ui.list.column.NumberColumn", {
  extend: qx.ui.list.column.AbstractWidgetColumn,

  members: {
    /**
     * @Override
     */
    _createCellWidget(row) {
      return new qx.ui.form.TextField();
    },

    /**
     * @Override
     */
    _getModelBindingOptions(widget, model) {
      return {
        converter: (data, ctlrModel, source, target) => String(data || 0)
      };
    },

    /**
     * @Override
     */
    _getWidgetBindingOptions(widget, model) {
      return {
        converter: (data, ctlrModel, source, target) => {
          let value = parseFloat(data);
          return isNaN(value)
            ? model["get" + qx.lang.String.firstUp(this.getPath())]()
            : value;
        }
      };
    }
  }
});
