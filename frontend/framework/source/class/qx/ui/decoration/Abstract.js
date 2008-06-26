qx.Class.define("qx.ui.decoration.Abstract",
{
  type : "abstract",

  extend : qx.core.Object,
  implement : [qx.ui.decoration.IDecorator, qx.ui.core.value.IThemedValue],
  include : qx.ui.core.MThemeTransform,

  members :
  {
    // interface implementation
    getKey : function() {
      return null;
    },


    // interface implementation
    getValue : function() {
      return this;
    }
  }
});