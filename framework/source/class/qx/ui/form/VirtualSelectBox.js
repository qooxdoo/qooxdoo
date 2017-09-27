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
 * A form virtual widget which allows a single selection. Looks somewhat like
 * a normal button, but opens a virtual list of items to select when tapping
 * on it.
 *
 * @childControl spacer {qx.ui.core.Spacer} Flexible spacer widget.
 * @childControl atom {qx.ui.basic.Atom} Shows the text and icon of the content.
 * @childControl arrow {qx.ui.basic.Image} Shows the arrow to open the drop-down
 *   list.
 */
qx.Class.define("qx.ui.form.VirtualSelectBox",
{
  extend : qx.ui.form.core.AbstractVirtualBox,
  implement : [ qx.data.controller.ISelection, qx.ui.form.IField ],

  construct : function(model)
  {
    this.base(arguments, model);

    this._createChildControl("atom");
    this._createChildControl("spacer");
    this._createChildControl("arrow");

    // Register listener
    this.addListener("pointerover", this._onPointerOver, this);
    this.addListener("pointerout", this._onPointerOut, this);

    this.__bindings = [];
    this.initSelection(this.getChildControl("dropdown").getSelection());

    this.__searchTimer = new qx.event.Timer(500);
    this.__searchTimer.addListener("interval", this.__preselect, this);

    this.getSelection().addListener("change", this._updateSelectionValue, this);
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-selectbox"
    },


    // overridden
    width :
    {
      refine : true,
      init : 120
    },


    /** Current selected items. */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    }
  },


  events : {
    /**
     * This event is fired as soon as the content of the selection property changes, but
     * this is not equal to the change of the selection of the widget. If the selection
     * of the widget changes, the content of the array stored in the selection property
     * changes. This means you have to listen to the change event of the selection array
     * to get an event as soon as the user changes the selected item.
     * <pre class="javascript">obj.getSelection().addListener("change", listener, this);</pre>
     */
    "changeSelection" : "qx.event.type.Data",

    /** Fires after the value was modified */
    "changeValue" : "qx.event.type.Data"
  },


  members :
  {
    /** @type {String} The search value to {@link #__preselect} an item. */
    __searchValue : "",


    /**
     * @type {qx.event.Timer} The time which triggers the search for pre-selection.
     */
    __searchTimer : null,


    /** @type {Array} Contains the id from all bindings. */
    __bindings : null,


    /**
     * @param selected {var|null} Item to select as value.
     * @returns {null|TypeError} The status of this operation.
     */
    setValue : function(selected) {
      if (null === selected) {
        this.resetSelection();
        return null;
      }

      this.getSelection().setItem(0, selected);
      return null;
    },


    /**
     * @returns {null|var} The currently selected item or null if there is none.
     */
    getValue : function() {
      var s = this.getSelection();
      return (s.length === 0 ? null : s.getItem(0));
    },


    resetValue : function() {
      this.getSelection().removeAll();
    },


    // overridden
    syncWidget : function(jobs)
    {
      this._removeBindings();
      this._addBindings();
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAl API
    ---------------------------------------------------------------------------
    */


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "spacer":
          control = new qx.ui.core.Spacer();

          this._add(control, {flex: 1});
          break;

        case "atom":
          control = new qx.ui.form.ListItem("");
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

      return control || this.base(arguments, id, hash);
    },


    // overridden
    _getAction : function(event)
    {
      var keyIdentifier = event.getKeyIdentifier();
      var isOpen = this.getChildControl("dropdown").isVisible();
      var isModifierPressed = this._isModifierPressed(event);

      if (
        !isOpen && !isModifierPressed &&
        (keyIdentifier === "Enter" || keyIdentifier === "Space")
      ) {
        return "open";
      } else if (isOpen && event.isPrintable()) {
        return "search";
      } else {
        return this.base(arguments, event);
      }
    },

    /**
     * This method is called when the binding can be added to the
     * widget. For e.q. bind the drop-down selection with the widget.
     */
    _addBindings : function()
    {
      var atom = this.getChildControl("atom");

      var modelPath = this._getBindPath("selection", "");
      var id = this.bind(modelPath, atom, "model", null);
      this.__bindings.push(id);

      var labelSourcePath = this._getBindPath("selection", this.getLabelPath());
      id = this.bind(labelSourcePath, atom, "label", this.getLabelOptions());
      this.__bindings.push(id);

      if (this.getIconPath() != null) {
        var iconSourcePath = this._getBindPath("selection", this.getIconPath());
        id = this.bind(iconSourcePath, atom, "icon", this.getIconOptions());
        this.__bindings.push(id);
      }
    },


    /**
     * This method is called when the binding can be removed from the
     * widget. For e.q. remove the bound drop-down selection.
     */
    _removeBindings : function()
    {
      while (this.__bindings.length > 0)
      {
        var id = this.__bindings.pop();
        this.removeBinding(id);
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    // overridden
    _handlePointer : function(event)
    {
      this.base(arguments, event);

      var type = event.getType();
      if (type === "tap") {
        this.toggle();
      }
    },


    // overridden
    _handleKeyboard : function(event) {
      var action = this._getAction(event);

      switch(action)
      {
        case "search":
          this.__searchValue += this.__convertKeyIdentifier(event.getKeyIdentifier());
          this.__searchTimer.restart();
          break;

        default:
          this.base(arguments, event);
          break;
      }
    },


    /**
     * Listener method for "pointerover" event.
     *
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state
     *   is set)</li>
     * </ul>
     *
     * @param event {qx.event.type.Pointer} Pointer event
     */
    _onPointerOver : function(event)
    {
      if (!this.isEnabled() || event.getTarget() !== this) {
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
     * Listener method for "pointerout" event.
     *
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state
     *   is set)</li>
     * </ul>
     *
     * @param event {qx.event.type.Pointer} Pointer event
     */
    _onPointerOut : function(event)
    {
      if (!this.isEnabled() || event.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed"))
      {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySelection : function(value, old)
    {
      this.getChildControl("dropdown").setSelection(value);
      qx.ui.core.queue.Widget.add(this);
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Preselects an item in the drop-down, when item starts with the
     * __searchValue value.
     */
    __preselect : function()
    {
      this.__searchTimer.stop();

      var searchValue = this.__searchValue;
      if (searchValue === null || searchValue === "") {
        return;
      }

      var model = this.getModel();
      var list = this.getChildControl("dropdown").getChildControl("list");
      var selection = list.getSelection();
      var length = list._getLookupTable().length;
      var startIndex = model.indexOf(selection.getItem(0));
      var startRow = list._reverseLookup(startIndex);

      for (var i = 1; i <= length; i++)
      {
        var row = (i + startRow) % length;
        var item = model.getItem(list._lookup(row));
        if (!item) {
          // group items aren't in the model
          continue;
        }
        var value = item;

        if (this.getLabelPath())
        {
          value = qx.data.SingleValueBinding.resolvePropertyChain(item,
            this.getLabelPath());

          var labelOptions = this.getLabelOptions();
          if (labelOptions)
          {
            var converter = qx.util.Delegate.getMethod(labelOptions,
              "converter");

            if (converter) {
              value = converter(value, item);
            }
          }
        }

        if ( value.toLowerCase().startsWith(searchValue.toLowerCase()) )
        {
          selection.push(item);
          break;
        }
      }
      this.__searchValue = "";
    },


    /**
     * Converts the keyIdentifier to a printable character e.q. <code>"Space"</code>
     * to <code>" "</code>.
     *
     * @param keyIdentifier {String} The keyIdentifier to convert.
     * @return {String} The converted keyIdentifier.
     */
    __convertKeyIdentifier : function(keyIdentifier)
    {
      if (keyIdentifier === "Space") {
        return " ";
      } else {
        return keyIdentifier;
      }
    },


    /**
     * Called when selection changes.
     *
     * @param event {qx.event.type.Data} {@link qx.data.Array} change event.
     */
    _updateSelectionValue : function(event) {
      var d = event.getData();
      var old = (d.removed.length ? d.removed[0] : null);
      this.fireDataEvent("changeValue", d.added[0], old);
    }
  },


  destruct : function()
  {
    this._removeBindings();

    this.getSelection().removeListener("change", this._updateSelectionValue, this);

    this.__searchTimer.removeListener("interval", this.__preselect, this);
    this.__searchTimer.dispose();
    this.__searchTimer = null;
  }
});
