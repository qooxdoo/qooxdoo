/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_form)

************************************************************************ */

/**
 * @appearance list
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.layout.VerticalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._manager = new qx.manager.selection.SelectionManager(this);

    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("click", this._onclick);
    this.addEventListener("dblclick", this._ondblclick);

    this.addEventListener("keydown", this._onkeydown);
    this.addEventListener("keypress", this._onkeypress);
    this.addEventListener("keyinput", this._onkeyinput);

    // Initialize properties
    this.initOverflow();
    this.initTabIndex();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "list"
    },

    overflow :
    {
      refine : true,
      init : "hidden"
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },

    enableInlineFind :
    {
      check : "Boolean",
      init : true
    },

    markLeadingItem :
    {
      check : "Boolean",
      init : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _pressedString : "",




    /*
    ---------------------------------------------------------------------------
      MANAGER BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {qx.manager.selection.SelectionManager} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vItem {var} TODOC
     * @return {var} TODOC
     */
    getListItemTarget : function(vItem)
    {
      while (vItem != null && vItem.getParent() != this) {
        vItem = vItem.getParent();
      }

      return vItem;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getSelectedItem : function() {
      return this.getSelectedItems()[0] || null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getSelectedItems : function() {
      return this._manager.getSelectedItems();
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var vItem = this.getListItemTarget(e.getTarget());

      if (vItem) {
        this._manager.handleMouseOver(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      var vItem = this.getListItemTarget(e.getTarget());

      if (vItem) {
        this._manager.handleMouseDown(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      var vItem = this.getListItemTarget(e.getTarget());

      if (vItem) {
        this._manager.handleMouseUp(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onclick : function(e)
    {
      var vItem = this.getListItemTarget(e.getTarget());

      if (vItem) {
        this._manager.handleClick(vItem, e);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ondblclick : function(e)
    {
      var vItem = this.getListItemTarget(e.getTarget());

      if (vItem) {
        this._manager.handleDblClick(vItem, e);
      }
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelectedItems();
        var currentItem;

        for (var i=0; i<items.length; i++) {
          items[i].createDispatchEvent("action");
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e)
    {
      // Give control to selectionManager
      this._manager.handleKeyPress(e);
    },

    _lastKeyPress : 0,


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeyinput : function(e)
    {
      if (!this.getEnableInlineFind()) {
        return;
      }

      // Reset string after a second of non pressed key
      if (((new Date).valueOf() - this._lastKeyPress) > 1000) {
        this._pressedString = "";
      }

      // Combine keys the user pressed to a string
      this._pressedString += String.fromCharCode(e.getCharCode());

      // Find matching item
      var matchedItem = this.findString(this._pressedString, null);

      if (matchedItem)
      {
        var oldVal = this._manager._getChangeValue();

        // Temporary disable change event
        var oldFireChange = this._manager.getFireChange();
        this._manager.setFireChange(false);

        // Reset current selection
        this._manager._deselectAll();

        // Update manager
        this._manager.setItemSelected(matchedItem, true);
        this._manager.setAnchorItem(matchedItem);
        this._manager.setLeadItem(matchedItem);

        // Scroll to matched item
        matchedItem.scrollIntoView();

        // Recover event status
        this._manager.setFireChange(oldFireChange);

        // Dispatch event if there were any changes
        if (oldFireChange && this._manager._hasChanged(oldVal)) {
          this._manager._dispatchChange();
        }
      }

      // Store timestamp
      this._lastKeyPress = (new Date).valueOf();
      e.preventDefault();
    },




    /*
    ---------------------------------------------------------------------------
      FIND SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vUserValue {var} TODOC
     * @param vStartIndex {var} TODOC
     * @param vType {var} TODOC
     * @return {var | null} TODOC
     */
    _findItem : function(vUserValue, vStartIndex, vType)
    {
      var vAllItems = this.getChildren();

      // If no startIndex given try to get it by current selection
      if (vStartIndex == null)
      {
        vStartIndex = vAllItems.indexOf(this.getSelectedItem());

        if (vStartIndex == -1) {
          vStartIndex = 0;
        }
      }

      var methodName = "matches" + vType;

      // Mode #1: Find all items after the startIndex
      for (var i=vStartIndex; i<vAllItems.length; i++)
      {
        if (vAllItems[i][methodName](vUserValue)) {
          return vAllItems[i];
        }
      }

      // Mode #2: Find all items before the startIndex
      for (var i=0; i<vStartIndex; i++)
      {
        if (vAllItems[i][methodName](vUserValue)) {
          return vAllItems[i];
        }
      }

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @param vStartIndex {var} TODOC
     * @return {var} TODOC
     */
    findString : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "String");
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @param vStartIndex {var} TODOC
     * @return {var} TODOC
     */
    findStringExact : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "StringExact");
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @param vStartIndex {var} TODOC
     * @return {var} TODOC
     */
    findValue : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "Value");
    },


    /**
     * TODOC
     *
     * @type member
     * @param vText {var} TODOC
     * @param vStartIndex {var} TODOC
     * @return {var} TODOC
     */
    findValueExact : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "ValueExact");
    },




    /*
    ---------------------------------------------------------------------------
      SORT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param a {Array} TODOC
     * @param b {var} TODOC
     * @return {var} TODOC
     */
    _sortItemsCompare : function(a, b) {
      return a.key < b.key ? -1 : a.key == b.key ? 0 : 1;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vReverse {var} TODOC
     * @return {void}
     */
    sortItemsByString : function(vReverse)
    {
      var sortitems = [];
      var items = this.getChildren();

      for (var i=0, l=items.length; i<l; i++)
      {
        sortitems[i] =
        {
          key  : items[i].getLabel(),
          item : items[i]
        };
      }

      sortitems.sort(this._sortItemsCompare);

      if (vReverse) {
        sortitems.reverse();
      }

      for (var i=0; i<l; i++) {
        this.addAt(sortitems[i].item, i);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vReverse {var} TODOC
     * @return {void}
     */
    sortItemsByValue : function(vReverse)
    {
      var sortitems = [];
      var items = this.getChildren();

      for (var i=0, l=items.length; i<l; i++)
      {
        sortitems[i] =
        {
          key  : items[i].getValue(),
          item : items[i]
        };
      }

      sortitems.sort(this._sortItemsCompare);

      if (vReverse) {
        sortitems.reverse();
      }

      for (var i=0; i<l; i++) {
        this.addAt(sortitems[i].item, i);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_manager");
  }
});
