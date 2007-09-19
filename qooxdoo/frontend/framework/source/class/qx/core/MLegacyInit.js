qx.Mixin.define("qx.core.MLegacyInit",
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please sub class qx.application.Gui");

      if (!this.getApplication()) {
        this.setApplication(new qx.application.Gui);
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please sub class qx.application.Gui");

      if (!this.getApplication()) {
        this.setApplication(new qx.application.Gui);
      }

      this.getApplication().main = function()
      {
        qx.application.Gui.prototype.main.call(this);
        if (this.initialize) {
          this.initialize();
        }
        func.call(this);
        if (this.finalize) {
          qx.client.Timer.once(this.finalize, this, 0);
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please sub class qx.application.Gui");

      if (!this.getApplication()) {
        this.setApplication(new qx.application.Gui);
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please sub class qx.application.Gui");

      if (!this.getApplication()) {
        this.setApplication(new qx.application.Gui);
      }

      this.getApplication().close = function()
      {
        qx.application.Gui.prototype.close.call(this);
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
      qx.log.Logger.deprecatedMethodWarning(arguments.callee, "Please sub class qx.application.Gui");

      if (!this.getApplication()) {
        this.setApplication(new qx.application.Gui);
      }

      this.getApplication().terminate = function()
      {
        qx.application.Gui.prototype.terminate.call(this);
        func.call(this);
      }
    }
  }
});
