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
    _release : function() {
      this._widget.releaseCapture();
    },


    // overridden
    _getLocation : function()
    {
      var elem = this._widget.getContainerElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
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
    _getScrollLeft : function() {
      return this._widget.getScrollLeft();
    },


    // overridden
    _getScrollTop : function() {
      return this._widget.getScrollTop();
    },





    /*
    ---------------------------------------------------------------------------
      ABSTRACT METHODS FOR SELECTABLES
    ---------------------------------------------------------------------------
    */

    // overridden
    _isSelectable : function(item) {
      return this._widget.isSelectable(item);
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
    _scrollSelectableIntoView : function(item) {
      this._widget.scrollItemIntoView(item);
    },


    // overridden
    _getSelectables : function(item) {
      return this._widget.getSelectables();
    },


    // overridden
    _getSelectableRange : function(item1, item2) {
      return this._widget.getSelectableRange(item1, item2);
    },


    // overridden
    _getFirstSelectable : function() {
      return this._widget.getFirstSelectable();
    },


    // overridden
    _getLastSelectable : function() {
      return this._widget.getLastSelectable();
    },


    // overridden
    _getRelatedSelectable : function(item, relation) {
      return this._widget.getRelatedSelectable(item, relation);
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
