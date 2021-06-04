qx.Class.define("virtuallist.SetHeightColumn", {
  extend: qx.ui.list.column.AbstractWidgetColumn,
  
  members: {
    _supportsEditing: false,

    /**
     * @Override
     */
    _createCellWidget(row) {
      return new qx.ui.core.Widget().set({ allowGrowY: false, backgroundColor: "red" });
    },

    _onModelChangeValue(model, value, widget) {
      this.base(arguments, model, value, widget);
      value = parseInt(value, 10);
      if (value) {
        widget.set({
          minHeight: value,
          maxHeight: value,
          height: value
        });
      }
    }
  }
});
