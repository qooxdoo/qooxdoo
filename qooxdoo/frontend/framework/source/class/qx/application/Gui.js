/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * This is the base class for all GUI qooxdoo applications.
 *
 * All applications using qooxdoo widgets should be derived from
 * this class. Normally at least the {@link #main} method will
 * be overridden to define the GUI.
 */
qx.Class.define("qx.application.Gui",
{
  extend : qx.core.Object,
  implement : qx.application.IApplication,





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Called in the document.onload event of the browser. This method should
     * be overridden to implement the GUI setup code of the application.
     *
     * @type member
     */
    main : function()
    {
      this.info("Using 0.8.x application class!");

    },


    /**
     * Called in the document.onbeforeunload event of the browser. If the method
     * returns a string value, the user will be asked by the browser, whether
     * he really wants to leave the page. The return string will be displayed in
     * the message box.
     *
     * @type member
     * @return {String?null} message text on unloading the page
     */
    close : function() {},


    /**
     * Called in the document.onunload event of the browser. This method contains the last
     * code which is run inside the page and may contain cleanup code.
     *
     * @type member
     */
    terminate : function() {}
  }
});
