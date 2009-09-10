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
 * Function "renderer" for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 * This is a renderer that simply calls the function provided by the data
 * element.
 */
qx.Class.define("qx.ui.progressive.renderer.FunctionCaller",
{
  extend     : qx.ui.progressive.renderer.Abstract,

  members :
  {
    // overridden
    render : function(state, element)
    {
      element.data(state.getUserData());
    }
  }
});
