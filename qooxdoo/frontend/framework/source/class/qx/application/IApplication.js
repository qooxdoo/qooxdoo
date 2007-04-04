/**
 * This interface is required by all qooxdoo applications set by
 * {@link qx.core.Init#application}.
 *
 * The {@link #main} method will be called on the document.onload event,
 * {@link #close} on document.beforeunload and {@link #terminate} on document.unload.
 */
qx.Interface.define("qx.application.IApplication",
{
  members :
  {
    /**
     * Called in the document.onload event of the browser. This method should
     * implement the setup code of the application.
     *
     * @type member
     */
    main : function() {
      return true;
    },


    /**
     * Called in the document.beforeunload event of the browser. If the method
     * returns a string value, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @type member
     * @return {String?null} message text on unloading the page
     */
    close : function() {
      return true;
    },


    /**
     * Called in the document.onunload event of the browser. This method contains the last
     * code which is run inside the page and may contain cleanup code.
     *
     * @type member
     */
    terminate : function() {
      return true;
    }
  }
});
