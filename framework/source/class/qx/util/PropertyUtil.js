qx.Class.define("qx.util.PropertyUtil",
{
  statics :
  {
    getUserValue : function(object, propertyName) {
      return object["$$user_" + propertyName];
    },
    
    setUserValue : function(object, propertyName, value) {
      object["$$user_" + propertyName] = value;
    },

    deleteUserValue : function(object, propertyName) {
      delete(object["$$user_" + propertyName]);
    },
    
    
    getThemeValue : function(object, propertyName) {
      return object["$$theme_" + propertyName];
    },
    
    setThemeValue : function(object, propertyName, value) {
      object["$$theme_" + propertyName] = value;
    },
    
    deleteThemeValue : function(object, propertyName) {
      delete(object["$$theme_" + propertyName]);
    },

    
    getInitValue : function(object, propertyName) {
      return object["$$init_" + propertyName];
    },
    
    setInitValue : function(object, propertyName, value) {
      object["$$init_" + propertyName] = value;
    },  
    
    deleteInitValue : function(object, propertyName) {
      delete(object["$$init_" + propertyName]);
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