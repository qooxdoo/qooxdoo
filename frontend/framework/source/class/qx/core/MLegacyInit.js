qx.Mixin.define("qx.core.MLegacyInit",
{
  members :
  {
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
        this.setApplication(new qx.component.init.Gui);
      }

      this.getApplication().main = function()
      {
        qx.component.init.Gui.prototype.main();
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
        this.setApplication(new qx.component.init.Gui);
      }

      this.getApplication().close = function()
      {
        qx.component.init.Gui.prototype.close();
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
        this.setApplication(new qx.component.init.Gui);
      }

      this.getApplication().terminate = function()
      {
        qx.component.init.Gui.prototype.terminate();
        func.call(this);
      }
    }
  }
});
