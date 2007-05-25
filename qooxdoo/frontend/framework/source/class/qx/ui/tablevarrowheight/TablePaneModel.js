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
 * The model of a table pane. This model works as proxy to a {@link
 * TableColumnModel} and manages the visual order of the columns shown in a
 * {@link TablePane}.
 */
qx.Class.define("qx.ui.tablevarrowheight.TablePaneModel",
{
  extend : qx.ui.table.pane.Model,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param tableColumnModel {TableColumnModel}
   *   The TableColumnModel of which this model is the proxy.
   */
  construct : function(tableColumnModel) {
    this.base(arguments, tableColumnModel);
  },






  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /**
     * Fired when the model changed.
     */
    "modelChanged" : "qx.event.type.Event"
  }

});
