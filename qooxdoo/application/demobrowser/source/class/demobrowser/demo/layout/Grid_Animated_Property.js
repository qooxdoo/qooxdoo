qx.Class.define("demobrowser.demo.layout.Grid_Animated_Property",
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
      this._getElement().set(properties);
    }
  }
});