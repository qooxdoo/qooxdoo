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
     * @return {void}
     */
    main : function() {},


    /**
     * Called when the application's main method was executed to handle
     * "final" tasks like rendering or retrieving data.
     *
     * @return {void}
     */
    finalize : function() {},


    /**
     * This method contains the last code which is run inside the page and may contain cleanup code.
     *
     * @return {void}
     */
    terminate : function() {}
  }
});
