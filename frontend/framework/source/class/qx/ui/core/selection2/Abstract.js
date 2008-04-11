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

qx.Class.define("qx.ui.core.selection2.Abstract",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._selection = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    multiSelection :
    {
      check : "Boolean",
      init : false
    },

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





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      ABSTRACT METHODS
    ---------------------------------------------------------------------------
    */

    _itemToHashCode : function(item) {
      throw new Error("Abstract method call: itemToHashcode()");
    },


    // property apply
    _applyLeadItem : function(value) {
      throw new Error("Abstract method call: _applyLeadItem()");
    },


    // property apply
    _applyAnchorItem : function(value) {
      throw new Error("Abstract method call: _applyAnchorItem()");
    },







    /*
    ---------------------------------------------------------------------------
      CALLED BY THE CONNECTED OBJECT
    ---------------------------------------------------------------------------
    */

    handleMouseDown : function(item, event)
    {
      if (this.getMultiSelection())
      {
        this.setLeadItem(item);



        // TODO
      }
      else
      {
        this.setSelected(item);
      }
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


    isSelected : function(item)
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
    },


    clear : function()
    {
      var current = this._selection;

      for (var hash in current) {

      }

      this._selection = {};
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_selection");
  }
});
