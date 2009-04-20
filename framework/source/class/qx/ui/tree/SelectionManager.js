/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Responsible for the selection management of the {@link Tree}.
 *
 * @internal
 */
qx.Class.define("qx.ui.tree.SelectionManager",
{
  extend : qx.ui.core.selection.ScrollArea,

  members :
  {
    // overridden
    _getSelectableLocationY : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        var top = this._getWidget().getItemTop(item);
        return {
          top: top,
          bottom: top+computed.height
        }
      }
    },


    // overridden
    _isSelectable : function(item) {
      return item instanceof qx.ui.tree.AbstractTreeItem && item.isEnabled();
    },


    // overridden
    _getSelectableFromMouseEvent : function(event) 
    {
      return this._getWidget().getTreeItem(event.getTarget());
    },


    // overridden
    getSelectables : function()
    {
      var widget = this._getWidget();
      var items = widget.getRoot().getItems(true, false, widget.getHideRoot());
      var result = []
      
      for (var i = 0; i < items.length; i++)
      {
        if (items[i].isEnabled()) {
          result.push(items[i]);
        }
      }
      
      return result;
    },


    // overridden
    _getSelectableRange : function(item1, item2)
    {
      // Fast path for identical items
      if (item1 === item2) {
        return [item1];
      }

      var selectables = this.getSelectables();

      var item1Index = selectables.indexOf(item1);
      var item2Index = selectables.indexOf(item2);

      if (item1Index < 0 || item2Index < 0) {
        return [];
      }

      if (item1Index < item2Index) {
        return selectables.slice(item1Index, item2Index+1);
      } else {
        return selectables.slice(item2Index, item1Index+1);
      }
    },


    // overridden
    _getFirstSelectable : function() {
      return this.getSelectables()[0] || null;
    },


    // overridden
    _getLastSelectable : function()
    {
      var selectables = this.getSelectables();
      if (selectables.length > 0) {
        return selectables[selectables.length-1];
      } else {
        return null;
      }
    },

    // overridden
    _getRelatedSelectable : function(item, relation)
    {

      var widget = this._getWidget();

      switch (relation)
      {
        case "above":
          return widget.getPreviousSiblingOf(item, false);

        case "under":
          return widget.getNextSiblingOf(item, false);

        case "left":
          if (item.isOpenable() && item.isOpen()) {
            item.setOpen(false);
          }
          break;

        case "right":
          if (item.isOpenable() && !item.isOpen()) {
            item.setOpen(true);
          }
          break;
      }
      return null;
    }
  }
});