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
 * A drop-down (popup) widget which contains a virtual list for selection.
 *
 * @childControl list {qx.ui.list.List} The virtual list.
 *
 * @internal
 */
qx.Class.define("qx.ui.form.core.VirtualDropDownList",
{
  extend  : qx.ui.popup.Popup,


  /**
   * Creates the drop-down list.
   *
   * @param target {qx.ui.form.core.AbstractVirtualBox} The composite widget.
   */
  construct : function(target)
  {
    qx.core.Assert.assertNotNull(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertNotUndefined(target, "Invalid parameter 'target'!");
    qx.core.Assert.assertInterface(target, qx.ui.form.core.AbstractVirtualBox,
      "Invalid parameter 'target'!");

    this.base(arguments, new qx.ui.layout.VBox());

    this._target = target;

    this._createChildControl("list");
    this.addListener("changeVisibility", this.__onChangeVisibility, this);

    this.__defaultSelection = new qx.data.Array();
    this.initSelection(this.__defaultSelection);
  },


  properties :
  {
    // overridden
    autoHide :
    {
      refine : true,
      init : false
    },


    // overridden
    keepActive :
    {
      refine : true,
      init : true
    },


    /** Current selected items. */
    selection :
    {
      check : "qx.data.Array",
      event : "changeSelection",
      apply : "_applySelection",
      nullable : false,
      deferredInit : true
    },


    /**
     * Allow the drop-down to grow wider than its parent.
     */
    allowGrowDropDown :
    {
      init : false,
      nullable : false,
      check : "Boolean",
      apply : "_adjustSize",
      event : "changeAllowGrowDropDown"
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
    "changeSelection" : "qx.event.type.Data"
  },


  members :
  {
    /** @type {qx.ui.form.core.AbstractVirtualBox} The composite widget. */
    _target : null,


    /** @type {var} The pre-selected model item. */
    _preselected : null,


    /**
     * @type {Boolean} Indicator to ignore selection changes from the
     * {@link #selection} array.
     */
    __ignoreSelection : false,


    /** @type {Boolean} Indicator to ignore selection changes from the list. */
    __ignoreListSelection : false,


    /** @type {qx.data.Array} The initial selection array. */
    __defaultSelection : null,


    /**
     * When the drop-down is allowed to grow wider than its parent,
     * this member variable will contain the cached maximum list item width in pixels.
     * This variable gets updated whenever the model or model length changes.
     *
     * @type {Number}
     */
    __cachedMaxListItemWidth : 0,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    /**
     * Shows the drop-down.
     */
    open : function()
    {
      this.placeToWidget(this._target, true);
      this.show();
    },


    /**
     * Hides the drop-down.
     */
    close : function() {
      this.hide();
    },


    /**
     * Pre-selects the drop-down item corresponding to the given model object.
     *
     * @param modelItem {Object} Item to be pre-selected.
     */
    setPreselected : function(modelItem)
    {
      this._preselected = modelItem;
      this.__ignoreListSelection = true;
      var listSelection = this.getChildControl("list").getSelection();
      var helper = new qx.data.Array([modelItem]);
      this.__synchronizeSelection(helper, listSelection);
      helper.dispose();
      this.__ignoreListSelection = false;
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
        case "list":
          control = new qx.ui.list.List().set({
            focusable: false,
            keepFocus: true,
            keepActive: true,
            height: null,
            width: null,
            maxHeight: this._target.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          control.getSelection().addListener("change", this._onListChangeSelection, this);
          control.addListener("tap", this._handlePointer, this);
          control.addListener("changeModel", this._onChangeModel, this);
          control.addListener("changeModelLength", this._onChangeModelLength, this);
          control.addListener("changeDelegate", this._onChangeDelegate, this);

          this.add(control, {flex: 1});
          break;
      }

      return control || this.base(arguments, id, hash);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Handles the complete keyboard events dispatched on the widget.
     *
     * @param event {qx.event.type.KeySequence} The keyboard event.
     */
    _handleKeyboard : function(event)
    {
      if (this.isVisible() && event.getKeyIdentifier() === "Enter") {
        this.__selectPreselected();
        return;
      }

      var clone = event.clone();
      clone.setTarget(this.getChildControl("list"));
      clone.setBubbles(false);

      this.getChildControl("list").dispatchEvent(clone);
    },


    /**
     * Handles all mouse events dispatched on the widget.
     *
     * @param event {qx.event.type.Mouse} The mouse event.
     */
    _handlePointer : function(event) {
      this.__selectPreselected();
    },


    /**
     * Handler for the local selection change. The method is responsible for
     * the synchronization between the own selection and the selection
     * form the drop-down.
     *
     * @param event {qx.event.type.Data} The data event.
     */
    __onChangeSelection : function(event)
    {
      if (this.__ignoreSelection) {
        return;
      }

      var selection = this.getSelection();
      var listSelection = this.getChildControl("list").getSelection();

      this.__ignoreListSelection = true;
      this.__synchronizeSelection(selection, listSelection);
      this.__ignoreListSelection = false;

      this.__ignoreSelection = true;
      this.__synchronizeSelection(listSelection, selection);
      this.__ignoreSelection = false;
    },


    /**
     * Handler for the selection change on the list. The method is responsible
     * for the synchronization between the list selection and the own selection.
     *
     * @param event {qx.event.type.Data} The data event.
     */
    _onListChangeSelection : function(event)
    {
      if (this.__ignoreListSelection) {
        return;
      }

      var listSelection = this.getChildControl("list").getSelection();

      if (this.isVisible()) {
        this.setPreselected(listSelection.getItem(0));
      } else {
        this.__ignoreSelection = true;
        this.__synchronizeSelection(listSelection, this.getSelection());
        this.__ignoreSelection = false;
      }
    },


    /**
     * Handler for the own visibility changes. The method is responsible that
     * the list selects the current selected item.
     *
     * @param event {qx.event.type.Data} The event.
     */
    __onChangeVisibility : function(event)
    {
      if (this.isVisible())
      {
        if (this._preselected == null)
        {
          var selection = this.getSelection();
          var listSelection = this.getChildControl("list").getSelection();
          this.__synchronizeSelection(selection, listSelection);
        }
        this._adjustSize();
      } else {
        this.setPreselected(null);
      }
    },


    /**
     * Handler for the model change event.
     * Called when the whole model changes, not when its length changes.
     *
     * @param event {qx.event.type.Data} The change event.
     * @protected
     */
    _onChangeModel : function(event) {
      if (this.getAllowGrowDropDown()) {
        this._recalculateMaxListItemWidth();
      }

      this._adjustSize();
    },


    /**
     * Handler for the model length change event.
     * Called whenever items get added or removed from the model,
     * not when the model itself changes.
     *
     * @param event {qx.event.type.Data}
     * @protected
     */
    _onChangeModelLength : function (event) {
      if (this.getAllowGrowDropDown()) {
        this._recalculateMaxListItemWidth();
      }

      this._adjustSize();
    },


    /**
     * Handler for the delegate change event.
     *
     * @param event {qx.event.type.Data} The change event.
     */
    _onChangeDelegate : function(event) {
      this.getSelection().removeAll();
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    // property apply
    _applySelection : function(value, old)
    {
      value.addListener("change", this.__onChangeSelection, this);

      if (old != null) {
        old.removeListener("change", this.__onChangeSelection, this);
      }

      this.__synchronizeSelection(
        value, this.getChildControl("list").getSelection(value)
      );
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Helper method to select the current preselected item, also closes the
     * drop-down.
     */
    __selectPreselected : function()
    {
      if (this._preselected != null)
      {
        var selection = this.getSelection();
        selection.splice(0, 1, this._preselected);
        this._preselected = null;
        this.close();
      }
    },


    /**
     * Helper method to synchronize both selection. The target selection has
     * the same selection like the source selection after the synchronization.
     *
     * @param source {qx.data.Array} The source selection.
     * @param target {qx.data.Array} The target selection.
     */
    __synchronizeSelection : function(source, target)
    {
      if (source.equals(target)) {
        return;
      }

      if (source.getLength() <= 0) {
        target.removeAll();
      }
      else
      {
        // build arguments array for splice(0, target.length, source[0], source[1], ...)
        var spliceArg = [0, target.length];
        spliceArg = spliceArg.concat(source.toArray());

        // use apply since it allow to use an array as the argument array
        // (calling splice directly with an array insert it in the array on which splice is called)
        // don't forget to dispose the array created by splice
        target.splice.apply(target, spliceArg).dispose();
      }
    },


    /**
     * Adjust the drop-down to the available width and height, by calling
     * {@link #_adjustWidth} and {@link #_adjustHeight}.
     */
    _adjustSize : function()
    {
      if (!this._target.getBounds()) {
        this.addListenerOnce("appear", this._adjustSize, this);
        return;
      }

      this._adjustWidth();
      this._adjustHeight();
    },


    /**
     * Adjust the drop-down to the available width. The width is limited by
     * the current width from the _target, unless allowGrowDropDown is true.
     */
    _adjustWidth : function()
    {
      var width = this._target.getBounds().width;
      var uiList = this.getChildControl('list');
      if (this.getAllowGrowDropDown()) {
        // Let the drop-down handle its own width.
        this.setWidth(null);

        if (this.__cachedMaxListItemWidth > 0) {
          uiList.setWidth(this.__cachedMaxListItemWidth);
        } else {
          uiList.setWidth(width);
        }
      } else {
        // Make the drop-down as wide as the virtual-box that it is owned by.
        this.setWidth(width);
        uiList.resetWidth();
      }
    },


    /**
     * Adjust the drop-down to the available height. Ensure that the list
     * is never bigger that the max list height and the available space
     * in the viewport.
     */
    _adjustHeight : function()
    {
      var availableHeight = this._getAvailableHeight();
      if (availableHeight === null) {
        return;
      }

      var maxHeight = this._target.getMaxListHeight();
      var list = this.getChildControl("list");
      var itemsHeight = list.getPane().getRowConfig().getTotalSize();

      if (maxHeight == null || itemsHeight < maxHeight) {
        maxHeight = itemsHeight;
      }

      if (maxHeight > availableHeight) {
        maxHeight = availableHeight;
      }

      var minHeight = list.getMinHeight();
      if (null !== minHeight && minHeight > maxHeight) {
        maxHeight = minHeight;
      }

      list.setMaxHeight(maxHeight);
    },


    /**
     * Calculates the available height in the viewport.
     *
     * @return {Integer|null} Available height in the viewport.
     */
    _getAvailableHeight : function()
    {
      var distance = this.getLayoutLocation(this._target);
      if (!distance) {
        return null;
      }

      var viewPortHeight = qx.bom.Viewport.getHeight();

      // distance to the bottom and top borders of the viewport
      var toTop = distance.top;
      var toBottom = viewPortHeight - distance.bottom;

      return toTop > toBottom ? toTop : toBottom;
    },


    /**
     * Loop over all model items to recalculate the maximum list item width.
     *
     * @protected
     */
    _recalculateMaxListItemWidth : function () {
      var maxWidth = 0;
      var list = this.getChildControl("list");
      var model = list.getModel();
      if (model && model.length) {
        var createWidget = qx.util.Delegate.getMethod(list.getDelegate(), "createItem");
        if (!createWidget) {
          createWidget = function () {
            return new qx.ui.form.ListItem();
          };
        }

        var tempListItem = createWidget();

        // Make sure the widget has the correct padding properties.
        tempListItem.syncAppearance();

        var styles;
        var font = tempListItem.getFont();
        if (font) {
          styles = qx.theme.manager.Font.getInstance().resolve(font).getStyles();
        }
        if (!styles) {
          styles = qx.bom.Font.getDefaultStyles();
        }

        var paddingX =
          list.getPaddingLeft() + list.getPaddingRight() +
          tempListItem.getPaddingLeft() + tempListItem.getPaddingRight() +
          tempListItem.getMarginLeft() + tempListItem.getMarginRight();

        var label = tempListItem.getChildControl('label');
        if (label) {
          // Make sure the widget has the correct padding properties.
          label.syncAppearance();

          paddingX +=
            label.getPaddingLeft() + label.getPaddingRight() +
            label.getMarginLeft() + label.getMarginRight();
        }

        model.forEach(function (item) {
          var width = 0;
          var content;

          if (typeof item === "string") {
            content = item;
          } else if (typeof item === "object" && item !== null) {
            content = item.get(list.getLabelPath());
          }

          if (content) {
            width = qx.bom.Label.getHtmlSize(content, styles, undefined).width + paddingX;

            if (width > maxWidth) {
              maxWidth = width;
            }
          }
        });

        tempListItem.dispose();
      }

      this.__cachedMaxListItemWidth = maxWidth;
    },


    /**
     * Get the cached maximum list item width.
     *
     * @return {Number}
     * @protected
     */
    _getMaxListItemWidth : function () {
      return this.__cachedMaxListItemWidth;
    }
  },

  destruct : function()
  {
    if (this.__defaultSelection) {
      this.__defaultSelection.dispose();
    }
  }
});
