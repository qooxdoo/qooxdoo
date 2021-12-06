/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/**
 * A cell event instance contains all data for pointer events related to cells in
 * a table.
 **/
qx.Class.define("qx.ui.table.pane.CellEvent",
{
  extend : qx.event.type.Pointer,


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The table row of the event target */
    row :
    {
      check : "Integer",
      nullable: true
    },

    /** The table column of the event target */
    column :
    {
      check : "Integer",
      nullable: true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
     *****************************************************************************
        CONSTRUCTOR
     *****************************************************************************
     */

     /**
      * Initialize the event
      *
      * @param scroller {qx.ui.table.pane.Scroller} The tables pane scroller
      * @param me {qx.event.type.Pointer} The original pointer event
      * @param row {Integer?null} The cell's row index
      * @param column {Integer?null} The cell's column index
      */
    init : function(scroller, me, row, column)
    {
      me.clone(this);
      this.setBubbles(false);

      if (row != null) {
        this.setRow(row);
      } else {
        this.setRow(scroller._getRowForPagePos(this.getDocumentLeft(), this.getDocumentTop()));
      }

      if (column != null) {
        this.setColumn(column);
      } else {
        this.setColumn(scroller._getColumnForPageX(this.getDocumentLeft()));
      }
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone.set({
        row: this.getRow(),
        column: this.getColumn()
      });

      return clone;
    }
  }
});
