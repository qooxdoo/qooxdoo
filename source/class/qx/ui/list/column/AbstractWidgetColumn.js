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
 * Abstract base for columns which are based on simple widgets, eg TextField
 */
qx.Class.define("qx.ui.list.column.AbstractWidgetColumn", {
  extend: qx.ui.list.column.AbstractColumn,

  properties: {
    /** Path to bind to in the row model object */
    path: {
      init: null,
      check: "String"
    }
  },

  members: {
    _supportsEditing: true,

    /**
     * @Override
     */
    _bindCellWidget(widget, model) {
      let path = this.getPath();
      let data = {
        model: model,
        widget: widget,
        modelChangeId: model.addListener(
          "change" + qx.lang.String.firstUp(path),
          evt => {
            let value = evt.getData();
            this._onModelChangeValue(model, value, widget);
          }
        )
      };

      data.modelValueBindId = model.bind(
        path,
        widget,
        "value",
        this._getModelBindingOptions(widget, model)
      );

      if (this._supportsEditing) {
        data.widgetBindId = widget.bind(
          "value",
          model,
          path,
          this._getWidgetBindingOptions(widget, model)
        );
      }
      //this._onModelChangeValue(model, model["get" + qx.lang.String.firstUp(path)](), widget);
      return data;
    },

    _onModelChangeValue(model, value, widget) {
      this.fireDataEvent("change", value);
    },

    /**
     * Returns the options for binding to the model, same as the `qx.data.SingleValueBinding.bind`
     * options parameter
     *
     * @param model {qx.core.Object}
     * @return {Object?}
     */
    _getModelBindingOptions(model) {
      return undefined;
    },

    /**
     * Returns the options for binding to the widget, same as the `qx.data.SingleValueBinding.bind`
     * options parameter
     *
     * @param model {qx.ui.core.Widget}
     * @return {Object?}
     */
    _getWidgetBindingOptions(widget) {
      return undefined;
    },

    /**
     * @Override
     */
    _unbindCellWidget(widget, bindData) {
      if (bindData.modelValueBindId) {
        bindData.model.removeBinding(bindData.modelValueBindId);
      }
      if (bindData.modelChangeId) {
        bindData.model.removeListenerById(bindData.modelChangeId);
      }
      if (bindData.widgetBindId) {
        widget.removeBinding(bindData.widgetBindId);
      }
    },

    /**
     * @Override
     */
    _updateEditableImpl(bindData, enabled, readOnly) {
      if (this.isReadOnly()) readOnly = true;
      if (enabled) {
        if (typeof bindData.widget.setReadOnly == "function")
          bindData.widget.set({ enabled: true, readOnly: readOnly });
        else bindData.widget.set({ enabled: !readOnly });
      } else {
        bindData.widget.set({ enabled: false });
      }
    }
  }
});
