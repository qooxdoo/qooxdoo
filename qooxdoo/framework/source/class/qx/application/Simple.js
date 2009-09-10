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

/* ************************************************************************

#optional(qx.event.handler.Focus)

************************************************************************ */


/**
 * Very simple application, which calls the global methods
 * <code>qxmain()</code> at load time and <code>qxterminate()</code> at
 * shutdown.
 *
 * The methods are executed in the context of this application, which means
 * that all features of <code>qx.core.Object</code> and similar are available.
 *
 * ATTENTION: This class is deprecated. Better use the 'qx.application.Native'
 * instead.
 *
 * @deprecated
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

      this.warn("This application type is deprecated! " +
                "Use the 'Native' application instead.");

      // Enable the focus handler at startup if it's available.
      // This ensures that the key event handler gets the right target for the
      // very first key events.
      // Otherwise the key event handler will invoke the focus handler which
      // then returns the BODY element as fallback because the handler has (yet)
      // no active element.
      // See Bug #1880 for details.
      if (qx.Class.isDefined("qx.event.handler.Focus"))
      {
        qx.event.Registration.getManager(window).getHandler(qx.event.handler.Focus);
      }

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
