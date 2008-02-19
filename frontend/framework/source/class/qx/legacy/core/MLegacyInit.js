qx.Mixin.define("qx.legacy.core.MLegacyInit",
{
  members :
  {

    /**
     * define the initialize function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param func {Function} callback function
     * @return {void}
     */
    defineInitialize : function(func)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.application.Basic);
      }
      this.getApplication().initialize = function()
      {
        func.call(this);
      }
    },


    /**
     * define the main function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param func {Function} callback function
     * @return {void}
     */
    defineMain : function(func)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.application.Basic);
      }

      this.getApplication().main = function()
      {
        qx.application.Basic.prototype.main.call(this);
        if (this.initialize) {
          this.initialize();
        }
        func.call(this);
        if (this.finalize) {
          qx.event.Timer.once(this.finalize, this, 0);
        }
      }
    },


    /**
     * define the finalize function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param func {Function} callback function
     * @return {void}
     */
    defineFinalize : function(func)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.application.Basic);
      }
      this.getApplication().finalize = function()
      {
        func.call(this);
      }
    },


    /**
     * define the close function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param func {Function} callback function
     * @return {void}
     */
    defineClose : function(func)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.application.Basic);
      }

      this.getApplication().close = function()
      {
        qx.application.Basic.prototype.close.call(this);
        func.call(this);
      }
    },


    /**
     * define the terminate function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param func {Function} callback function
     * @return {void}
     */
    defineTerminate : function(func)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.application.Basic);
      }

      this.getApplication().terminate = function()
      {
        qx.application.Basic.prototype.terminate.call(this);
        func.call(this);
      }
    }
  }
});
