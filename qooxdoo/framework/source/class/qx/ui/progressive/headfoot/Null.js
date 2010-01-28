/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

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
