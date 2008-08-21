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
 * Very simple application, which calls the global methods
 * <code>qxmain()</code> at load time and <code>qxterminate()</code> at
 * shutdown.
 *
 * The methods are executed in the context of this application, which means
 * that all features of <code>qx.core.Object</code> and similar are available.
 */
qx.Class.define("qx.application.Simple",
{
  extend : qx.application.Native,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    main : function()
    {
      this.base(arguments);

      if (window.qxmain) {
        window.qxmain.call(this);
      }
    },


    // overridden
    terminate : function()
    {
      this.base(arguments);

      if (window.qxterminate) {
        window.qxterminate.call(this);
      }
    }
  }
});
