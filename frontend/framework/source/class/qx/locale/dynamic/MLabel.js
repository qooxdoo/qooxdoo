qx.Mixin.define("qx.locale.dynamic.MLabel",
{
  members :
  {
    _transformContent : function(value) {
      return this._transformLocalizedString(value, "content");
    }
  }
});