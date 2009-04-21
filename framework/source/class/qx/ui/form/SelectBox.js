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
     * Martin Wittemann (martinwittemann)
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A form widget which allows a single selection. Looks somewhat like
 * a normal button, but opens a list of items to select when clicking on it.
 */
qx.Class.define("qx.ui.form.SelectBox",
{
  extend : qx.ui.form.AbstractSelectBox,
  implement : [qx.ui.form.IFormElement],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._createChildControl("atom");
    this._createChildControl("spacer");
    this._createChildControl("arrow");

    // Register listener
    this.addListener("mouseover", this._onMouseOver, this);
    this.addListener("mouseout", this._onMouseOut, this);
    this.addListener("click", this._onClick, this);
    this.addListener("mousewheel", this._onMouseWheel, this);
    this.addListener("keyinput", this._onKeyInput, this);
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
      init : "selectbox"
    },

    /**
     * The selected item inside the list.
     */
    selected :
    {
      check : "qx.ui.form.ListItem",
      apply : "_applySelected",
      event : "changeSelected"
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __preSelectedItem : null,


    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "spacer":
          control = new qx.ui.core.Spacer();
          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.basic.Atom(" ");
          control.setCenter(false);
          control.setAnonymous(true);

          this._add(control, {flex:1});
          break;

        case "arrow":
          control = new qx.ui.basic.Image();
          control.setAnonymous(true);

          this._add(control);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates) 
     */
    _forwardStates : {
      focused : true
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelected : function(value, old)
    {
      var list = this.getChildControl("list");
      if (list.getSelected() != value) {
        list.setSelected(value);
      }

      var atom = this.getChildControl("atom");

      var label = value ? value.getLabel() : "";
      label == null ? atom.resetLabel() : atom.setLabel(label);

      var icon = value ? value.getIcon() : "";
      icon == null ? atom.resetIcon() : atom.setIcon(icon);

      // Fire value event
      if (this.hasListener("changeValue")) {
        this.fireDataEvent("changeValue", list.getValue());
      }
    },



    /*
    ---------------------------------------------------------------------------
      FORM ELEMENT INTERFACE METHODS
    ---------------------------------------------------------------------------
    */

    // interface implementation
    setValue : function(value) {
      this.getChildControl("list").setValue(value);
    },


    // interface implementation
    getValue : function()
    {
      var item = this.getSelected();
      return item ? item.getFormValue() : null;
    },

    
    /**
    * Resets the value to the default
    */    
    resetValue : function() 
    {
      var list = this.getChildControl("list");
      var children = list.getChildren();
      if (children[0]) {
        list.setValue(children[0].getFormValue() || null);
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      SINGLE SELECTION INTERFACE METHODS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Clears the whole selection at once.
     *
     * @return {void}
     */
    resetSelection : function() {
      var firstElement = this.getChildControl("list").getChildren()[0]; 
      
      if (firstElement) {
        this.setSelected(firstElement);
      }
    },

    /**
     * EXPERIMENTAL!!!
     * 
     * Detects whether the given item is currently selected.
     *
     * @param item {Object} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    isSelected : function(item) {
      var listElements = this.getChildControl("list").getChildren(); 
      
      if (listElements.length > 0) {
        return this.getSelected() === item;
      } else {
        return false;
      }
    },
    
    /**
     * EXPERIMENTAL!!!
     * 
     * Whether the selection is empty.
     *
     * @return {Boolean} Whether the selection is empty
     */
    isSelectionEmpty : function() {
      var listElements = this.getChildControl("list").getChildren(); 
      
      if (listElements.length > 0) {
        return this.getSelected() ? false : true;
      } else {
        return true;
      }
    },
    
    
    /**
     * EXPERIMENTAL!!!
     * 
     * Returns all elements which are selectable.
     * 
     * @return {LayoutItem[]} The contained items.
     */
    getSelectables: function() {
      return this.getChildControl("list").getChildren();
    },
    

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "mouseover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseOver : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned"))
      {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },


    /**
     * Listener method for "mouseout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {Event} Mouse event
     * @return {void}
     */
    _onMouseOut : function(e)
    {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onClick : function(e) {
      this.toggle();
    },


    /**
     * Event handler for mousewheel event
     *
     * @param e {qx.event.type.Mouse} Mouse event
     */
    _onMouseWheel : function(e)
    {
      if (this.getChildControl("popup").isVisible()) {
        return;
      }

      var direction = e.getWheelDelta() > 0 ? 1 : -1;
      var children = this.getChildren();
      var selected = this.getSelected();

      if (!selected) {
        selected = children[0];
      }

      var index = children.indexOf(selected) + direction;
      var max = children.length - 1;

      // Limit
      if (index < 0) {
        index = 0;
      } else if (index >= max) {
        index = max;
      }

      this.setSelected(children[index]);

      // stop the propagation
      // prevent any other widget from receiving this event
      // e.g. place a selectbox widget inside a scroll container widget
      e.stopPropagation();
      e.preventDefault();
    },


    // overridden
    _onKeyPress : function(e)
    {
      var iden = e.getKeyIdentifier();
      if(iden == "Enter" || iden == "Space")
      {
        // Apply pre-selected item (translate quick selection to real selection)
        if (this.__preSelectedItem)
        {
          this.setSelected(this.__preSelectedItem);
          this.__preSelectedItem = null;
        }

        this.toggle();
      }
      else
      {
        this.base(arguments, e);
      }
    },


    /**
     * Forwards key event to list widget.
     *
     * @param e {qx.event.type.KeyInput} Key event
     */
    _onKeyInput : function(e)
    {
      // clone the event and re-calibrate the event
      var clone = e.clone();
      clone.setTarget(this._list);
      clone.setBubbles(false);

      // forward it to the list
      this.getChildControl("list").dispatchEvent(clone);
    },


    // overridden
    _onListMouseDown : function(e)
    {
      // Apply pre-selected item (translate quick selection to real selection)
      if (this.__preSelectedItem)
      {
        this.setSelected(this.__preSelectedItem);
        this.__preSelectedItem = null;
      }
    },


    // overridden
    _onListChangeSelection : function(e)
    {
      var current = e.getData();
      if (current.length > 0)
      {
        // Ignore quick context (e.g. mouseover)
        // and configure the new value when closing the popup afterwards
        var popup = this.getChildControl("popup");
        var list = this.getChildControl("list");
        var context = list.getSelectionContext();

        if (popup.isVisible() && (context == "quick" || context == "key"))
        {
          this.__preSelectedItem = current[0];
        }
        else
        {
          this.setSelected(current[0]);
          this.__preSelectedItem = null;
        }
      }
      else
      {
        this.resetSelected();
      }
    },


    // overridden
    _onPopupChangeVisibility : function(e)
    {
      // Synchronize the current selection to the list selection
      // when the popup is closed. The list selection may be invalid
      // because of the quick selection handling which is not
      // directly applied to the selectbox
      var popup = this.getChildControl("popup");
      if (!popup.isVisible())
      {
        var list = this.getChildControl("list");

        // check if the list has any children before selecting
        if (list.hasChildren()) {
          list.setSelected(this.getSelected());
        }
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__preSelectedItem");
  }
});
