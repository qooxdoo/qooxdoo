/**
 * Resetter write docs about it
 */
qx.Class.define("qx.ui.mobile.form.Resetter",
{
  extend : qx.ui.form.Resetter,
 
  members :
  {
     // override
    _supportsValue : function(formItem) {
      var clazz = formItem.constructor;
      return ( this.base(arguments,formItem) || 
        qx.Class.hasMixin(clazz, qx.ui.mobile.form.MValue)
      );
    }
  }
});
