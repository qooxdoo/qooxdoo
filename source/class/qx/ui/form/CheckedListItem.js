qx.Class.define("qx.ui.form.CheckedListItem", {
  extend: qx.ui.form.CheckBox,

  properties: {
    appearance: {
      init: "checkedlistitem",
      refine: true
    }
  }
});
