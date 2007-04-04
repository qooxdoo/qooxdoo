qx.Interface.define("qx.application.IApplication",
{
  members :
  {
    /**
     * Run main  part of component creation.
     *
     * @type member
     * @return {void}
     */
    main : function() {
      return true;
    },


    /**
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    close : function() {
      return true;
    },


    /**
     * Terminate this component.
     *
     * @type member
     * @return {void}
     */
    terminate : function() {
      return true;
    }
  }
});
