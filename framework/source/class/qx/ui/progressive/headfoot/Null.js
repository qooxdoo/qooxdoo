/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A null header/footer.  This is not displayed.
 */
qx.Class.define("qx.ui.progressive.headfoot.Null",
{
  extend     : qx.ui.progressive.headfoot.Abstract,


  construct : function()
  {
    this.base(arguments);

    // We're null, so don't display.
    this.exclude();
  }
});
