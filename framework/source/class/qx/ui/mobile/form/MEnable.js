/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * The mixin contains all functionality to provide methods
 * for form elements to manipulate their state. [usually "valid" and "invalid"]
 *
 */
qx.Mixin.define("qx.ui.mobile.form.MEnable",
{

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Whether this input element is enabled or not
     */
    enabled :
    {
      init: true,
      check : "Boolean",
      nullable: false,
      event : "changeEnabled",
      apply: "_applyEnabled"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the enable property to the new value
     * @param value {Boolean}, the new value of the input element
     * @param old {Boolean?}, the old value of the input element
     *
     */
    _applyEnabled : function(value,old)
    {
      if(value)
      {
        this._setAttribute("disabled",null);
        if(this.getAnonymous()) {
          this.setAnonymous(false);
        }
      }
      else
      {
        this._setAttribute("disabled","disabled");
        this.setAnonymous(true);
      }
    }

  }
});
