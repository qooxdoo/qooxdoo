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
 * Implementation of a Date column that is always read only
 */
qx.Class.define("qx.ui.list.column.DateLabelColumn", {
  extend: qx.ui.list.column.AbstractWidgetColumn,

  properties: {
    dateFormat: {
      init: null,
      nullable: true,
      check: "qx.util.format.DateFormat"
    }
  },

  members: {
    _supportsEditing: false,

    /**
     * @Override
     */
    _createCellWidget(row) {
      return new qx.ui.basic.Label();
    },

    /**
     * @Override
     */
    _getModelBindingOptions(widget, model) {
      return {
        converter: (data, model, source, target) => {
          if (!data) return "";
          if (qx.lang.Type.isNumber(data)) data = new Date(data);
          let df =
            this.getDateFormat() || qx.util.format.DateFormat.getDateInstance();
          return df.format(data);
        }
      };
    }
  }
});
