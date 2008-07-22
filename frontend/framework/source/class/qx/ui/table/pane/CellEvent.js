/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez Carmona (david-perez)

************************************************************************ */

/**
 * A cell event instance contains all data for mouse events related to cells in
 * a table.
 **/
qx.Class.define("qx.ui.table.pane.CellEvent",
{
  extend : qx.event.type.Mouse,


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
      check : "Integer"
    },

    /** The table column of the event target */
    column :
    {
      check : "Integer"
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
      * @param type {String} The event type
      * @param me {qx.legacy.event.type.MouseEvent} The original mouse event
      */
     init : function(scroller, type, me)
     {
       me.clone(this);
       this._scroller = scroller;
     },


    /**
     * Compute the row where the event has happened.
     *
     * @return {Integer} zero based row number
     */
    _computeRow : function()
    {
      if (this._row == null)
      {
        this._row = this._scroller._getRowForPagePos(this.getPageX(), this.getPageY());
      }
      return this._row;
    },


    /**
     * Compute the column where the event has happened.
     *
     * @return {Integer} zero based column number
     */
    _computeColumn : function()
    {
      if (this._column == null)
      {
        this._column = this._scroller._getColumnForPageX(this.getPageX());
      }
      return this._column;
    }
  },

  destruct : function()
  {
    this._disposeFields("_scroller");
  }
});
