/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * Basic class for widgets which need a virtual list as popup for example a
 * SelectBox. It's basically supports a drop-down as popup with a virtual list
 * and the whole children management.
 *
 * @childControl dropdown {qx.ui.form.core.VirtualDropDownList} The drop-down list.
 */
qx.Class.define("qx.ui.form.core.AbstractVirtualBox",
{
  extend  : qx.ui.core.Widget,
  include : qx.ui.form.MForm,
  implement : qx.ui.form.IForm,
  type : "abstract",


  /**
   * @param model {qx.data.Array?null} The model data for the widget.
   */
  construct : function(model)
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // Register listeners
    this.addListener("keypress", this._handleKeyboard, this);
    this.addListener("tap", this._handlePointer, this);
    this.addListener("blur", this._onBlur, this);
    this.addListener("resize", this._onResize, this);

    this._createChildControl("dropdown");

    this.bind('allowGrowDropDown', this.getChildControl('dropdown'), 'allowGrowDropDown');

    if (model != null) {
      this.initModel(model);
    } else {
      this.__defaultModel = new qx.data.Array();
      this.initModel(this.__defaultModel);
    }
  },


  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },


    // overridden
    width :
    {
      refine : true,
      init : 120
    },


    /** Data array containing the data which should be shown in the drop-down. */
    model :
    {
      check : "qx.data.Array",
      apply : "_applyModel",
      event: "changeModel",
      nullable : false,
      deferredInit : true
    },


    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.list.core.IListDelegate} interface.
     */
    delegate :
    {
      apply: "_applyDelegate",
      event: "changeDelegate",
      init: null,
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as a label. This is only needed if objects are stored in the
     * model.
     */
    labelPath :
    {
      check: "String",
      apply: "_applyLabelPath",
      event: "changeLabelPath",
      nullable: true
    },


    /**
     * A map containing the options for the label binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    labelOptions :
    {
      apply: "_applyLabelOptions",
      event: "changeLabelOptions",
      nullable: true
    },


    /**
     * The path to the property which holds the information that should be
     * displayed as an icon. This is only needed if objects are stored in the
     * model and icons should be displayed.
     */
    iconPath :
    {
      check: "String",
      event : "changeIconPath",
      apply: "_applyIconPath",
      nullable: true
    },


    /**
     * A map containing the options for the icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    iconOptions :
    {
      apply: "_applyIconOptions",
      event : "changeIconOptions",
      nullable: true
    },


    /** Default item height. */
    itemHeight :
    {
      check : "Integer",
      init : 25,
      apply : "_applyRowHeight",
      themeable : true
    },


    /**
     * The maximum height of the drop-down list. Setting this value to
     * <code>null</code> will set cause the list to be auto-sized.
     */
    maxListHeight :
    {
      check : "Number",
      apply : "_applyMaxListHeight",
      nullable: true,
      init : 200
    },


    /**
     * Allow the drop-down to grow wider than its parent.
     */
    allowGrowDropDown :
    {
      init : false,
      nullable : false,
      check : "Boolean",
      event : "changeAllowGrowDropDown"
    }
  },


  members :
  {
    /** @type {qx.data.Array} The initial model array of this virtual box. */
    __defaultModel : null,

    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates : {
      focused : true,
      invalid : true
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Trigger a rebuild from the internal data structure.
     */
    refresh : function()
    {
      this.getChildControl("dropdown").getChildControl("list").refresh();
      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * Shows the drop-down.
     */
    open : function() {
      this._beforeOpen();
      this.getChildControl("dropdown").open();
    },


    /**
     * Hides the drop-down.
     */
    close : function() {
      this._beforeClose();
      this.getChildControl("dropdown").close();
    },


    /**
     * Toggles the drop-down visibility.
     */
    toggle : function() {
      var dropDown =this.getChildControl("dropdown");

      if (dropDown.isVisible()) {
        this.close();
      } else {
        this.open();
      }
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "dropdown":
          control = new qx.ui.form.core.VirtualDropDownList(this);
          control.addListener("changeVisibility", this._onPopupChangeVisibility, this);
          break;
      }

      return control || this.base(arguments, id, hash);
    },


    /**
     * This method is called before the drop-down is opened.
     */
    _beforeOpen: function() {},


    /**
     * This method is called before the drop-down is closed.
     */
    _beforeClose: function() {},


    /**
     * Returns the action dependent on the user interaction: e. q. <code>open</code>,
     * or <code>close</code>.
     *
     * @param event {qx.event.type.KeySequence} The keyboard event.
     * @return {String|null} The action or <code>null</code> when interaction
     *  doesn't hit any action.
     */
    _getAction : function(event)
    {
      var keyIdentifier = event.getKeyIdentifier();
      var isOpen = this.getChildControl("dropdown").isVisible();
      var isModifierPressed = this._isModifierPressed(event);

      if (
        !isOpen && !isModifierPressed &&
        (keyIdentifier === "Down" || keyIdentifier === "Up")
      ) {
        return "open";
      } else if (
        isOpen && !isModifierPressed && keyIdentifier === "Escape"
      ) {
        return "close";
      } else {
        return null;
      }
    },


    /**
     * Helper Method to create bind path depended on the passed path.
     *
     * @param source {String} The path to the selection.
     * @param path {String?null} The path to the item's property.
     * @return {String} The created path.
     */
    _getBindPath : function(source, path)
    {
      var bindPath = source + "[0]";

      if (path != null && path != "") {
        bindPath += "." + path;
      }

      return bindPath;
    },

    /**
     * Helper method to check if one modifier key is pressed. e.q.
     * <code>Control</code>, <code>Shift</code>, <code>Meta</code> or
     * <code>Alt</code>.
     *
     * @param event {qx.event.type.KeySequence} The keyboard event.
     * @return {Boolean} <code>True</code> when a modifier key is pressed,
     *   <code>false</code> otherwise.
     */
    _isModifierPressed : function(event)
    {
      var isAltPressed = event.isAltPressed();
      var isCtrlOrCommandPressed = event.isCtrlOrCommandPressed();
      var isShiftPressed = event.isShiftPressed();
      var isMetaPressed = event.isMetaPressed();

      return (isAltPressed || isCtrlOrCommandPressed ||
        isShiftPressed || isMetaPressed);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Handler for the blur event of the current widget.
     *
     * @param event {qx.event.type.Focus} The blur event.
     */
    _onBlur : function(event) {
      this.close();
    },


    /**
     * Handles the complete keyboard events for user interaction. If there is
     * no defined user interaction {@link #_getAction}, the event is delegated
     * to the {@link qx.ui.form.core.VirtualDropDownList#_handleKeyboard} method.
     *
     * @param event {qx.event.type.KeySequence} The keyboard event.
     */
    _handleKeyboard : function(event)
    {
      var action = this._getAction(event);
      var isOpen = this.getChildControl("dropdown").isVisible();

      switch(action)
      {
        case "open":
          this.open();
          break;

        case "close":
          this.close();
          break;

        default:
          if (isOpen) {
            this.getChildControl("dropdown")._handleKeyboard(event);
          }
          break;
      }
    },


    /**
     * Handles all pointer events dispatched on the widget.
     *
     * @param event {qx.event.type.Pointer|qx.event.type.Roll} The pointer event.
     */
    _handlePointer : function(event) {},


    /**
     * Updates drop-down minimum size.
     *
     * @param event {qx.event.type.Data} Data event.
     */
    _onResize : function(event){
      this.getChildControl("dropdown").setMinWidth(event.getData().width);
    },


    /**
     * Adds/removes the state 'popupOpen' depending on the visibility of the popup
     *
     * @param event {qx.event.type.Data} Data event
     */
    _onPopupChangeVisibility : function(event)
    {
      event.getData() == "visible" ? this.addState("popupOpen") : this.removeState("popupOpen");
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyModel : function(value, old)
    {
      this.getChildControl("dropdown").getChildControl("list").setModel(value);
      qx.ui.core.queue.Widget.add(this);
    },


    // property apply
    _applyDelegate : function(value, old) {
      this.getChildControl("dropdown").getChildControl("list").setDelegate(value);
    },


    // property apply
    _applyLabelPath : function(value, old)
    {
      this.getChildControl("dropdown").getChildControl("list").setLabelPath(value);
      qx.ui.core.queue.Widget.add(this);
    },


    // property apply
    _applyLabelOptions : function(value, old)
    {
      this.getChildControl("dropdown").getChildControl("list").setLabelOptions(value);
      qx.ui.core.queue.Widget.add(this);
    },


    // property apply
    _applyIconPath : function(value, old)
    {
      this.getChildControl("dropdown").getChildControl("list").setIconPath(value);
      qx.ui.core.queue.Widget.add(this);
    },


    // property apply
    _applyIconOptions : function(value, old)
    {
      this.getChildControl("dropdown").getChildControl("list").setIconOptions(value);
      qx.ui.core.queue.Widget.add(this);
    },


    // property apply
    _applyRowHeight : function(value, old) {
      this.getChildControl("dropdown").getChildControl("list").setItemHeight(value);
    },


    // property apply
    _applyMaxListHeight : function(value, old) {
      this.getChildControl("dropdown").getChildControl("list").setMaxHeight(value);
    }
  },

  destruct : function()
  {
    if (this.__defaultModel) {
      this.__defaultModel.dispose();
    }
  }
});
