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

/**
 * A selection manager. This is a helper class that handles all selection
 * related events and updates a SelectionModel.
 * <p>
 * Widgets that support selection should use this manager. This way the only
 * thing the widget has to do is mapping mouse or key events to indexes and
 * call the corresponding handler method.
 *
 * @see SelectionModel
 */
qx.Class.define("qx.ui.table.selection.Manager",
{
  extend : qx.core.Object,




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
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The selection model where to set the selection changes.
     */
    selectionModel :
    {
      check : "qx.ui.table.selection.Model"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastMouseDownHandled : null,


    /**
     * Handles the mouse down event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     */
    handleMouseDown : function(index, evt)
    {
      if (evt.isLeftPressed())
      {
        var selectionModel = this.getSelectionModel();

        if (!selectionModel.isSelectedIndex(index))
        {
          // This index is not selected -> We react when the mouse is pressed (because of drag and drop)
          this._handleSelectEvent(index, evt);
          this.__lastMouseDownHandled = true;
        }
        else
        {
          // This index is already selected -> We react when the mouse is released (because of drag and drop)
          this.__lastMouseDownHandled = false;
        }
      }
      else if (evt.isRightPressed() && evt.getModifiers() == 0)
      {
        var selectionModel = this.getSelectionModel();

        if (!selectionModel.isSelectedIndex(index))
        {
          // This index is not selected -> Set the selection to this index
          selectionModel.setSelectionInterval(index, index);
        }
      }
    },


    /**
     * Handles the mouse up event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     */
    handleMouseUp : function(index, evt)
    {
      if (evt.isLeftPressed() && !this.__lastMouseDownHandled) {
        this._handleSelectEvent(index, evt);
      }
    },


    /**
     * Handles the mouse click event.
     *
     * @param index {Integer} the index the mouse is pointing at.
     * @param evt {Map} the mouse event.
     */
    handleClick : function(index, evt) {},


    /**
     * Handles the key down event that is used as replacement for mouse clicks
     * (Normally space).
     *
     * @param index {Integer} the index that is currently focused.
     * @param evt {Map} the key event.
     */
    handleSelectKeyDown : function(index, evt) {
      this._handleSelectEvent(index, evt);
    },


    /**
     * Handles a key down event that moved the focus (E.g. up, down, home, end, ...).
     *
     * @param index {Integer} the index that is currently focused.
     * @param evt {Map} the key event.
     */
    handleMoveKeyDown : function(index, evt)
    {
      var selectionModel = this.getSelectionModel();

      switch(evt.getModifiers())
      {
        case 0:
          selectionModel.setSelectionInterval(index, index);
          break;

        case qx.event.type.Dom.SHIFT_MASK:
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
     * Handles a select event.
     *
     * @param index {Integer} the index the event is pointing at.
     * @param evt {Map} the mouse event.
     */
    _handleSelectEvent : function(index, evt)
    {
      var selectionModel = this.getSelectionModel();

      var leadIndex = selectionModel.getLeadSelectionIndex();
      var anchorIndex = selectionModel.getAnchorSelectionIndex();

      if (evt.isShiftPressed())
      {
        if (index != leadIndex || selectionModel.isSelectionEmpty())
        {
          // The lead selection index was changed
          if (anchorIndex == -1) {
            anchorIndex = index;
          }

          if (evt.isCtrlOrCommandPressed()) {
            selectionModel.addSelectionInterval(anchorIndex, index);
          } else {
            selectionModel.setSelectionInterval(anchorIndex, index);
          }
        }
      }
      else if (evt.isCtrlOrCommandPressed())
      {
        if (selectionModel.isSelectedIndex(index)) {
          selectionModel.removeSelectionInterval(index, index);
        } else {
          selectionModel.addSelectionInterval(index, index);
        }
      }
      else
      {
        // setSelectionInterval checks to see if the change is really necessary
        selectionModel.setSelectionInterval(index, index);
      }
    }
  }
});
