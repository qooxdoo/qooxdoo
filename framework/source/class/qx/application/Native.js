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

#require(qx.core.Init)

************************************************************************ */

/**
 * For a Non-GUI application, supporting low-level DOM operations and AJAX
 * communication.
 */
qx.Class.define("qx.application.Native",
{
  extend : qx.core.Object,
  implement : [qx.application.IApplication],




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface method
    main : function()
    {
      // empty
    },


    // interface method
    finalize : function()
    {
      // empty
    },


    // interface method
    terminate : function()
    {
      // empty
    }
  }
});
