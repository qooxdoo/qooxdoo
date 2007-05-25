/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * The default header cell renderer.
 *
 * @appearance table-header-cell {qx.ui.basic.Atom}
 * @state mouseover {table-header-cell}
 */
qx.Class.define("qx.ui.table.headerrenderer.Default",
{
  extend : qx.ui.table.headerrenderer.Basic,





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {String} The state which will be set for header cells of sorted columns.
     */
    STATE_SORTED           : "sorted",


    /**
     * {String} The state which will be set when sorting is ascending.
     */
    STATE_SORTED_ASCENDING : "sortedAscending"
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    createHeaderCell : function(cellInfo)
    {
      var widget = new qx.ui.basic.Atom();
      widget.setAppearance("table-header-cell");
      widget.setSelectable(false);

      this.updateHeaderCell(cellInfo, widget);

      return widget;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param cellWidget {var} TODOC
     * @return {void}
     */
    updateHeaderCell : function(cellInfo, cellWidget)
    {
      var DefaultHeaderCellRenderer = qx.ui.table.headerrenderer.Default;

      cellWidget.setLabel(cellInfo.name);

      cellInfo.sorted ?
        cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED) :
        cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED);

      cellInfo.sortedAscending ?
        cellWidget.addState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING) :
        cellWidget.removeState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING);
    }
  }
});
