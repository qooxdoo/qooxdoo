/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
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
    }
  },


  members :
  {
    /** {qx.ui.form.core.AbstractVirtualBox} The composite widget. */
    _target : null,


    /** {var} The pre-selected model item. */
    _preselected : null,


    /**
     * {Boolean} Indicator to ignore selection changes from the
     * {@link #selection} array.
     */
    __ignoreSelection : false,


    /** {Boolean} Indicator to ignore selection changes from the list. */
    __ignoreListSelection : false,


    __defaultSelection : null,


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
            height: null,
            width: null,
            maxHeight: this._target.getMaxListHeight(),
            selectionMode: "one",
            quickSelection: true
          });

          control.getSelection().addListener("change", this._onListChangeSelection, this);
          control.addListener("mouseup", this._handleMouse, this);
          control.addListener("changeModel", this._onChangeModel, this);
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
    _handleMouse : function(event) {
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
        this.__adjustSize();
      } else {
        this.setPreselected(null);
      }
    },


    /**
     * Handler for the model change event.
     *
     * @param event {qx.event.type.Data} The change event.
     */
    _onChangeModel : function(event) {
      this.getSelection().removeAll();
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
        var nativeArray = target.toArray();
        qx.lang.Array.removeAll(nativeArray);
        for (var i = 0; i < source.getLength(); i++) {
          nativeArray.push(source.getItem(i));
        }
        target.length = nativeArray.length;

        var lastIndex = target.getLength() - 1;
        // dispose data array returned by splice to avoid memory leak
        var temp = target.splice(lastIndex, 1, target.getItem(lastIndex));
        temp.dispose();
      }
    },


    /**
     * Adjust the drop-down to the available width and height, by calling
     * {@link #__adjustWidth} and {@link #__adjustHeight}.
     */
    __adjustSize : function()
    {
      this.__adjustWidth();
      this.__adjustHeight();
    },


    /**
     * Adjust the drop-down to the available width. The width is limited by
     * the current with from the _target.
     */
    __adjustWidth : function()
    {
      var width = this._target.getBounds().width;
      this.setWidth(width);
    },


    /**
     * Adjust the drop-down to the available height. Ensure that the list
     * is never bigger that the max list height and the available space
     * in the viewport.
     */
    __adjustHeight : function()
    {
      var availableHeigth = this.__getAvailableHeigth();
      var maxListHeight = this._target.getMaxListHeight();
      var list = this.getChildControl("list");
      var itemsHeight = list.getPane().getRowConfig().getTotalSize();

      if (maxListHeight == null || itemsHeight < maxListHeight) {
        maxListHeight = itemsHeight;
      }

      if (maxListHeight > availableHeigth) {
        list.setMaxHeight(availableHeigth);
      } else if (maxListHeight < availableHeigth) {
        list.setMaxHeight(maxListHeight);
      }
    },


    /**
     * Calculates the available height in the viewport.
     *
     * @return {Integer} Available height in the viewport.
     */
    __getAvailableHeigth : function()
    {
      var distance = this.getLayoutLocation(this._target);
      var viewPortHeight = qx.bom.Viewport.getHeight();

      // distance to the bottom and top borders of the viewport
      var toTop = distance.top;
      var toBottom = viewPortHeight - distance.bottom;

      return toTop > toBottom ? toTop : toBottom;
    }
  },

  destruct : function()
  {
    if (this.__defaultSelection) {
      this.__defaultSelection.dispose();
    }
  }
});
