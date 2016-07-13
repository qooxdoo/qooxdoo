/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * This interface defines what an application class has to implement.
 */
qx.Interface.define("qx.application.IApplication",
{
  members :
  {
    /**
     * Called when the application relevant classes are loaded and ready.
     *
     */
    main : function() {},


    /**
     * Called when the application's main method was executed to handle
     * "final" tasks like rendering or retrieving data.
     *
     */
    finalize : function() {},

    /**
     * Called in the document.beforeunload event of the browser. If the method
     * returns a string value, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @return {String?null} message text on unloading the page
     */
    close : function() {},


    /**
     * This method contains the last code which is run inside the page and may contain cleanup code.
     *
     */
    terminate : function() {}
  }
});
