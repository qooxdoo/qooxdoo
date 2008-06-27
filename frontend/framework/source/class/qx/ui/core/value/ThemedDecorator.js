qx.Class.define("qx.ui.core.value.ThemedDecorator",
{
  extend : qx.lang.BaseString,
  implement : [qx.ui.core.value.IThemedValue, qx.ui.decoration.IDecorator],

  construct : function(deco, key)
  {
    this.base(arguments, key);
    this.__deco = deco;
  },

  members :
  {
    getKey : function() {
      return this._txt;
    },

    getValue : function() {
      return this.__deco;
    },

    render : function(element, width, height, backgroundColor, changes) {
      this.__deco.render(element, width, height, backgroundColor, changes);
    },

    reset : function(element) {
      this.__deco.reset(element);
    },

    getInsets : function() {
      return this.__deco.getInsets();
    }
  }
});