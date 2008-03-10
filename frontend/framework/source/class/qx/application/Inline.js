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
 * Base call for all GUI applications which are used in conjunction with
 * HTML code on a normal website. This is the ideal environment for
 * typical portal sites which just use a few GUI components.
 */
qx.Class.define("qx.application.Inline",
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
      // Initialize themes
      qx.theme.manager.Meta.getInstance().initialize();

    },


    // interface method
    terminate : function()
    {
      // empty
    }
  }
});
