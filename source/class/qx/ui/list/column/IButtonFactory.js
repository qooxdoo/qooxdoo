qx.Interface.define("qx.ui.list.column.IButtonFactory", {
  members: {
    /**
     * Called to create a button instance
     *
     * @return {qx.ui.form.Button}
     */
    createButton() {},

    /**
     * Called to pool (or destroy) a button instance
     *
     * @param button {qx.ui.form.Button} button returned by `createButton`
     */
    releaseButton(button) {},

    /**
     * Called to bind a button instance to a row
     *
     * @param model {qx.core.Object} the model for the row
     * @param button {qx.ui.form.Button} the button, created by `createButton`
     * @return {Object} binding state data
     */
    bindModel(model, button) {},

    /**
     * Called to unbind a button instance from a row
     *
     * @param bindData {Object} the bindData returned by `bindModel`
     */
    unbindModel(bindData) {},

    /**
     * Sets whether the button is enabled
     *
     * @param bindData {Object} return vablue from `bindModel`
     * @param enabled {Boolean} whether to be enabled
     */
    updateEnabled(bindData, enabled) {}
  }
});
