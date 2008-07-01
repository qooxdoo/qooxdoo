qx.Class.define("qx.ui.core.value.Color",
{
  extend : qx.lang.BaseString,
  implement : qx.ui.core.value.IThemedValue,

  construct : function(color, key)
  {
    this.base(arguments, color);
    this._key = key;
    this._color = color;
  },

  statics :
  {
    __pool : {},

    create : function(color, key)
    {
      var poolKey = color + (key ? "_" + key : "");
      var pool = this.__pool;
      if (pool[poolKey])
      {
        return pool[poolKey];
      }
      else
      {
        var colorObj = new qx.ui.core.value.Color(color, key);
        pool[poolKey] = colorObj;
        return colorObj;
      }
    }
  },

  members :
  {
    getKey : function() {
      return this._key;
    }
  }
});