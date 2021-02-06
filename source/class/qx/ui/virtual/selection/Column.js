/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */


/**
 * Column selection manager
 */
qx.Class.define("qx.ui.virtual.selection.Column",
{
  extend : qx.ui.virtual.selection.Row,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the number of all items in the pane. This number may contain
     * unselectable items as well.
     *
     * @return {Integer} number of items
     */
    _getItemCount : function() {
      return this._pane.getColumnConfig().getItemCount();
    },


    /*
    ---------------------------------------------------------------------------
      IMPLEMENT ABSTRACT METHODS
    ---------------------------------------------------------------------------
    */

    // overridden
    _getSelectableFromPointerEvent : function(event)
    {
      var cell = this._pane.getCellAtPosition(
        event.getDocumentLeft(),
        event.getDocumentTop()
      );

      if (!cell) {
        return null;
      }

      return this._isSelectable(cell.column) ? cell.column : null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation)
    {
      if (relation == "left")
      {
        var startIndex = item-1;
        var endIndex = 0;
        var increment = -1;
      }
      else if (relation == "right")
      {
        var startIndex = item+1;
        var endIndex = this._getItemCount()-1;
        var increment = 1;
      }
      else
      {
        return null;
      }

      for (var i=startIndex; i !== endIndex+increment; i += increment)
      {
        if (this._isSelectable(i)) {
          return i;
        }
      }
      return null;
    },


    // overridden
    _scrollItemIntoView : function(item) {
      if (this._autoScrollIntoView) {
        this._pane.scrollColumnIntoView(item);
      }
    },


    // overridden
    _getSelectableLocationX : function(item)
    {
      var columnConfig = this._pane.getColumnConfig();

      var itemLeft = columnConfig.getItemPosition(item);
      var itemRight = itemLeft + columnConfig.getItemSize(item) - 1;

      return {
        left: itemLeft,
        right: itemRight
      };
    },


    // overridden
    _getSelectableLocationY : function(item)
    {
      return {
        top: 0,
        bottom: this._pane.getRowConfig().getTotalSize() - 1
      };
    }
  }
});
