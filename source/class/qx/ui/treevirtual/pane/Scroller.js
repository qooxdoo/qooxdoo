/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Tartan Solutions, Inc, http://www.tartansolutions.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Patrick Buxton

************************************************************************ */

/**
 * An overridden pane Scroller for the treevirtual to allow capture of
 * the mouse dblclick event in the tree column. To prevent starting an
 * edit when the tree node editing is turned on and the open/close button
 * is tapped quickly
 */
qx.Class.define("qx.ui.treevirtual.pane.Scroller",
{
  extend : qx.ui.table.pane.Scroller,
  include : [qx.ui.core.scroll.MScrollBarFactory],

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Event handler. Called when the user double tapped a pointer button over the pane.
     *
     * @param e {Map} the event.
     */
    _onDbltapPane : function(e)
    {
      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var col = this._getColumnForPageX(pageX);
      var row = this._getRowForPagePos(pageX, pageY);

      if (col !== null && row !== null) {
        // check if the user is tapping on the open/close button of the tree
        var tree = this.getTable();
        var tableModel = tree.getTableModel();

        if (tableModel instanceof qx.ui.treevirtual.SimpleTreeDataModel && col === tableModel.getTreeColumn()) {
          // Was the click on the open/close button? We get the position and add a bit of
          // latitude to that
          var x = e.getViewportLeft();
          var latitude = 2;

          // Get the node to which this event applies
          var node = tree.getDataModel().getNode(row);

          var buttonPos = tree.getOpenCloseButtonPosition(node);
          if (x >= buttonPos.left - latitude && x <= buttonPos.left + buttonPos.width + latitude) {
            return;
          }
        }
      }
      this.base(arguments, e);
    }
  }
});
