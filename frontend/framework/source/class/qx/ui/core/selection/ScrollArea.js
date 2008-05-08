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
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("qx.ui.core.selection.ScrollArea",
{
  extend : qx.ui.core.selection.Widget,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return item.isEnabled() && item.getLayoutParent() === this._widget.getChildrenContainer();
    },





    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getDimension : function() {
      return this._widget._scrollPane.getComputedInnerSize();
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getScroll : function()
    {
      return {
        left : this._widget.getScrollLeft(),
        top : this._widget.getScrollTop()
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff)
    {
      var widget = this._widget;

      // TODO: Implement scrollBy in ScrollArea

      if (xoff != 0) {
        widget.setScrollLeft(widget.getScrollLeft() + xoff);
      }

      if (yoff != 0) {
        widget.setScrollTop(widget.getScrollTop() + yoff);
      }
    },


    // overridden
    _scrollItemIntoView : function(item) {
      this._widget.scrollItemIntoView(item);
    },





    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _getPage : function(lead, up)
    {
      var widget = this._widget;

      var selectables = this._getSelectables();
      var length = selectables.length;
      var start = selectables.indexOf(lead);

      if (start === -1) {
        return null;
      }

      var scrollTop = widget.getScrollTop();
      var innerHeight = widget.getComputedInnerSize().height;

      var found;
      var itemTop, itemHeight;

      if (up)
      {
        var min = scrollTop;
        var i=start;

        // Loop required to scroll pages up dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i>=0; i--)
          {
            top = this._widget.getItemTop(selectables[i]);
            height = selectables[i].getBounds().height;

            // This item is out of the visible block
            if (top < min)
            {
              // Use previous one
              found = i+1;
              break;
            }
          }

          // Nothing found. Return first item.
          if (found == null)
          {
            var first = this._getFirstSelectable();
            return first == lead ? null : first;
          }

          // Found item, but is identical to start or even before start item
          // Update max height to try on next page
          if (found >= start)
          {
            // Reduce by innerHeight, height of the lead item, and the scrollTop of the lead item
            min -= innerHeight - lead.getBounds().height - (this._widget.getItemTop(lead) - scrollTop);

            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
        }
      }
      else
      {
        var max = innerHeight + scrollTop;
        var i=start;

        // Loop required to scroll pages down dynamically
        while(1)
        {
          // Iterate through all selectables from start
          for (; i<length; i++)
          {
            top = this._widget.getItemTop(selectables[i]);
            height = selectables[i].getBounds().height;

            // This item is out of the visible block
            if ((top + height) > max)
            {
              // Use previous one
              found = i-1;
              break;
            }
          }

          // Nothing found. Return last item.
          if (found == null)
          {
            var last = this._getLastSelectable();
            return last == lead ? null : last;
          }

          // Found item, but is identical to start or even before start item
          // Update max height to try on next page
          if (found <= start)
          {
            max += innerHeight - selectables[found].getBounds().height;
            found = null;
            continue;
          }

          // Return selectable
          return selectables[found];
        }
      }
    }
  }
});
