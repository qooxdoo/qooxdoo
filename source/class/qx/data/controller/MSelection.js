/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin for the selection in the data binding controller.
 * It contains an selection property which can be manipulated.
 * Remember to call the method {@link #_addChangeTargetListener} on every
 * change of the target.
 * It is also important that the elements stored in the target e.g. ListItems
 * do have the corresponding model stored as user data under the "model" key.
 */
qx.Mixin.define("qx.data.controller.MSelection", {
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    // check for a target property
    if (!qx.Class.hasProperty(this.constructor, "target")) {
      throw new Error("Target property is needed.");
    }

    // create a default selection array
    if (this.getSelection() == null) {
      this.__ownSelection = new qx.data.Array();
      this.setSelection(this.__ownSelection);
    }
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * Data array containing the selected model objects. This property can be
     * manipulated directly which means that a push to the selection will also
     * select the corresponding element in the target.
     */
    selection: {
      check: "qx.data.Array",
      event: "changeSelection",
      apply: "_applySelection",
      init: null
    },

    /**
     * If set to true, the selection property will be allowed to have items which are not in the model property.
     * If the model property changes, this will not cause the selection property to be reset.
     *
     * If the selection property contains items which are not in the model property,
     * the selection of the target widget (e.g. qx.ui.form.SelectBox) will only be the items that are both in this controller's model property
     * and in this controller's selection property.
     *
     * This is useful when it is undesirable to reset the selection when the model changes,
     * because if the selection is bound to a business object,
     * data in the business object may be overwritten.
     */
    allowSelectionNotInModel: {
      check: "Boolean",
      init: false,
      nullable: false
    }
  },

  events: {
    /**
     * This event is fired as soon as the content of the selection property changes, but
     * this is not equal to the change of the selection of the widget. If the selection
     * of the widget changes, the content of the array stored in the selection property
     * changes. This means you have to listen to the change event of the selection array
     * to get an event as soon as the user changes the selected item.
     * <pre class="javascript">obj.getSelection().addListener("change", listener, this);</pre>
     */
    changeSelection: "qx.event.type.Data",

    /** Fires after the value was modified */
    changeValue: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // private members //
    // set the semaphore-like variable for the selection change
    _modifingSelection: 0,
    __selectionListenerId: null,
    __selectionArrayListenerId: null,
    __ownSelection: null,

    /**
     * setValue implements part of the {@link qx.ui.form.IField} interface.
     *
     * @param selection {qx.data.IListData|null} List data to select as value.
     * @return {null} The status of this operation.
     */
    setValue(selection) {
      if (null === selection) {
        this.resetSelection();
      } else {
        this.setSelection(selection);
      }

      return null;
    },

    /**
     * getValue implements part of the {@link qx.ui.form.IField} interface.
     *
     * @return {qx.data.IListData} The current selection.
     */
    getValue() {
      return this.getSelection();
    },

    /**
     * resetValue implements part of the {@link qx.ui.form.IField} interface.
     */
    resetValue() {
      this.resetSelection();
    },

    /**
     * Removes any items from the selection property that are not in the model property.
     */
    syncSelectionWithModel() {
      //We will create a copy of my selection array and work on that to ensure there is only one change event being fired.
      let mySelection = this.getSelection().copy();
      mySelection = mySelection.filter(item => this.getModel().includes(item));
      this.getSelection().replace(mySelection);
    },

    /*
    ---------------------------------------------------------------------------
       APPLY METHODS
    ---------------------------------------------------------------------------
    */
    /**
     * Apply-method for setting a new selection array. Only the change listener
     * will be removed from the old array and added to the new.
     *
     * @param value {qx.data.Array} The new data array for the selection.
     * @param old {qx.data.Array|null} The old data array for the selection.
     */
    _applySelection(value, old) {
      // remove the old listener if necessary
      if (this.__selectionArrayListenerId != undefined && old != undefined) {
        old.removeListenerById(this.__selectionArrayListenerId);
        this.__selectionArrayListenerId = null;
      }
      // add a new change listener to the changeArray
      if (value) {
        this.__selectionArrayListenerId = value.addListener(
          "change",
          this.__changeSelectionArray,
          this
        );
      }

      // apply the new selection
      this._updateSelection();
    },

    /*
    ---------------------------------------------------------------------------
       EVENT HANDLER
    ---------------------------------------------------------------------------
    */
    /**
     * Event handler for the change of the data array holding the selection.
     * If a change is in the selection array, the selection update will be
     * invoked.
     */
    __changeSelectionArray() {
      this._updateSelection();
    },

    /**
     * Event handler for a change in the target selection.
     * If the selection in the target has changed, the selected model objects
     * will be found and added to the selection array.
     */
    _changeTargetSelection() {
      // dont do anything without a target
      if (this.getTarget() == null) {
        return;
      }

      // if a selection API is supported
      if (
        !this.__targetSupportsMultiSelection() &&
        !this.__targetSupportsSingleSelection()
      ) {
        return;
      }

      // if __changeSelectionArray is currently working, do nothing
      if (this._inSelectionModification()) {
        return;
      }

      // get both selections
      var targetSelection = this.getTarget().getSelection();
      var selection = this.getSelection();
      if (selection == null) {
        selection = new qx.data.Array();
        this.__ownSelection = selection;
        this.setSelection(selection);
      }

      // go through the target selection
      var spliceArgs = [0, selection.getLength()];
      for (var i = 0; i < targetSelection.length; i++) {
        var model = targetSelection[i].getModel();
        if (model !== null) {
          spliceArgs.push(model);
        }
      }
      // use splice to ensure a correct change event [BUG #4728]
      selection.splice.apply(selection, spliceArgs).dispose();

      // fire the change event manually
      this.fireDataEvent("changeSelection", this.getSelection());
    },

    /*
    ---------------------------------------------------------------------------
       SELECTION
    ---------------------------------------------------------------------------
    */
    /**
     * Helper method which should be called by the classes including this
     * Mixin when the target changes.
     * Removes the 'changeSelection' listener from the old target
     * and add a new one to the new target;
     *
     * @param value {qx.ui.core.Widget|null} The new target.
     * @param old {qx.ui.core.Widget|null} The old target.
     */
    _addChangeTargetListener(value, old) {
      // remove the old selection listener
      if (this.__selectionListenerId != undefined && old != undefined) {
        old.removeListenerById(this.__selectionListenerId);
      }

      if (value != null) {
        // if a selection API is supported
        if (
          this.__targetSupportsMultiSelection() ||
          this.__targetSupportsSingleSelection()
        ) {
          // add a new selection listener
          this.__selectionListenerId = value.addListener(
            "changeSelection",
            this._changeTargetSelection,
            this
          );
        }
      }
    },

    /**
     * Method for updating the selection. It checks for the case of single or
     * multi selection and after that checks if the selection in the selection
     * array is the same as in the target widget.
     */
    _updateSelection() {
      // do not update if no target is given
      if (!this.getTarget() || !this.getSelection()) {
        return;
      }
      // mark the change process in a flag
      this._startSelectionModification();

      // if its a multi selection target
      if (this.__targetSupportsMultiSelection()) {
        var targetSelection = [];
        // go through my selection array
        for (var i = 0; i < this.getSelection().length; i++) {
          // store each selectable item from target widget
          var model = this.getSelection().getItem(i);
          var selectable = this.__getSelectableForModel(model);
          if (selectable != null) {
            targetSelection.push(selectable);
          }
        }
        this.getTarget().setSelection(targetSelection);

        // get the selection of the target
        targetSelection = this.getTarget().getSelection();
        // get all models of items selected in the target
        var targetSelectionModels = [];
        for (var i = 0; i < targetSelection.length; i++) {
          targetSelectionModels[i] = targetSelection[i].getModel();
        }

        if (!this.getAllowSelectionNotInModel()) {
          // go through the controller selection
          for (var i = this.getSelection().length - 1; i >= 0; i--) {
            // if the item in the controller selection is not selected in the list
            if (
              !targetSelectionModels.includes(this.getSelection().getItem(i))
            ) {
              // remove the current element and get rid of the return array
              this.getSelection().splice(i, 1).dispose();
            }
          }
        }
        // if its a single selection target
      } else if (this.__targetSupportsSingleSelection()) {
        // get the model which should be selected
        var item = this.getSelection().getItem(this.getSelection().length - 1);
        if (item !== undefined) {
          // select the last selected item (old selection will be removed anyway)
          this.__selectItem(item);
          // remove the other items from the selection data array and get
          // rid of the return array
          this.getSelection()
            .splice(0, this.getSelection().getLength() - 1)
            .dispose();
        } else {
          // if there is no item to select (e.g. new model set [BUG #4125]),
          // reset the selection
          this.getTarget().resetSelection();
        }
      }

      // reset the changing flag
      this._endSelectionModification();
      this.fireDataEvent("changeValue", this.getSelection());
    },

    /**
     * Helper-method returning true, if the target supports multi selection.
     * @return {Boolean} true, if the target supports multi selection.
     */
    __targetSupportsMultiSelection() {
      var targetClass = this.getTarget().constructor;
      return qx.Class.implementsInterface(
        targetClass,
        qx.ui.core.IMultiSelection
      );
    },

    /**
     * Helper-method returning true, if the target supports single selection.
     * @return {Boolean} true, if the target supports single selection.
     */
    __targetSupportsSingleSelection() {
      var targetClass = this.getTarget().constructor;
      return qx.Class.implementsInterface(
        targetClass,
        qx.ui.core.ISingleSelection
      );
    },

    /**
     * Internal helper for selecting an item in the target. The item to select
     * is defined by a given model item.
     *
     * @param item {qx.core.Object} A model element.
     */
    __selectItem(item) {
      var selectable = this.__getSelectableForModel(item);
      // if no selectable could be found, just return
      if (selectable == null) {
        return;
      }
      // if the target is multi selection able
      if (this.__targetSupportsMultiSelection()) {
        // select the item in the target
        this.getTarget().addToSelection(selectable);
        // if the target is single selection able
      } else if (this.__targetSupportsSingleSelection()) {
        this.getTarget().setSelection([selectable]);
      }
    },

    /**
     * Returns the list item storing the given model in its model property.
     *
     * @param model {var} The representing model of a selectable.
     * @return {Object|null} List item or <code>null</code> if none was found
     */
    __getSelectableForModel(model) {
      // get all list items
      var children = this.getTarget().getSelectables(true);

      // go through all children and search for the child to select
      for (var i = 0; i < children.length; i++) {
        if (children[i].getModel() == model) {
          return children[i];
        }
      }
      // if no selectable was found
      return null;
    },

    /**
     * Helper-Method signaling that currently the selection of the target is
     * in change. That will block the change of the internal selection.
     * {@link #_endSelectionModification}
     */
    _startSelectionModification() {
      this._modifingSelection++;
    },

    /**
     * Helper-Method signaling that the internal changing of the targets
     * selection is over.
     * {@link #_startSelectionModification}
     */
    _endSelectionModification() {
      this._modifingSelection > 0 ? this._modifingSelection-- : null;
    },

    /**
     * Helper-Method for checking the state of the selection modification.
     * {@link #_startSelectionModification}
     * {@link #_endSelectionModification}
     * @return {Boolean} <code>true</code> if selection modification is active
     */
    _inSelectionModification() {
      return this._modifingSelection > 0;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    if (this.__ownSelection) {
      this.__ownSelection.dispose();
    }
  }
});
