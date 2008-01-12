/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
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
 * qx.ui.tree.TreeFile objects are terminal tree rows (i.e. no
 * sub-trees)
 */
qx.Class.define("qx.ui.tree.TreeFile",
{
  extend : qx.ui.tree.AbstractTreeElement,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * The TreeFile constructor understands two signatures. One compatible with the
   * original qooxdoo tree and one compatible with the treefullcontrol widget.
   * If the first parameter if of type {@link TreeRowStructure} the tree
   * file is rendered using this structure. Otherwhise the all three
   * arguments are evaluated.
   *
   * @param labelOrTreeRowStructure {String|TreeRowStructure} Either the structure
   *     defining a tree row or the label text to display for the tree file.
   * @param icon {String?null} the image URL to display for the tree file
   * @param iconSelected {String?null} the image URL to display when the tree file
   *     is selected
   */
  construct : function(labelOrTreeRowStructure, icon, iconSelected)
  {
    this.base(arguments, this._getRowStructure(labelOrTreeRowStructure, icon, iconSelected));
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
     * Returns a string indicating the symbol used to indent the current item,
     * or null.
     *
     * @type member
     * @param vUseTreeLines {Boolean} whether tree lines are used
     * @param vIsLastColumn {Boolean} whether the item is in the last column
     * @return {String | null} "end", "cross", "line" or null
     */
    getIndentSymbol : function(vUseTreeLines, vColumn, vFirstColumn, vLastColumn)
    {
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
     * Returns itself in an array.
     *
     * @type member
     * @return {Array} array containing itself
     */
    getItems : function() {
      return [ this ];
    }
  }
});
