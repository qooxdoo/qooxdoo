/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_tree)

************************************************************************ */

/**
 * The Tree class implements a tree widget, with collapsable and expandable
 * container nodes and terminal leaf nodes. You instantiate a Tree object as the
 * root of the tree, then add {@link TreeFolder} (node) and {@link TreeFile}
 * (leaf) objects as needed, using the (inherited) <code>add()</code> method.
 *
 * Beware though that the <b>tree structure</b> you are building is internally
 * augmented with other widgets to achieve the desired look and feel. So if you
 * later try to navigate the tree e.g. by using the
 * <code>getChildren()</code> method, you get more (and type-wise different)
 * children than you initially added. If this is inconvenient you may want to
 * maintain a tree model alongside the tree widget in your application.
 *
 * The handling of <b>selections</b> within a tree is somewhat distributed
 * between the root Tree object and the attached {@link
 * qx.ui.tree.SelectionManager TreeSelectionManager}. To get the
 * currently selected element of a tree use the Tree{@link #getSelectedElement
 * getSelectedElement} method and Tree{@link #setSelectedElement
 * setSelectedElement} to set it. The TreeSelectionManager handles more
 * coars-grained issues like providing selectAll()/deselectAll() methods.
 *
 * @appearance tree {qx.ui.layout.HorizontalBoxLayout}
 * @appearance tree-icon {qx.ui.basic.Image}
 * @appearance tree-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.tree.Tree",
{
  extend : qx.ui.tree.Tree,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      COMMON CHECKERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns whether the passed object vObject is a TreeFolder.
     *
     * @type static
     * @param vObject {Object} an object
     */
    isTreeFolder : function(vObject) {
      return (vObject && vObject instanceof qx.ui.tree.TreeFolder && !(vObject instanceof qx.ui.tree.Tree));
    },


    /**
     * Returns whether vObject is a TreeFolder and is open and
     * has content.
     *
     * @type static
     * @param vObject {Object} an object
     */
    isOpenTreeFolder : function(vObject) {
      return (vObject instanceof qx.ui.tree.TreeFolder && vObject.getOpen() && vObject.hasContent());
    }
  }

});
