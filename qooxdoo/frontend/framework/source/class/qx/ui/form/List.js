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

    this._manager = new qx.ui.selection.SelectionManager(this);

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

    /** Controls whether the inline-find feature is activated or not */
    enableInlineFind :
    {
      check : "Boolean",
      init : true
    },

    /** Controls whether the leading item should be marked especially or not */
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
     * Accessor method for the selection manager
     *
     * @type member
     * @return {qx.ui.selection.SelectionManager} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Traverses the widget tree upwards until a
     * corresponding qx.ui.form.ListItem to given vItem
     * (event target) is found.
     *
     * @type member
     * @param vItem {var} event target
     * @return {qx.ui.form.ListItem} List item
     */
    getListItemTarget : function(vItem)
    {
      while (vItem != null && vItem.getParent() != this) {
        vItem = vItem.getParent();
      }

      return vItem;
    },


    /**
     * Returns the first selected list item.
     *
     * @type member
     * @return {qx.ui.form.ListItem|null} Selected item or null
     */
    getSelectedItem : function() {
      return this.getSelectedItems()[0] || null;
    },


    /**
     * Returns all selected list items (uses the selection manager).
     *
     * @type member
     * @return {Array} Returns all selected list items.
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
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseOver event
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
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseDown event
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
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} mouseUp event
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
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} click event
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
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.MouseEvent} double-click event
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
     * Dispatches the "action" event on every selected list item
     * when the "Enter" key is pressed
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
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
     * Delegates the control of the event to selection manager
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onkeypress : function(e)
    {
      // Give control to selectionManager
      this._manager.handleKeyPress(e);
    },

    _lastKeyPress : 0,


    /**
     * Handles the inline find - if enabled
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyInput event
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
     * Executes different (depending on the given search type) methods
     * of qx.ui.form.ListItem for searching the given search string.
     * Returns a reference to the qx.ui.form.ListItem where the search string
     * is found first.
     *
     * @type member
     * @param vUserValue {String} search string
     * @param vStartIndex {Number} start index
     * @param vType {String} type of matching
     * @return {qx.ui.form.ListItem | null} list item or null
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
     * Perform a search for a string
     *
     * @type member
     * @param vText {String} search string
     * @param vStartIndex {Number} start index
     * @return {qx.ui.form.ListItem | null} list item or null
     */
    findString : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "String");
    },


    /**
     * Perform a exact search for a string
     *
     * @type member
     * @param vText {String} search string
     * @param vStartIndex {Number} start index
     * @return {qx.ui.form.ListItem | null} list item or null
     */
    findStringExact : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "StringExact");
    },


    /**
     * Perform a search for a value
     *
     * @type member
     *@param vText {String} search string
     * @param vStartIndex {Number} start index
     * @return {qx.ui.form.ListItem | null} list item or null
     */
    findValue : function(vText, vStartIndex) {
      return this._findItem(vText, vStartIndex || 0, "Value");
    },


    /**
     * Perform a exact search for a value
     *
     * @type member
     * @param vText {String} search string
     * @param vStartIndex {Number} start index
     * @return {qx.ui.form.ListItem | null} list item or null
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
     * Compare method called by the sort method
     *
     * @type member
     * @param a {Hash} first hash to compare
     * @param b {Hash} second hash to compare
     * @return {Number} Returns -1|0|1 for the sort method to control the order of the items to sort.
     */
    _sortItemsCompare : function(a, b) {
      return a.key < b.key ? -1 : a.key == b.key ? 0 : 1;
    },


    /**
     * Sorts all items by using the string of the label.
     *
     * @type member
     * @param vReverse {Boolean} Whether the items should be sorted reverse or not.
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
     * Sorts all items by using the value.
     *
     * @type member
     * @param vReverse {Boolean} Whether the items should be sorted reverse or not.
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
