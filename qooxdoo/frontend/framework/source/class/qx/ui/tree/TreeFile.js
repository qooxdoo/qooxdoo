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
 * Leaf node of a {@link Tree}.
 */

qx.Class.define("qx.ui.tree.TreeFile",
{
  extend : qx.ui.tree.AbstractTreeElement,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      INDENT HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vUseTreeLines {var} TODOC
     * @param vIsLastColumn {var} TODOC
     * @return {var | string | null} TODOC
     */
    getIndentSymbol : function(vUseTreeLines, vIsLastColumn)
    {
      if (vUseTreeLines)
      {
        if (vIsLastColumn) {
          return this.isLastChild() ? "end" : "cross";
        } else {
          return "line";
        }
      }

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateIndent : function() {
      this.addToTreeQueue();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Array} TODOC
     */
    getItems : function() {
      return [ this ];
    }
  }
});
