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
qx.Class.define("qx.ui.list.column.ButtonFactory", {
  extend: qx.core.Object,
  implement: [qx.ui.list.column.IButtonFactory],

  properties: {
    /** The icon to use; if null, then iconPath is used */
    icon: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** The path to get the icon */
    iconPath: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** The title to use; if null, then titlePath is used */
    title: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** The path to get the title */
    titlePath: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** The appearance of the button, ignored if null */
    appearance: {
      init: null,
      nullable: true,
      check: "String"
    }
  },

  events: {
    /** Fired when the button is clicked; data is a Map:
     *     model {qx.core.Object} the row model
     *     button {qx.core.Object} the button
     */
    execute: "qx.event.type.Data"
  },

  members: {
    /**
     * @Override
     */
    createButton() {
      let button = new qx.ui.form.Button(
        this.getTitle() || "",
        this.getIcon()
      ).set({ allowGrowY: false });
      if (this.getAppearance()) button.setAppearance(this.getAppearance());
      return button;
    },

    /**
     * @Override
     */
    releaseButton(button) {
      button.dispose();
    },

    /**
     * @Override
     */
    bindModel(model, button) {
      let bindData = {
        model,
        button,
        buttonExecuteId: button.addListener("execute", () =>
          this.fireDataEvent("execute", { model, button })
        )
      };

      let path = this.getIconPath();
      if (path) {
        bindData.iconBindingId = model.bind(
          path,
          button,
          "icon",
          this._getIconBindingOptions(model, button)
        );
      }
      path = this.getTitlePath();
      if (path) {
        bindData.titleBindingId = model.bind(
          path,
          button,
          "label",
          this._getTitleBindingOptions(model, button)
        );
      }
      return bindData;
    },

    /**
     * @Override
     */
    unbindModel(bindData) {
      bindData.button.removeListenerById(bindData.buttonExecuteId);
      if (bindData.iconBindingId)
        bindData.model.removeBinding(bindData.iconBindingId);
      if (bindData.titleBindingId)
        bindData.model.removeBinding(bindData.titleBindingId);
    },

    /**
     * @Override
     */
    updateEnabled(bindData, enabled) {
      bindData.button.set({ enabled: enabled });
    },

    /**
     * Returns the options for binding to the model, same as the `qx.data.SingleValueBinding.bind`
     * options parameter
     *
     * @param model {qx.core.Object}
     * @param button {qx.ui.form.Button}
     * @return {Object?}
     */
    _getIconBindingOptions(model, button) {
      return undefined;
    },

    /**
     * Returns the options for binding to the widget, same as the `qx.data.SingleValueBinding.bind`
     * options parameter
     *
     * @param model {qx.ui.core.Widget}
     * @param button {qx.ui.form.Button}
     * @return {Object?}
     */
    _getTitleBindingOptions(widget, button) {
      return undefined;
    }
  }
});
