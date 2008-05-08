qx.Interface.define("qx.ui.form.IFormItem",
{
  events :
  {
    "change" : "qx.event.type.Event"
  },

  members :
  {
    setValue : function(value) {},
    getValue : function() {},

    setEnabled : function(value) {},
    getEnabled : function() {},

    focus : function() {},
    blur : function() {}
  }
});