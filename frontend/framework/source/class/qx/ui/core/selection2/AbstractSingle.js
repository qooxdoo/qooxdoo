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

qx.Class.define("qx.ui.core.selection2.AbstractSingle",
{
  extend : qx.core.Object,


  construct : function(widget)
  {
    this.base(arguments);

    this._widget = widget;
  },



  properties :
  {
    selected :
    {
      nullable : true,
      apply : "_applySelected"
    },


  },



  members :
  {
    _applySelected : function(value, old) {
      throw new Error("Abstract method call: _applySelected()");
    },

    _getFirstItem : function() {
      throw new Error("Abstract method call: _getFirstItem()");
    },

    _getLastItem : function() {
      throw new Error("Abstract method call: _getLastItem()");
    },

    _getItemAbove : function(rel) {
      throw new Error("Abstract method call: _getItemAbove()");
    },

    _getItemUnder : function(rel) {
      throw new Error("Abstract method call: _getItemUnder()");
    },

    _getItemLeft : function(rel) {
      throw new Error("Abstract method call: _getItemLeft()");
    },

    _getItemRight : function(rel) {
      throw new Error("Abstract method call: _getItemRight()");
    },

    _getItemPageUp : function(rel) {
      throw new Error("Abstract method call: _getItemPageUp()");
    },

    _getItemPageDown : function(rel) {
      throw new Error("Abstract method call: _getItemPageDown()");
    },







    handleMouseDown : function(item, event) {
      this.setSelected(item);
    },

    handleKeyPress : function(item, event)
    {
      var next;
      var current = this.getSelected();

      switch(event.getKeyIdentifier())
      {
        case "Home":
          next = this._getFirstItem();
          break;

        case "End":
          next = this._getLastItem();
          break;

        case "Up":
          next = this._getItemAbove(current);
          break;

        case "Down":
          next = this._getItemUnder(current);
          break;

        case "Left":
          next = this._getItemLeft(current);
          break;

        case "Right":
          next = this._getItemRight(current);
          break;

        case "PageUp":
          next = this._getItemPageUp(current);
          break;

        case "PageDown":
          next = this._getItemPageDown(current);
          break;

        default:
          return;
      }

      // Process result
      if (next) {
        this.setSelected(next);
      }

      // Stop processed events
      event.stopPropagation();
      event.preventDefault();
    },





    isSelected : function(item) {
      return this.getSelected() === item;
    }
  },



  destruct : function()
  {
    this._disposeFields("_widget");

  }
});
