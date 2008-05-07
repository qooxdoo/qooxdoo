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
    }
  }
});
