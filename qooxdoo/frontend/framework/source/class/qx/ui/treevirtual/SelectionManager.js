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

#module(treevirtual)

************************************************************************ */

/**
 * A selection manager. This is a helper class that handles all selection
 * related events and updates a SelectionModel.
 * <p>
 * This Selection Manager differs from its superclass in that we do not want
 * rows to be selected when moving around with the keyboard.
 */
qx.Class.define("qx.ui.treevirtual.SelectionManager",
{
  extend : qx.ui.table.selection.Manager,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(table)
  {
    this.base(arguments);

    this._table = table;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Handles a key down event that moved the focus (E.g. up, down, home, end, ...).
     *
     * @type member
     * @param index {Integer} the index that is currently focused.
     * @param evt {Map} the key event.
     * @return {void}
     */
    handleMoveKeyDown : function(index, evt)
    {
      var selectionModel = this.getSelectionModel();

      switch(evt.getModifiers())
      {
        case 0:
          break;

        case qx.event.type.DomEvent.SHIFT_MASK:
          var anchor = selectionModel.getAnchorSelectionIndex();

          if (anchor == -1) {
            selectionModel.setSelectionInterval(index, index);
          } else {
            selectionModel.setSelectionInterval(anchor, index);
          }

          break;
      }
    },


    /**
     * Handles a select event.  First we determine if the click was on the
     * open/close button and toggle the opened/closed state as necessary.  Then,
     * if the click was not on the open/close button or if the table's
     * "openCloseClickSelectsRow" property so indicates, call our superclass to
     * handle the actual row selection.
     *
     * @type member
     * @param index {Integer} the index the event is pointing at.
     * @param evt {Map} the mouse event.
     * @return {void}
     */
    _handleSelectEvent : function(index, evt)
    {
      function handleOpenCloseClick(table, index, evt)
      {
        // Determine the column containing the tree
        var treeCol = table.getTableModel().getTreeColumn();

        // Get the table model
        var tableModel = table.getTableModel();

        // If the cell hasn't been focused automatically...
        if (evt instanceof qx.event.type.MouseEvent)
        {
          if (! table.getFocusCellOnMouseMove())
          {
            // ... then focus it now so we can determine the node to open/close
            var scrollers = table._getPaneScrollerArr();

            for (var i=0; i<scrollers.length; i++)
            {
              scrollers[i]._focusCellAtPagePos(evt.getPageX(), evt.getPageY());
            }
          }
        }

        // Get the node to which this event applies
        var node = tableModel.getValue(treeCol, table.getFocusedRow());

        if (!node) {
          return false;
        }

        // Was this a mouse event?
        if (evt instanceof qx.event.type.MouseEvent)
        {
          // Yup.  Get the order of the columns
          var tcm = table.getTableColumnModel();
          var columnPositions = tcm._getColToXPosMap();

          // Calculate the position of the beginning of the tree column
          var left = qx.bom.element.Location.getLeft(table.getElement());

          for (i=0; i<columnPositions[treeCol].visX; i++) {
            left += tcm.getColumnWidth(columnPositions[i].visX);
          }

          // Was the click on the open/close button?  That button begins at
          // (node.level - 1) * 19 + 2 (the latter for padding), and has width 19.
          // We add a bit of latitude to that.
          var x = evt.getClientX();
          var latitude = 2;

          var buttonPos = left + (node.level - 1) * 19 + 2;

          if (x >= buttonPos - latitude && x <= buttonPos + 19 + latitude)
          {
            // Yup.  Toggle the opened state for this node.
            tableModel.setState(node, { bOpened : ! node.bOpened });
            return table.getOpenCloseClickSelectsRow() ? false : true;
          }
          else
          {
            return false;
          }
        }
        else
        {
          // See which key generated the event
          var identifier = evt.getKeyIdentifier();

          switch(identifier)
          {
            case "Space":
              // This should only select the row, not toggle the opened state
              return false;

            case "Enter":
              // Toggle the open state if open/close is allowed
              if (!node.bHideOpenClose) {
                tableModel.setState(node, { bOpened : ! node.bOpened });
              }

              return table.getOpenCloseClickSelectsRow() ? false : true;

            default:
              // Unrecognized key.  Ignore it.
              return true;
          }
        }
      }

      // Call our local method to toggle the open/close state, if necessary
      var bNoSelect = handleOpenCloseClick(this._table, index, evt);

      // If we haven't been told not to do the selection...
      if (!bNoSelect)
      {
        // then call the Selection Manager's method to do it.
        var Sm = qx.ui.table.selection.Manager;
        Sm.prototype._handleSelectEvent.call(this, index, evt);
      }
    }
  }
});
