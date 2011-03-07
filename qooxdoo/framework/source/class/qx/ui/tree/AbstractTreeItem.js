/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Chritian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The AbstractTreeItem serves as a common superclass for the {@link
 * TreeFile} and {@link TreeFolder} classes.
 *
 * @childControl label {qx.ui.basic.Label} label of the tree item
 * @childControl icon {qx.ui.basic.Image} icon of the tree item
 * @childControl open {qx.ui.tree.core.FolderOpenButton} button to open/close a subtree
 *
 * @deprecated Since 1.4 Please use 'qx.ui.tree.core.AbstractTreeItem' instead.
 */
qx.Class.define("qx.ui.tree.AbstractTreeItem",
{
  extend : qx.ui.tree.core.AbstractTreeItem,
  type : "abstract",


  /**
   * @param label {String?null} The tree item's caption text
   */
  construct : function(label)
  {
    this.base(arguments, label);

    qx.log.Logger.deprecatedClassWarning(this.constructor, "The abstract " +
      "class 'qx.ui.tree.AbstractTreeItem' is deprecated please use " +
      "'qx.ui.tree.core.AbstractTreeItem' instead.");
  }
});
