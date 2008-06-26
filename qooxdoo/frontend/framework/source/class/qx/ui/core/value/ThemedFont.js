qx.Class.define("qx.ui.core.value.ThemedFont",
{
  extend : qx.lang.BaseString,
  implement : [qx.bom.IFont, qx.ui.core.value.IThemedValue],

  construct : function(font, key)
  {
    this.base(arguments, key);
    this.__font = font;
  },

  members :
  {
    getKey : function() {
      return this._txt;
    },

    getValue : function() {
      return this.__font;
    },

    getStyles : function() {
      return this.__font.getStyles();
    }
  }
});