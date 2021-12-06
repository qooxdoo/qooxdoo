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
 * For a Non-GUI application, supporting low-level DOM operations and AJAX
 * communication.
 *
 * @require(qx.core.Init)
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
    close : function()
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
