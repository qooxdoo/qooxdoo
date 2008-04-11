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

qx.Class.define("qx.ui.core.selection2.WidgetSingle",
{
  extend : qx.ui.core.selection2.AbstractSingle,


  construct : function(widget)
  {
    this.base(arguments);

    this._widget = widget;
  },


  members :
  {
    // overridden
    _itemToHashCode : function(item) {
      return item.$$hash;
    },


    // overridden
    _applySelected : function(value, old)
    {
      if (old) {
        old.removeState("selected");
      }

      if (value)
      {
        value.addState("selected");

        this._widget.scrollItemIntoView(value);
      }
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

  destruct : function()
  {
    this.disposeFields("_widget");
  }
});
