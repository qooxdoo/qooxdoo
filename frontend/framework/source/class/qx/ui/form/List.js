/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * @appearance list
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.core.ScrollArea,
  implement : qx.ui.core.ISelectionContainer,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var content = new qx.ui.core.Widget;
    var layout = new qx.ui.layout.VBox;
    content.setLayout(layout);

    content.set({
      allowGrowX : true,
      allowGrowY : true,
      allowShrinkX : false,
      allowShrinkY : false
    });

    this.setContent(content);

    this._manager = new qx.ui.core.SelectionManager(this);

    content.addListener("mouseover", this._onmouseover, this);
    content.addListener("mousedown", this._onmousedown, this);
    content.addListener("mouseup", this._onmouseup, this);

    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onkeypress);
    this.addListener("keyinput", this._onkeyinput);
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
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    add : function(listItem) {
      this.getContent().getLayout().add(listItem);
    },

    remove : function(listItem) {
      this.getContent().getLayout().remove(listItem);
    },




    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    getNextSelectableItem : function(selectedItem) {
      return this.getContent().getLayout().getNextSibling(selectedItem);
    },

    getPreviousSelectableItem : function(selectedItem) {
      return this.getContent().getLayout().getPreviousSibling(selectedItem);
    },

    getScrollTop : function() {
      return 0;
    },

    setScrollTop : function(scroll) {
      return;
    },

    getSelectableItems : function() {
      return this.getContent().getLayoutChildren();
    },

    getChildren : function() {
      return this.getContent().getLayoutChildren();
    },

    getInnerHeight : function()
    {
      var computed = this.getContent().getComputedInnerSize();
      return computed ? computed.height : 0;
    },






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
     * @param e {qx.event.type.Mouse} mouseOver event
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var target = e.getTarget();

      // Only react on mouseover of the list-items:
      // The list itself is not interesting for selection handling
      if (target === this) {
        return;
      }

      this._manager.handleMouseOver(target, e);
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseDown event
     * @return {void}
     */
    _onmousedown : function(e) {
      this._manager.handleMouseDown(e.getTarget(), e);
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseUp event
     * @return {void}
     */
    _onmouseup : function(e) {
      this._manager.handleMouseUp(e.getTarget(), e);
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
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
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


    /** {Integer} Remember time of last key press */
    _lastKeyPress : 0,

    /** {String} Currently collected string fragment */
    _pressedString : "",


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

      // Stop native event processing
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
    sortItemsByLabel : function(vReverse)
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

      var layout = this.getLayout();
      for (var i=0; i<l; i++) {
        layout.addAt(sortitems[i].item, i);
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

      var layout = this.getLayout();
      for (var i=0; i<l; i++) {
        layout.addAt(sortitems[i].item, i);
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
