/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Class.define("tutorial.view.Description",
{
  extend : qx.ui.container.Stack,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @lint ignoreUndefined(qxc)
   */
  construct : function()
  {
    this.base(arguments);

    this.add(new qx.ui.basic.Label("Description"));

  }
});
