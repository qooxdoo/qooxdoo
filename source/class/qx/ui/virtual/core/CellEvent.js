/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A cell event instance contains all data for pointer events related to cells in
 * a pane.
 **/
qx.Class.define("qx.ui.virtual.core.CellEvent",
{
  extend : qx.event.type.Pointer,


  properties :
  {
    /** The table row of the event target. */
    row :
    {
      check : "Integer",
      nullable: true
    },

    /** The table column of the event target. */
    column :
    {
      check : "Integer",
      nullable: true
    }
  },


  members :
  {
     /**
      * Initialize the event.
      *
      * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller.
      * @param me {qx.event.type.Pointer} The original pointer event.
      * @param row {Integer?null} The cell's row index.
      * @param column {Integer?null} The cell's column index.
      */
     init : function(scroller, me, row, column)
     {
       me.clone(this);
       this.setBubbles(false);

       this.setRow(row);
       this.setColumn(column);
     }
  }
});
