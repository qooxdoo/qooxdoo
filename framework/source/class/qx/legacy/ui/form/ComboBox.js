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
 * A combo-box for qooxdoo.
 *
 * The major additional feature compared to typical select fields is that it allows
 * it to be editable. Also images are supported inside the popup list.
 *
 * Features:
 * <ul>
 * <li>Editable text field</li>
 * <li>Complete key-navigation</li>
 * <li>Images inside the list</li>
 * <li>Images and text inside the list</li>
 * </ul>
 *
 * @appearance combo-box
 * @appearance combo-box-list {qx.legacy.ui.form.List}
 * @appearance combo-box-popup {qx.legacy.ui.popup.Popup}
 * @appearance combo-box-text-field {qx.legacy.ui.form.TextField}
 * @appearance combo-box-button {qx.legacy.ui.basic.Atom}
 * @state pressed {combo-box-button}
 *
 */
qx.Class.define("qx.legacy.ui.form.ComboBox",
{
  extend : qx.legacy.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // List
    var l = this._list = new qx.legacy.ui.form.List;
    l.setAppearance("combo-box-list");
    l.setTabIndex(-1);
    l.setEdge(0);

    // Manager
    var m = this._manager = this._list.getManager();
    m.setMultiSelection(false);
    m.setDragSelection(false);

    // Popup
    var p = this._popup = new qx.legacy.ui.popup.Popup;
    p.setAppearance("combo-box-popup");
    p.setRestrictToPageLeft(-100000);
    p.setRestrictToPageRight(-100000);
    p.setAutoHide(false);
    p.setHeight("auto");
    p.add(l);

    // Textfield
    var f = this._field = new qx.legacy.ui.form.TextField;
    f.setAppearance("combo-box-text-field");
    f.setTabIndex(-1);
    f.setWidth("1*");
    f.setAllowStretchY(true);
    f.setHeight(null);
    this.add(f);

    // Button
    // Use qx.legacy.ui.basic.Atom instead of qx.legacy.ui.form.Button here to omit the registration
    // of the unneeded and complex button events.
    var b = this._button = new qx.legacy.ui.basic.Atom;
    b.setAppearance("combo-box-button");
    b.setAllowStretchY(true);
    b.setTabIndex(-1);
    b.setHeight(null);
    this.add(b);

    // Mouse Events
    this.addListener("mousedown", this._onmousedown);
    this.addListener("mouseup", this._onmouseup);
    this.addListener("click", this._onclick);

    this.addListener("mouseover", this._onmouseover);
    this.addListener("mousewheel", this._onmousewheel);

    // Key Events
    this.addListener("keydown", this._onkeydown);
    this.addListener("keypress", this._onKeyPress);
    this.addListener("keyinput", this._onkeyinput);

    // Other Events
    this.addListener("beforeDisappear", this._onbeforedisappear);
    this._popup.addListener("appear", this._onpopupappear, this);
    this._field.addListener("input", this._oninput, this);

    // force update of value on locale change
    qx.locale.Manager.getInstance().addListener("changeLocale", this._onlocalechange, this);

    var vDoc = qx.legacy.ui.core.ClientDocument.getInstance();
    vDoc.addListener("windowblur", this._testClosePopup, this);

    // Remapping
    this.remapChildrenHandlingTo(l);

    // Initialize properties
    this.initEditable();
    this.initTabIndex();
    this.initWidth();
    this.initHeight();
    this.initMinWidth();
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * This event is dispatched right before the popup of the combo box
     * is opened the first time (the popup object is not rendered at that time).
     */
    "beforeInitialOpen" : "qx.event.type.Event"
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
      init : "combo-box"
    },

    allowStretchY :
    {
      refine : true,
      init : false
    },

    width :
    {
      refine : true,
      init : 120
    },

    height :
    {
      refine : true,
      init : "auto"
    },

    minWidth :
    {
      refine : true,
      init : 40
    },

    tabIndex :
    {
      refine : true,
      init : 1
    },


    /**
     * Is the text field component editable or the user can only select
     * from the list?
     */
    editable :
    {
      check : "Boolean",
      apply : "_applyEditable",
      event : "changeEditable",
      init : false
    },

    /**
     * This property holds the selected list item object.
     */
    selected :
    {
      check : "qx.legacy.ui.form.ListItem",
      nullable : true,
      apply : "_applySelected",
      event : "changeSelected"
    },

    /**
     * The current value of the combo box
     */
    value :
    {
      check : "String",
      nullable : true,
      apply : "_applyValue",
      event : "changeValue"
    },

    /** How many items to transverse with PageUp and PageDn. */
    pagingInterval :
    {
      check : "Integer",
      init : 10
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor method for the selection manager
     *
     * @return {qx.legacy.ui.selection.SelectionManager} Reference to the selection manager
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Accessor method for the popup widget
     *
     * @return {qx.legacy.ui.popup.Popup} Reference to the popup widget
     */
    getPopup : function() {
      return this._popup;
    },


    /**
     * Accessor method for the list widget
     *
     * @return {qx.legacy.ui.form.List} Reference to the list widget
     */
    getList : function() {
      return this._list;
    },


    /**
     * Accessor method for the text field widget
     *
     * @return {qx.legacy.ui.form.TextField} Reference to the text field widget
     */
    getField : function() {
      return this._field;
    },


    /**
     * Accessor method for the button widget
     *
     * @return {qx.legacy.ui.basic.Atom} Reference to the button widget
     */
    getButton : function() {
      return this._button;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySelected : function(value, old)
    {
      this._fromSelected = true;

      // only do this if we called setSelected seperatly
      // and not from the property "value".
      if (!this._fromValue) {
        this.setValue(value ? value.getLabel().toString() : "");
      }

      // reset manager cache
      this._manager.setLeadItem(value);
      this._manager.setAnchorItem(value);

      // sync to manager
      if (value) {
        this._manager.setSelectedItem(value);
      } else {
        this._manager.deselectAll();
      }

      // reset hint
      delete this._fromSelected;
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyValue : function(value, old)
    {
      this._fromValue = true;

      // only do this if we called setValue seperatly
      // and not from the event "input".
      if (!this._fromInput)
      {
        if (this._field.getValue() == value) {
          this._field.setValue(null);
        }

        this._field.setValue(value);
      }

      // only do this if we called setValue seperatly
      // and not from the property "selected".
      if (!this._fromSelected)
      {
        // inform selected property
        var vSelItem = this._list.findStringExact(value);

        // ignore disabled items
        if (vSelItem != null && !vSelItem.getEnabled()) {
          vSelItem = null;
        }

        this.setSelected(vSelItem);
      }

      // reset hint
      delete this._fromValue;
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyEditable : function(value, old)
    {
      var f = this._field;

      f.setReadOnly(!value);
      f.setCursor(value ? null : "default");
      f.setSelectable(value);
    },




    /*
    ---------------------------------------------------------------------------
      POPUP HELPER
    ---------------------------------------------------------------------------
    */

    _oldSelected : null,


    /**
     * Sets the position and width of the popup. Additionally dispatches an event
     * if the popup is opened the first time.
     * Enables the event capturing.
     *
     * @return {void}
     */
    _openPopup : function()
    {
      var p = this._popup;
      var el = this.getElement();

      if (!p.isCreated()) {
        this.fireEvent("beforeInitialOpen");
      }

      if (this._list.getChildrenLength() == 0) {
        return;
      }

      p.positionRelativeTo(el, 1, qx.legacy.html.Dimension.getBoxHeight(el));
      p.setWidth(this.getBoxWidth() - 2);

      p.setParent(this.getTopLevelWidget());
      p.show();

      this._oldSelected = this.getSelected();

      this.setCapture(true);
    },


    /**
     * Hides the popup and disables the event capturing.
     *
     * @return {void}
     */
    _closePopup : function()
    {
      this._popup.hide();
      this.setCapture(false);
    },


    /**
     * Closes the popup widget if it is seeable. Used e.g. as listener
     * method for the "windowblur" event.
     *
     * @return {void}
     */
    _testClosePopup : function()
    {
      if (this._popup.isSeeable()) {
        this._closePopup();
      }
    },


    /**
     * Toggle opening/closing of the popup widget.
     *
     * @return {void}
     */
    _togglePopup : function() {
      this._popup.isSeeable() ? this._closePopup() : this._openPopup();
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for the "appear" event of the popup widget
     *
     * @param e {qx.event.type.Event} Appear event
     * @return {void}
     */
    _onpopupappear : function(e)
    {
      var vSelItem = this.getSelected();

      if (vSelItem) {
        vSelItem.scrollIntoView();
      }
    },


    /**
     * Listener method for the "input" event of the text field widget
     *
     * @param e {qx.event.type.Data} Input event
     * @return {void}
     */
    _oninput : function(e)
    {
      // Hint for modifier
      this._fromInput = true;

      this.setValue(this._field.getComputedValue());

      // be sure that the found item is in view
      if (this.getPopup().isSeeable() && this.getSelected()) {
        this.getSelected().scrollIntoView();
      }

      delete this._fromInput;
    },


    /**
     * Listener method for the "disappear" event of the combo box. Only tests
     * if the popup widget is closed.
     *
     * @param e {qx.event.type.Event} Disappear event
     * @return {void}
     */
    _onbeforedisappear : function(e) {
      this._testClosePopup();
    },

    /**
     * Listener method for the "changeLocale" event of the locale manager
     *
     * @param e {qx.event.type.Data} ChangeLocale event
     * @return {void}
     */
    _onlocalechange : function(e) {
      var selected = this.getSelected();
      this._applySelected(selected, selected);
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method of the "mousedown" event of the combo box.<br/>
     *
     * @param e {qx.legacy.event.type.MouseEvent} MouseDown event
     * @return {void}
     */
    _onmousedown : function(e)
    {
      // only react on left mouse button
      if (! e.isLeftButtonPressed()) {
        return;
      }

      var vTarget = e.getTarget();

      switch(vTarget)
      {
        case this._field:
          if (this.getEditable()) {
            break;
          }
          // no break here

        case this._button:
          this._button.addState("pressed");
          this._togglePopup();
          this.setCapture(true);
          break;

        default:
          break;
      }

      e.stopPropagation();
    },


    /**
     * Listener method of the "click" event of the combo box.<br/>
     * Opens the popup or delegates the event to the list widget if the user
     * clicked on the list. Hides the popup and release the event capturing if
     * the user is clicking outside the combo box.
     *
     * @param e {qx.event.type.MouseEvent} MouseDown event
     * @return {void}
     */
    _onclick : function(e)
    {
      // only react on left mouse button
      if (! e.isLeftButtonPressed()) {
        return;
      }

      var vTarget = e.getTarget();

      switch(vTarget)
      {
        case this._field:
        case this._button:
        case this:
        case this._list:
          break;

        default:
          if (vTarget instanceof qx.legacy.ui.form.ListItem && vTarget.getParent() == this._list)
          {
            this._list._onmousedown(e);
            this.setSelected(this._list.getSelectedItem());

            this._closePopup();
            this.setFocused(true);
          }
          else if (this._popup.isSeeable())
          {
            this._popup.hide();
            this.setCapture(false);
          }
      }
    },


    /**
     * Listener method for the mouseUp event of the combo box.
     *
     * @param e {qx.legacy.event.type.MouseEvent} MouseUp event
     * @return {void}
     */
    _onmouseup : function(e)
    {
      this._button.removeState("pressed");

      if (!this._popup.isSeeable()) {
        this.setCapture(false);
      }
    },


    /**
     * Listener method for the "mouseOver" event of the combo box.<br/>
     * Delegates the control the selection manager if target is a listitem widget.
     *
     * @param e {qx.legacy.event.type.MouseEvent} MouseOver event
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var vTarget = e.getTarget();

      if (vTarget instanceof qx.legacy.ui.form.ListItem)
      {
        var vManager = this._manager;

        vManager.deselectAll();

        vManager.setLeadItem(vTarget);
        vManager.setAnchorItem(vTarget);

        vManager.setSelectedItem(vTarget);
      }
    },


    /**
     * Listener method for the "mouseWheel" event of the combo box.<br/>
     * Only works if the popup is not seeable.
     *
     * @param e {qx.legacy.event.type.MouseEvent} MouseWheel event
     * @return {void}
     */
    _onmousewheel : function(e)
    {
      if (!this._popup.isSeeable())
      {
        var toSelect;

        var isSelected = this.getSelected();

        if (e.getWheelDelta() < 0) {
          toSelect = isSelected ? this._manager.getNext(isSelected) : this._manager.getFirst();
        } else {
          toSelect = isSelected ? this._manager.getPrevious(isSelected) : this._manager.getLast();
        }

        if (toSelect) {
          this.setSelected(toSelect);
        }
      }

      /* close the popup if the event target is not the combobox or
       * not one of the list items of the popup list
       */

      else
      {
        var vTarget = e.getTarget();

        if (vTarget != this && vTarget.getParent() != this._list)
        {
          this._popup.hide();
          this.setCapture(false);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for "keyDown" event of the combo box.<br/>
     * Handles hitting "Enter", "Escape" and "Alt+Down".
     *
     * @param e {qx.legacy.event.type.KeyEvent} KeyDown event
     * @return {void}
     */
    _onkeydown : function(e)
    {
      var vManager = this._manager;
      var vVisible = this._popup.isSeeable();

      switch(e.getKeyIdentifier())
      {
          // Handle <ENTER>
        case "Enter":
          if (vVisible)
          {
            this.setSelected(this._manager.getSelectedItem());
            this._closePopup();
            this.setFocused(true);
          }
          else
          {
            this._openPopup();
          }

          return;

          // Handle <ESC>

        case "Escape":
          if (vVisible)
          {
            vManager.setLeadItem(this._oldSelected);
            vManager.setAnchorItem(this._oldSelected);

            vManager.setSelectedItem(this._oldSelected);

            this._field.setValue(this._oldSelected ? this._oldSelected.getLabel() : "");

            this._closePopup();
            this.setFocused(true);
          }

          return;

          // Handle Alt+Down

        case "Down":
          if (e.isAltPressed())
          {
            this._togglePopup();
            return;
          }

          break;
      }
    },


    /**
     * Listener method for the "keyPress" event of the combo box.<br/>
     * Handles especially hitting "PageUp" and "PageDown". If the user
     * hits other keys a match is searched and (if found) selected.
     *
     * @param e {qx.legacy.event.type.KeyEvent} KeyPress event
     * @return {void}
     */
    _onKeyPress : function(e)
    {
      var vVisible = this._popup.isSeeable();
      var vManager = this._manager;

      switch(e.getKeyIdentifier())
      {
          // Handle <PAGEUP>
        case "PageUp":
          if (!vVisible)
          {
            var vPrevious;
            var vTemp = this.getSelected();

            if (vTemp)
            {
              var vInterval = this.getPagingInterval();

              do {
                vPrevious = vTemp;
              } while (--vInterval && (vTemp = vManager.getPrevious(vPrevious)));
            }
            else
            {
              vPrevious = vManager.getLast();
            }

            this.setSelected(vPrevious);

            return;
          }

          break;

          // Handle <PAGEDOWN>

        case "PageDown":
          if (!vVisible)
          {
            var vNext;
            var vTemp = this.getSelected();

            if (vTemp)
            {
              var vInterval = this.getPagingInterval();

              do {
                vNext = vTemp;
              } while (--vInterval && (vTemp = vManager.getNext(vNext)));
            }
            else
            {
              vNext = vManager.getFirst();
            }

            this.setSelected(vNext||null);

            return;
          }

          break;
      }

      // Default Handling
      if (!this.isEditable() || vVisible)
      {
        this._list._onKeyPress(e);

        var vSelected = this._manager.getSelectedItem();

        if (!vVisible) {
          this.setSelected(vSelected);
        } else if (vSelected) {
          this._field.setValue(vSelected.getLabel());
        }
      }
    },


    /**
     * Listener method for the "keyInput" event of combo box.
     *
     * @param e {qx.legacy.event.type.KeyEvent} KeyInput event
     * @return {void}
     */
    _onkeyinput : function(e)
    {
      var vVisible = this._popup.isSeeable();

      if (!this.isEditable() || vVisible)
      {
        this._list._onkeyinput(e);

        var vSelected = this._manager.getSelectedItem();

        if (!vVisible) {
          this.setSelected(vSelected);
        } else if (vSelected) {
          this._field.setValue(vSelected.getLabel());
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      FOCUS HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Invokes the blur method directly at the DOM elements and removes the "focused" state.
     *
     * @return {void}
     */
    _visualizeBlur : function()
    {
      this.getField()._visualizeBlur();
      this.removeState("focused");
    },


    /**
     * Invokes the focus method directly at the DOM elements and adds the "focused" state.
     *
     * @return {void}
     */
    _visualizeFocus : function()
    {
      this.getField()._visualizeFocus();
      this.getField().selectAll();
      this.addState("focused");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Remove cross-object event listeners
    var vDoc = qx.legacy.ui.core.ClientDocument.getInstance();
    vDoc.removeListener("windowblur", this._testClosePopup, this);

    var vMgr = qx.locale.Manager.getInstance();
    vMgr.removeListener("changeLocale", this._onlocalechange, this);

    this._disposeObjects("_popup", "_list", "_manager", "_field", "_button");
  }
});
