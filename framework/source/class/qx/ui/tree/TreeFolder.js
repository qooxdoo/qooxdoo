/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The tree folder is a tree element, which can have nested tree elements.
 */
qx.Class.define("qx.ui.tree.TreeFolder",
{
  extend : qx.ui.tree.core.AbstractTreeItem,


  properties :
  {
    appearance :
    {
      refine : true,
      init : "tree-folder"
    }
  },


  members :
  {
    // overridden
    _addWidgets : function()
    {
      this.addSpacer();
      this.addOpenButton();
      this.addIcon();
      this.addLabel();
    }
  }
});
