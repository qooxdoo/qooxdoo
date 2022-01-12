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
 * Add support for a toolbar in a cell
 */
qx.Class.define("qx.ui.list.column.ToolbarColumn", {
  extend: qx.ui.list.column.AbstractColumn,

  construct(factories) {
    super();
    if (factories) {
      this.__factories = qx.lang.Array.clone(factories);
    } else {
      this.__factories = [];
    }
  },

  members: {
    __factories: null,

    /**
     * Adds a button factory
     *
     * @param factory {ButtonFactory} the factory to add
     */
    addFactory(factory) {
      this.__factories.push(factory);
    },

    /**
     * @Override
     */
    _createCellWidget(row) {
      return new qx.ui.container.Composite(
        new qx.ui.layout.HBox().set({ alignY: "top" })
      );
    },

    /**
     * @Override
     */
    _bindCellWidget(widget, model) {
      let bindData = {
        model: model,
        widget: widget,
        buttons: []
      };

      this.__factories.forEach(factory => {
        let button = factory.createButton();
        widget.add(button);
        let data = factory.bindModel(model, button);
        bindData.buttons.push({
          factory: factory,
          button: button,
          buttonBindData: data
        });
      });
      return bindData;
    },

    /**
     * @Override
     */
    _unbindCellWidget(widget, bindData) {
      bindData.buttons.forEach(element => {
        widget.remove(element.button);
        element.factory.releaseButton(element.button);
        element.factory.unbindModel(element.buttonBindData);
      });
    },

    /**
     * @Override
     */
    _updateEditableImpl(bindData, enabled, readOnly) {
      bindData.buttons.forEach(element =>
        element.factory.updateEnabled(
          element.buttonBindData,
          enabled && !readOnly
        )
      );
    }
  }
});
