/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 David Perez Carmona

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * A "virtual" tree intended to use multiple selection.
 * The selected state of a branch depends on the select state of its leaves.
 * When (de)selecting a branch, the selection state is propagated to its child nodes.
 * Partially selected child are highlighted.
 */
qx.Class.define("qx.ui.treevirtual.RecursiveCheckBoxTree",
{
  extend : qx.ui.treevirtual.CheckBoxTree,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    newSelectionModel :
    {
      refine: true,
      init : function(obj)
      {
        return new qx.ui.treevirtual.RecursiveSelectionModel(obj);
      }
    }
  },

  members:
  {
    /**
     * TODOC
     * @return {Object}
     */
    _calculateSelectedNodes : function()
    {
      var selectedNodes = [];
      this.getSelectionModel().iterateSelection(function(node) {
        selectedNodes.push(node);
      });
      return selectedNodes;
    }
  }
});
