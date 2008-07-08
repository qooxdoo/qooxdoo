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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @appearance list
 */
qx.Class.define("qx.ui.form.List",
{
  extend : qx.ui.core.ScrollArea,
  implement : qx.ui.core.IFormElement,
  include : [ qx.ui.core.MRemoteChildrenHandling, qx.ui.core.MSelectionHandling ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param horizontal {Boolean?false} Whether the list should be horizontal.
   */
  construct : function(horizontal)
  {
    this.base(arguments);

    // Create content
    this.__content = new qx.ui.container.Composite();

    // Used to fire item add/remove events
    this.__content.addListener("addChildWidget", this._onAddChild, this);
    this.__content.addListener("removeChildWidget", this._onRemoveChild, this);

    // Add to scrollpane
    this._getChildControl("pane").add(this.__content);

    // Apply orientation
    horizontal == null ?
      this.initOrientation() :
      this.setOrientation(horizontal ? "horizontal" : "vertical");

    // Add keypress listener
    this.addListener("keypress", this._onKeyPress);
    this.addListener("keyinput", this._onKeyInput);

    // Add selection change listener
    this.addListener("changeSelection", this._onChangeSelection);

    // initialize the search string
    this._pressedString = "";
  },



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * This event is fired after a list item was added to the list. The
     * {@link qx.event.type.Data#getData} method of the event returns the
     * added item.
     */
    addItem : "qx.event.type.Data",


    /**
     * This event is fired after a list item has been removed from the list.
     * The {@link qx.event.type.Data#getData} method of the event returns the
     * removed item.
     */
    removeItem : "qx.event.type.Data",


    /**
     * Fired on every modification of the selection which also means that the
     * value has been modified.
     */
    changeValue : "qx.event.type.Data"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "list"
    },


    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    /**
     * Whether the list should be rendered horizontal or vertical.
     */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyOrientation"
    },


    /** Spacing between the items */
    spacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applySpacing",
      themeable : true
    },


    /** Controls whether the inline-find feature is activated or not */
    enableInlineFind :
    {
      check : "Boolean",
      init : true
    },


    /** The name of the list. Mainly used for serialization proposes. */
    name :
    {
      check : "String",
      nullable : true,
      event : "changeName"
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
      SELECTION API
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the selection manager to use */
    SELECTION_MANAGER : qx.ui.core.selection.ScrollArea,




    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.__content;
    },


    /**
     * Handle child widget adds on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onAddChild : function(e) {
      this.fireDataEvent("addItem", e.getData());
    },


    /**
     * Handle child widget removes on the content pane
     *
     * @param e {qx.event.type.Data} the event instance
     */
    _onRemoveChild : function(e) {
      this.fireDataEvent("removeItem", e.getData());
    },




    /*
    ---------------------------------------------------------------------------
      FORM ELEMENT API
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the stringified value of the list. This is a comma
     * separated string with all the values (or labels as fallback).
     *
     * @type member
     * @return {String} Value of the list
     */
    getValue : function()
    {
      var selected = this.getSelection();
      var result = [];
      var value;

      for (var i=0, l=selected.length; i<l; i++)
      {
        // Try value first
        value = selected[i].getValue();

        // Fallback to label
        if (value == null) {
          value = selected[i].getLabel();
        }

        result.push(value);
      }

      return result.join(",");
    },


    /**
     * Applied new selection from a comma separated list of values (labels
     * as fallback) of the list items.
     *
     * @type member
     * @param value {String} Comma separated list
     */
    setValue : function(value)
    {
      // Clear current selection
      var splitted = value.split(",");

      // Building result list
      var result = [];
      var item;
      for (var i=0, l=splitted.length; i<l; i++)
      {
        item = this._findItem(splitted[i]);
        if (item) {
          result.push(item);
        } else {
          this.warn("Could not find item: " + splitted[i] + "!");
        }
      }

      // Replace current selection
      this.replaceSelection(result);
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Used to route external <code>keypress</code> events to the list
     * handling (in fact the manager of the list)
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} KeyPress event
     * @return {void}
     */
    handleKeyPress : function(e)
    {
      if (!this._onKeyPress(e)) {
        this._getManager().handleKeyPress(e);
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      // Create new layout
      var horizontal = value === "horizontal";
      var layout = horizontal ? new qx.ui.layout.HBox() : new qx.ui.layout.VBox();

      // Configure content
      var content = this.__content;
      content.setLayout(layout);
      content.setAllowGrowX(!horizontal);
      content.setAllowGrowY(horizontal);

      // Configure spacing
      this._applySpacing(this.getSpacing());
    },


    // property apply
    _applySpacing : function(value, old) {
      this.__content.getLayout().setSpacing(value);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for <code>keypress</code> events.
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} KeyPress event
     * @return {Boolean} Whether the event was processed
     */
    _onKeyPress : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelection();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }

        return true;
      }

      return false;
    },


    /**
     * Reacts on change event to fire a changeValue event with the
     * value given through {@link #getValue}.
     *
     * @type member
     */
    _onChangeSelection : function()
    {
      if (this.hasListener("changeValue")) {
        this.fireNonBubblingEvent("changeValue", qx.event.type.Data, [this.getValue()]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIND SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Handles the inline find - if enabled
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyInput event
     * @return {void}
     */
    _onKeyInput : function(e)
    {
      // do nothing if the find is disabled
      if (!this.getEnableInlineFind()) {
        return;
      }

      // Only useful in single or one selection mode
      var mode = this.getSelectionMode();
      if (!(mode === "single" || mode === "one")) {
        return;
      }

      // Reset string after a second of non pressed key
      if (((new Date).valueOf() - this._lastKeyPress) > 1000) {
        this._pressedString = "";
      }

      // Combine keys the user pressed to a string
      this._pressedString += String.fromCharCode(e.getCharCode());

      // Find matching item
      var matchedItem = this._findItemByLabel(this._pressedString);

      // if an item was found, select it
      if (matchedItem) {
        this.select(matchedItem);
      }

      // Store timestamp
      this._lastKeyPress = (new Date).valueOf();
      e.preventDefault();
    },


    /**
     * Takes the given string and tries to find a ListItem
     * which starts with this string. The search is not case sensitive and the
     * first found ListItem will be returned. If there could not be found any
     * qualifying list item, null will be returned.
     *
     * @param searchText {String} The text with which the label of the ListItem should start with
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    _findItemByLabel : function(searchText)
    {
      // lower case search text
      searchText = searchText.toLowerCase();

      // get all items of the list
      var items = this.getChildren();

      // go threw all items
      for (var i=0, l=items.length; i<l; i++)
      {
        // get the label of the current item
        var currentLabel = items[i].getLabel();

        // if there is a label
        if (currentLabel)
        {
          // if the label fits with the search text (ignore case, begins with)
          if (currentLabel.toLowerCase().indexOf(searchText) == 0)
          {
            // just return the first found element
            return items[i];
          }
        }
      }

      // if no element was found, return null
      return null;
    },


    /**
     * Find an item by its value or label. It respects the label only when no
     * value is given. This method is used for a HTML-like behavior where the
     * fallback is the label automatically for selectbox options as well. If
     * a value is given the label is ignored, even if it would match!
     *
     * @param valueOrLabel {String} A value or label or any item
     * @return {qx.ui.form.ListItem} The found ListItem or null
     */
    _findItem : function(valueOrLabel)
    {
      // get all items of the list
      var items = this.getChildren();
      var item, value;

      // go threw all items
      for (var i=0, l=items.length; i<l; i++)
      {
        item = items[i];

        // get the label of the current item
        value = item.getValue();
        if (value == null) {
          value = item.getLabel();
        }

        if (value == valueOrLabel) {
          return item;
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__content");
  }
});
