qx.Class.define("demobrowser.demo.ui.GridLayout_4_Property",
{
  extend : qx.fx.Base,

  construct : function(element, property)
  {
    this._propName = property
    this.base(arguments, element);
  },

  members :
  {
    update : function(value)
    {
      var properties = {};
      properties[this._propName] = Math.round(value);
      this._element.set(properties);
    }
  }
});