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

qx.Class.define("qx.ui.core.selection2.AbstractMulti",
{
  extend : qx.core.Object,


  construct : function()
  {
    this.base(arguments);

    this._selection = {};
  },



  properties :
  {
    leadItem :
    {
      nullable : true,
      apply : "_applyLeadItem"
    },


    anchorItem :
    {
      nullable : true,
      apply : "_applyAnchorItem"
    }
  },


  members :
  {
    _itemToHashCode : function(item) {
      throw new Error("Abstract method call: itemToHashcode()");
    },







    handleMouseDown : function(item, event)
    {
      this.debug("Mousedown: " + item);

    },

    handleKeyPress : function(item, event)
    {
      this.debug("Keypress: " + item);

      if (ev.getKeyIdentifier() == "A" && ev.isCtrlPressed())
      {
        this._selectAll();
      }
      else
      {

      }

    },


    _applyLeadItem : function(value)
    {

    },

    _applyAnchorItem : function(value)
    {

    },





    has : function(item)
    {
      var hash = this._itemToHashCode(item);
      return !!this._selection[hash];
    },

    add : function(item)
    {
      var hash = this._itemToHashCode(item);
      this._selection[hash] = item;
    },

    remove : function(item)
    {
      var hash = this._itemToHashCode(item);
      delete this._selection[hash];
    }
  },



  destruct : function()
  {
    this._disposeFields("_selection");

  }
});
