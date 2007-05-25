/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_tablevarrowheight)

************************************************************************ */

/**
 * The data model of a table.
 */
qx.Class.define("qx.ui.tablevarrowheight.TableModel",
{
  extend : qx.ui.table.model.Basic,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },





  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     *   Fired when the table data changed (the stuff shown in the table
     *   body). The data property of the event may be null or a map having the
     *   following attributes:
     *   <ul>
     *     <li>
     *       firstRow: The index of the first row that has changed.
     *     </li>
     *     <li>
     *       lastRow: The index of the last row that has changed.
     *     </li>
     *     <li>
     *       firstColumn: The model index of the first column that has changed.
     *     </li>
     *     <li>
     *       lastColumn: The model index of the last column that has changed.
     *     </li>
     *   </ul>
     */
    "dataChanged" : "qx.event.type.DataEvent",

    /**
     * Fired when the meta data changed (the stuff shown in the table header).
     */
    "metaDataChanged" : "qx.event.type.Event"
  }

});
