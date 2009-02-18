qx.Class.define("qx.util.PropertyUtil",
{
  statics :
  {
    getUserValue : function(object, propertyName) {
      return object["$$user_" + propertyName];
    },
    
    getThemeValue : function(object, propertyName) {
      return object["$$theme_" + propertyName];
    },
    
    getInitValue : function(object, propertyName) {
      return object["$$init_" + propertyName];
    },
    
    setThemed : function(object, propertyName, value) 
    {
      var styler = qx.core.Property.$$method.setThemed;
      object[styler[propertyName]](value);
    },
    
    resetThemed : function(object, propertyName) 
    {
      var unstyler = qx.core.Property.$$method.resetThemed;
      object[unstyler[propertyName]]();
    }    
  }
});