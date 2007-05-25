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
 * A model that contains all meta data about columns, such as width, renderers,
 * visibility and order.
 *
 * @see qx.ui.table.model.Basic
 */
qx.Class.define("qx.ui.tablevarrowheight.TableColumnModel",
{
  extend : qx.ui.table.columnmodel.Basic,




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
     *   Fired when the width of a column has changed. The data property of the
     *   event is a map having the following attributes:
     *   <ul>
     *     <li>
     *       col: The model index of the column the width of which has changed.
     *     </li>
     *     <li>
     *       newWidth: The new width of the column in pixels.
     *     </li>
     *     <li>
     *       oldWidth: The old width of the column in pixels.
     *     </li>
     *   </ul>
     */
    "widthChanged" : "qx.event.type.DataEvent",

    /**
     *   Fired when the visibility of a column has changed. This event is equal to
     *   "visibilityChanged", but is fired right before.
     */
    "visibilityChangedPre" : "qx.event.type.DataEvent",

    /**
     *   Fired when the visibility of a column has changed. The data property of
     *   the event is a map having the following attributes:
     *   <ul>
     *     <li>
     *       col: The model index of the column the visibility of which has
     *       changed.
     *     </li>
     *     <li>
     *       visible: Whether the column is now visible.
     *     </li>
     *   </ul>
     */
    "visibilityChanged" : "qx.event.type.DataEvent",

    /**
     *   Fired when the column order has changed. The data property of the event
     *   is a map having the following attributes:
     *   <ul>
     *     <li>
     *       col: The model index of the column that was moved.
     *     </li>
     *     <li>
     *       fromOverXPos: The old overall x position of the column.
     *     </li>
     *     <li>
     *       toOverXPos: The new overall x position of the column.
     *     </li>
     *   </ul>
     */
    "orderChanged" : "qx.event.type.DataEvent"
  }

});
