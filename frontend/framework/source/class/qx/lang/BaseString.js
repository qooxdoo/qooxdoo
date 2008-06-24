qx.Class.define("qx.lang.BaseString",
{
  extend : String,

  construct : function(txt)
  {
    arguments.callee.base.call(this, txt);
    this._txt = txt;
  },

  members :
  {
    toString : function() {
      return this._txt;
    },

    valueOf : function() {
      return this._txt;
    },

    toHashCode : function() {
      qx.core.ObjectRegistry.toHashCode(this);
    }
  }
});