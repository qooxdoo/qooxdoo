qx.Mixin.define("qx.locale.dynamic.MObject",
{
  construct : function()
  {
    this.__fromLocaleChange = {};
    this.__localeListener = {};
  },


  members :
  {
    _transformLocalizedString : function(value, propertyName)
    {
      var mgr = qx.locale.Manager.getInstance();

      if (!this.__fromLocaleChange[propertyName] && this.__localeListener[propertyName]) {
        mgr.removeListener("changeLocale", this.__localeListener[propertyName], this);
      }
      this.__fromLocaleChange[propertyName] = false;

      if (value instanceof qx.locale.LocalizedString)
      {
        var setter = "set" + qx.lang.String.firstUp(propertyName);
        this.__localeListener[propertyName] = function(e) {
          this.__fromLocaleChange[propertyName] = true;
          this[setter](value.toString());
        };
        mgr.addListener("changeLocale", this.__localeListener[propertyName], this);
      }
      return value.toString();
    }
  }
});