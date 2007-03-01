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
#embed(qx.widgettheme/arrows/down.gif)

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
 */
qx.Class.define("qx.ui.form.ComboBox",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // ************************************************************************
    //   LIST
    // ************************************************************************
    var l = this._list = new qx.ui.form.List;

    l.setAppearance("combo-box-list");

    // ************************************************************************
    //   MANAGER
    // ************************************************************************
    var m = this._manager = this._list.getManager();

    m.setMultiSelection(false);
    m.setDragSelection(false);

    // ************************************************************************
    //   POPUP
    // ************************************************************************
    var p = this._popup = new qx.ui.popup.Popup;

    p.setAppearance("combo-box-popup");
    p.setAutoHide(false);

    p.add(l);

    // ************************************************************************
    //   TEXTFIELD
    // ************************************************************************
    var f = this._field = new qx.ui.form.TextField;

    f.setAppearance("combo-box-text-field");
    f.setTabIndex(-1);

    this.add(f);

    // ************************************************************************
    //   BUTTON
    // ************************************************************************
    // Use qx.ui.basic.Atom instead of qx.ui.form.Button here to omit the registration
    // of the unneeded and complex button events.
    var b = this._button = new qx.ui.basic.Atom(null, "widget/arrows/down.gif");

    b.setAppearance("combo-box-button");
    b.setTabIndex(-1);

    this.add(b);

    // ************************************************************************
    //   BEHAVIOR
    // ************************************************************************
    this.setTabIndex(1);
    this.setEditable(false);

    // ************************************************************************
    //   WIDGET MOUSE EVENTS
    // ************************************************************************
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mousewheel", this._onmousewheel);

    // ************************************************************************
    //   WIDGET KEY EVENTS
    // ************************************************************************
    this.addEventListener("keydown", this._onkeydown);
    this.addEventListener("keypress", this._onkeypress);
    this.addEventListener("keyinput", this._onkeyinput);

    // ************************************************************************
    //   WIDGET STATE EVENTS
    // ************************************************************************
    this.addEventListener("beforeDisappear", this._onbeforedisappear);

    // ************************************************************************
    //   CHILDREN EVENTS
    // ************************************************************************
    this._popup.addEventListener("appear", this._onpopupappear, this);
    this._field.addEventListener("input", this._oninput, this);

    // ************************************************************************
    //   DOCUMENT EVENTS
    // ************************************************************************
    var vDoc = qx.ui.core.ClientDocument.getInstance();
    vDoc.addEventListener("windowblur", this._testClosePopup, this);

    // ************************************************************************
    //   REMAPPING
    // ************************************************************************
    this.remapChildrenHandlingTo(l);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "beforeInitialOpen" : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "combo-box"
    },

    editable :
    {
      _legacy  : true,
      type     : "boolean",
      getAlias : "isEditable"
    },

    selected :
    {
      _legacy  : true,
      type     : "object",
      instance : "qx.ui.form.ListItem"
    },

    value :
    {
      _legacy : true,
      type    : "string"
    },

    pagingInterval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 10
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
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPopup : function() {
      return this._popup;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getList : function() {
      return this._list;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getField : function() {
      return this._field;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getButton : function() {
      return this._button;
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifySelected : function(propValue, propOldValue, propData)
    {
      this._fromSelected = true;

      // only do this if we called setSelected seperatly
      // and not from the property "value".
      if (!this._fromValue) {
        this.setValue(propValue ? propValue.getLabel() : "");
      }

      // reset manager cache
      this._manager.setLeadItem(propValue);
      this._manager.setAnchorItem(propValue);

      // sync to manager
      if (propValue) {
        this._manager.setSelectedItem(propValue);
      } else {
        this._manager.deselectAll();
      }

      // reset hint
      delete this._fromSelected;

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyValue : function(propValue, propOldValue, propData)
    {
      this._fromValue = true;

      // only do this if we called setValue seperatly
      // and not from the event "input".
      if (!this._fromInput)
      {
        if (this._field.getValue() == propValue) {
          this._field.forceValue(null);
        }

        this._field.setValue(propValue);
      }

      // only do this if we called setValue seperatly
      // and not from the property "selected".
      if (!this._fromSelected)
      {
        // inform selected property
        var vSelItem = this._list.findStringExact(propValue);

        // ignore disabled items
        if (vSelItem != null && !vSelItem.getEnabled()) {
          vSelItem = null;
        }

        this.setSelected(vSelItem);
      }

      // reset hint
      delete this._fromValue;

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyEditable : function(propValue, propOldValue, propData)
    {
      var f = this._field;

      f.setReadOnly(!propValue);
      f.setCursor(propValue ? null : "default");
      f.setSelectable(propValue);

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {var} TODOC
     */
    _modifyEnabled : function(propValue, propOldValue, propData)
    {
      if (this._button) {
        this._button.setEnabled(propValue);
      }

      if (this._field) {
        this._field.setEnabled(propValue);
      }

      return this.base(arguments, propValue, propOldValue, propData);
    },




    /*
    ---------------------------------------------------------------------------
      POPUP HELPER
    ---------------------------------------------------------------------------
    */

    _oldSelected : null,


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _openPopup : function()
    {
      var p = this._popup;
      var el = this.getElement();

      if (!p.isCreated()) {
        this.createDispatchEvent("beforeInitialOpen");
      }

      if (this._list.getChildrenLength() == 0) {
        return;
      }

      p.positionRelativeTo(el, 1, qx.html.Dimension.getBoxHeight(el));
      p.setWidth(this.getBoxWidth() - 2);

      p.setParent(this.getTopLevelWidget());
      p.show();

      this._oldSelected = this.getSelected();

      this.setCapture(true);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _closePopup : function()
    {
      this._popup.hide();
      this.setCapture(false);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _testClosePopup : function()
    {
      if (this._popup.isSeeable()) {
        this._closePopup();
      }
    },


    /**
     * TODOC
     *
     * @type member
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onbeforedisappear : function(e) {
      this._testClosePopup();
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
    _onmousedown : function(e)
    {
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
          break;

        case this:
        case this._list:
          break;

        default:
          if (vTarget instanceof qx.ui.form.ListItem && vTarget.getParent() == this._list)
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      switch(e.getTarget())
      {
        case this._field:
          if (this.getEditable()) {
            break;
          }

          // no break here

        default:
          this._button.removeState("pressed");
          break;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e)
    {
      var vTarget = e.getTarget();

      if (vTarget instanceof qx.ui.form.ListItem)
      {
        var vManager = this._manager;

        vManager.deselectAll();

        vManager.setLeadItem(vTarget);
        vManager.setAnchorItem(vTarget);

        vManager.setSelectedItem(vTarget);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
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
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e)
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

            this.setSelected(vNext);

            return;
          }

          break;
      }

      // Default Handling
      if (!this.isEditable() || vVisible)
      {
        this._list._onkeypress(e);

        var vSelected = this._manager.getSelectedItem();

        if (!vVisible) {
          this.setSelected(vSelected);
        } else if (vSelected) {
          this._field.setValue(vSelected.getLabel());
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
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _visualizeBlur : function()
    {
      // Force blur, even if mouseFocus is not active because we
      // need to be sure that the previous focus rect gets removed.
      // But this only needs to be done, if there is no new focused element.
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.getEnableElementFocus() && !this.getFocusRoot().getFocusedChild())
        {
          try
          {
            if (this.getEditable()) {
              this.getField().getElement().blur();
            } else {
              this.getElement().blur();
            }
          }
          catch(ex) {}
        }
      }
      else
      {
        if (this.getEnableElementFocus())
        {
          try
          {
            if (this.getEditable()) {
              this.getField().getElement().blur();
            } else if (!this.getFocusRoot().getFocusedChild()) {
              this.getElement().blur();
            }
          }
          catch(ex) {}
        }
      }

      this.removeState("focused");
      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _visualizeFocus : function()
    {
      if (!qx.event.handler.FocusHandler.mouseFocus && this.getEnableElementFocus())
      {
        try
        {
          if (this.getEditable())
          {
            this.getField().getElement().focus();
            this.getField()._ontabfocus();
          }
          else
          {
            this.getElement().focus();
          }
        }
        catch(ex) {}
      }

      this.addState("focused");
      return true;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // If this is not a page unload, we have to reset the parent. Otherwise,
    // disposing a ComboBox that was clicked at least once would mean that
    // the popup is still referenced by the parent. When an application
    // repeatedly creates and disposes ComboBoxes, this would mean a memleak
    // (and it would also mess with other things like focus management).
    if (this._popup && !qx.core.Object.inGlobalDispose()) {
      this._popup.setParent(null);
    }

    this._disposeObjects("_popup", "_list", "_manager", "_field", "_button");
  }
});
