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
      var r = custom.dataRowRenderer =
        new qx.ui.treevirtual.SimpleTreeDataRowRenderer();
      // Disable highlight of selected rows with background colors.
      r.setRowColors({
        bgcolFocusedSelected     : "#f0f0f0",
        bgcolFocusedSelectedBlur : "#f0f0f0",
        bgcolFocused             : "#f0f0f0",
        bgcolFocusedBlur         : "#f0f0f0",
        bgcolSelected            : "white",
        bgcolSelectedBlur        : "white",
        bgcolOdd                 : "white",
        bgcolEven                : "white",
        colNormal                : "black",
        colSelected              : "black"
      });
    }

    this.base(arguments, headings, custom);
    this.setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION_TOGGLE);
  }
});
