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

/**
 * A selection manager, which handles the selection in widgets.
 */
qx.Class.define("qx.ui.core.selection.Widget",
{
  extend : qx.ui.core.selection.Abstract,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param widget {qx.ui.core.Widget} The widget to connect to
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
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return item.isEnabled() && item.getLayoutParent() === this._widget;
    },


    // overridden
    _selectableToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _styleSelectable : function(item, type, enabled) {
      enabled ? item.addState(type) : item.removeState(type);
    },


    // overridden
    _capture : function() {
      this._widget.capture();
    },


    // overridden
    _releaseCapture : function() {
      this._widget.releaseCapture();
    },






    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    // overridden
    _getLocation : function()
    {
      var elem = this._widget.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },


    // overridden
    _getDimension : function() {
      return this._widget.getInnerSize();
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
        left : 0,
        top : 0
      };
    },


    // overridden
    _scrollBy : function(xoff, yoff) {
      // empty implementation
    },


    // overridden
    _scrollItemIntoView : function(item) {
      this._widget.scrollChildIntoView(item);
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

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
      var children = this._widget.getChildren();
      var index = children.indexOf(item);
      var sibling;

      if ((vertical && relation === "above") || (!vertical && relation === "left"))
      {
        for (var i=index-1; i>=0; i--)
        {
          sibling = children[i];
          if (sibling.isEnabled()) {
            return sibling;
          }
        }
      }
      else if ((vertical && relation === "under") || (!vertical && relation === "right"))
      {
        for (var i=index+1; i<children.length; i++)
        {
          sibling = children[i];
          if (sibling.isEnabled()) {
            return sibling;
          }
        }
      }

      return null;
    },


    // overridden
    _getPage : function(lead, up)
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_widget");
  }
});
