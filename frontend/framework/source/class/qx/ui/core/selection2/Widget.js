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

qx.Class.define("qx.ui.core.selection2.Widget",
{
  extend : qx.ui.core.selection2.Abstract,



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
      WIDGET API
    ---------------------------------------------------------------------------
    */
    
    // overridden
    _isItem : function(item) {
      return this._widget.isItem(item);
    },
    

    // overridden
    _itemToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _styleItem : function(item, type, enabled) {
      enabled ? item.addState(type) : item.removeState(type);
    },


    // overridden
    _captureObject : function() {
      this._widget.capture();
    },
    
    
    // overridden
    _releaseObject : function() {
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
    




    /*
    ---------------------------------------------------------------------------
      SCROLLAREA API
    ---------------------------------------------------------------------------
    */

    // overridden
    _scrollItemIntoView : function(item) {
      this._widget.scrollItemIntoView(item);
    },





    /*
    ---------------------------------------------------------------------------
      REMAINING ITEM SUPPORT API
    ---------------------------------------------------------------------------
    */

    // overridden
    _getItems : function(item) {
      return this._widget.getItems();
    },


    // overridden
    _getItemRange : function(item1, item2) {
      return this._widget.getItemRange(item1, item2);
    },
    
    
    // overridden
    _getFirstItem : function() {
      return this._widget.getFirstItem();
    },


    // overridden
    _getLastItem : function() {
      return this._widget.getLastItem();
    },


    // overridden
    _getItemAbove : function(rel) {
      return this._widget.getItemAbove(rel);
    },


    // overridden
    _getItemUnder : function(rel) {
      return this._widget.getItemUnder(rel);
    },


    // overridden
    _getItemLeft : function(rel) {
      return this._widget.getItemLeft(rel);
    },


    // overridden
    _getItemRight : function(rel) {
      return this._widget.getItemRight(rel);
    },


    // overridden
    _getItemPageUp : function(rel) {
      return this._widget.getItemPageUp(rel);
    },


    // overridden
    _getItemPageDown : function(rel) {
      return this._widget.getItemPageDown(rel);
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
