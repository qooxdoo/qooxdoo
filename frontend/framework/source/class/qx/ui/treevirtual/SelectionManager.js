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
qx.OO.defineClass("qx.ui.treevirtual.SelectionManager",
                  qx.ui.table.SelectionManager,
function()
{
  qx.ui.table.SelectionManager.call(this);
});


/**
 * Handles a key down event that moved the focus (E.g. up, down, home, end, ...).
 *
 * @param index {Integer} the index that is currently focused.
 * @param evt {Map} the key event.
 */
qx.Proto.handleMoveKeyDown = function(index, evt)
{
  var selectionModel = this.getSelectionModel();

  switch (evt.getModifiers())
  {
  case 0:
    break;

  case qx.event.type.DomEvent.SHIFT_MASK:
    var anchor = selectionModel.getAnchorSelectionIndex();
    
    if (anchor == -1)
    {
      selectionModel.setSelectionInterval(index, index);
    }
    else
    {
      selectionModel.setSelectionInterval(anchor, index);
    }
    break;
  }
}


