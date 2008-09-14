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
 * The selected state is shown by means of checkboxes to the left of the icon, instead of the row background color
 */
qx.Class.define("qx.ui.treevirtual.CheckBoxTree",
{
  extend : qx.ui.treevirtual.TreeVirtual,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @see qx.ui.treevirtual.TreeVirtual
   */
  construct : function(headings, custom)
  {
    // Allocate default objects if custom objects are not specified
    if (! custom)
    {
      custom = { };
    }
    if (! custom.treeDataCellRenderer)
    {
      custom.treeDataCellRenderer =
        new qx.ui.treevirtual.CheckBoxDataCellRenderer();
    }
    if (! custom.dataRowRenderer)
    {
      var rowRenderer = custom.dataRowRenderer =
        new qx.ui.treevirtual.SimpleTreeDataRowRenderer();
      // Disable highlight of selected rows with background colors.
      // FIXME: ugly usage of renderer's protected methods!
      // TODO: we should probably be using theme colors...
      var colorManager = qx.theme.manager.Color.getInstance();
      colorManager.connect(rowRenderer._styleBgcolFocusedSelected,
                           rowRenderer,
                           "#f0f0f0");
      colorManager.connect(rowRenderer._styleBgcolFocused,
                           rowRenderer,
                           "#f0f0f0");
      colorManager.connect(rowRenderer._styleBgcolSelected,
                           rowRenderer,
                           "#ffffff"); // "white"
      colorManager.connect(rowRenderer._styleBgcolEven,
                           rowRenderer,
                           "#ffffff"); // "white"
      colorManager.connect(rowRenderer._styleBgcolOdd,
                           rowRenderer,
                           "#ffffff"); // "white"
      colorManager.connect(rowRenderer._styleColSelected,
                           rowRenderer,
                           "#000000"); // "black"
      colorManager.connect(rowRenderer._styleColNormal,
                           rowRenderer,
                           "#000000"); // "black"
    }

    this.base(arguments, headings, custom);
    this.setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION_TOGGLE);
  }
});
