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
 * Super simple application which executes the global methods
 * <code>qxmain</code> (at load) and <code>qxterminate</code> (at shutdown).
 *
 * The methods are executed in context of this application which means
 * that all feature of <code>qx.core.Object</code> and co are available.
 */
qx.Class.define("qx.application.Simple",
{
  extend : qx.application.Abstract,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Called when the application relevant classes are loaded and ready.
     *
     * @type member
     * @return {void}
     */
    main : function()
    {
      if (window.qxmain) {
        window.qxmain.call(this);
      }
    },


    /**
     * This method contains the last code which is run inside the page and may contain cleanup code.
     *
     * @type member
     * @return {void}
     */
    terminate : function()
    {
      if (window.qxterminate) {
        window.qxterminate.call(this);
      }
    }
  }
});
