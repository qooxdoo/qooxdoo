/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_treefullcontrol)

************************************************************************ */

/**
 * qx.ui.treefullcontrol.TreeFile objects are terminal tree rows (i.e. no
 * sub-trees)
 */
qx.Class.define("qx.ui.treefullcontrol.TreeFile",
{
  extend : qx.ui.treefullcontrol.AbstractTreeElement,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param treeRowStructure {qx.ui.treefullcontrol.TreeRowStructure} An instance
   *    of qx.ui.treefullcontrol.TreeRowStructure, defining the
   *    structure of this tree row.
   */
  construct : function(treeRowStructure) {
    this.base(arguments, treeRowStructure);
  },




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
     * @param vColumn {var} TODOC
     * @param vFirstColumn {var} TODOC
     * @param vLastColumn {var} TODOC
     * @return {var | string | null} TODOC
     */
    getIndentSymbol : function(vUseTreeLines, vColumn, vFirstColumn, vLastColumn)
    {
      var vLevel = this.getLevel();
      var vExcludeList = this.getTree().getExcludeSpecificTreeLines();
      var vExclude = vExcludeList[vLastColumn - vColumn - 1];

      if (vUseTreeLines && !(vExclude === true))
      {
        if (vColumn == vFirstColumn) {
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
