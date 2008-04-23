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

qx.Class.define("qx.ui.core.selection.Widget",
{
  extend : qx.ui.core.selection.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(widget)
  {
    this.base(arguments);

    this._widget = widget;
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      METHODS FOR CONTAINER
    ---------------------------------------------------------------------------
    */

    // overridden
    _capture : function() {
      this._widget.capture();
    },


    // overridden
    _releaseCapture : function() {
      this._widget.releaseCapture();
    },


    // overridden
    _getLocation : function()
    {
      var elem = this._widget.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },


    // overridden
    _getDimension : function() {
      return this._widget._scrollPane.getComputedInnerSize();
    },


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







    /*
    ---------------------------------------------------------------------------
      METHODS FOR SELECTABLES
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return (item instanceof qx.ui.form.ListItem) && item.getLayoutParent() === this._widget.getContent();
    },


    // overridden
    _getSelectables : function()
    {
      var children = this._widget.getChildren();
      var result = [];
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child.isEnabled()) {
          result.push(child);
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

      // Iterate over children and collect all items
      // between the given two (including them)
      var children = this._widget.getChildren();
      var result = [];
      var active = false;
      var child;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (child === item1 || child === item2)
        {
          if (active)
          {
            result.push(child);
            break;
          }
          else
          {
            active = true;
          }
        }

        if (active && child.isEnabled()) {
          result.push(child);
        }
      }

      return result;
    },


    // overridden
    _getFirstSelectable : function()
    {
      var children = this._widget.getChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        if (children[i].isEnabled()) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getLastSelectable : function()
    {
      var children = this._widget.getChildren();
      for (var i=children.length-1; i>0; i--)
      {
        if (children[i].isEnabled()) {
          return children[i];
        }
      }

      return null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation)
    {
      var vertical = this._widget.getOrientation() === "vertical";

      // TODO: Omit protected access
      var layout = this._widget.getContent()._getLayout();
      var sibling = item;

      if ((vertical && relation === "above") || (!vertical && relation === "left"))
      {
        do {
          sibling = layout.getPreviousSibling(sibling);
        } while (sibling && !sibling.isEnabled());
      }
      else if ((vertical && relation === "under") || (!vertical && relation === "right"))
      {
        do {
          sibling = layout.getNextSibling(sibling);
        } while (sibling && !sibling.isEnabled());
      }
      else
      {
        return null;
      }

      return sibling;
    },


    // overridden
    _selectableToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _scrollSelectableIntoView : function(item) {
      this._widget.scrollItemIntoView(item);
    },


    // overridden
    _styleSelectable : function(item, type, enabled) {
      enabled ? item.addState(type) : item.removeState(type);
    },


    // overridden
    _getSelectableLocationX : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          left : computed.left,
          right : computed.left + computed.width
        };
      }
    },


    // overridden
    _getSelectableLocationY : function(item)
    {
      var computed = item.getBounds();
      if (computed)
      {
        return {
          top : computed.top,
          bottom : computed.top + computed.height
        };
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.disposeFields("_widget");
  }
});
