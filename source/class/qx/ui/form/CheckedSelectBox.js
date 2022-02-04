/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2021-2021 Zenesis Limited https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * A form widget which allows multiple selection with a drop down checked list.
 *
 * @childControl spacer {qx.ui.core.Spacer} flexible spacer widget
 * @childControl atom {qx.ui.basic.Atom} shows the text and icon of the content
 * @childControl arrow {qx.ui.basic.Image} shows the arrow to open the popup
 */
qx.Class.define("qx.ui.form.CheckedSelectBox", {
  extend: qx.ui.form.AbstractSelectBox,
  implement: [
    qx.ui.core.IMultiSelection,
    qx.ui.form.IModelSelection,
    qx.ui.form.IField
  ],

  construct() {
    super();
    this.__modelSelection = new qx.data.Array();
    this.__modelSelection.addListener(
      "change",
      this.__onModelSelectionChange,
      this
    );

    this.__atomsOnDisplay = [];

    this._add(this._createChildControl("tags"), { flex: 1, flexShrink: true });
    this._add(this._createChildControl("spacer"));
    this._add(this._createChildControl("arrow"));

    // Register listener
    this.addListener("pointerover", this._onPointerOver, this);
    this.addListener("pointerout", this._onPointerOut, this);
    this.addListener("tap", this._onTap, this);
  },

  properties: {
    appearance: {
      refine: true,
      init: "checked-selectbox"
    }
  },

  events: {
    /** Event for psuedo property selection */
    changeSelection: "qx.event.type.Data",

    /** Event for psuedo property checked */
    changeChecked: "qx.event.type.Data",

    /** Event for psuedo property value */
    changeValue: "qx.event.type.Data",

    /** Event for psuedo property modelSelection */
    changeModelSelection: "qx.event.type.Data",

    /** Fired when a tag widget is added to the results; data is a map containing:
     * `tagWidget` - the tag widget being added
     * `item` - the item in the list that is checked
     * `itemModel` - the model item that backs the item
     */
    attachResultsTag: "qx.event.type.Data",

    /** Fired when a tag widget is removed from the results; data is a map containing:
     * `tagWidget` - the tag widget being added
     * `item` - the item in the list that is checked
     * `itemModel` - the model item that backs the item
     */
    detachResultsTag: "qx.event.type.Data"
  },

  members: {
    /** @type {qx.data.Array} the modelSelection psuedo property */
    __modelSelection: null,

    /** @type {qx.ui.basic.Atom[]} atoms used to show the selection */
    __atomsOnDisplay: null,

    /**
     * @Override
     * @lint ignoreReferenceField(_forwardStates)
     */
    _forwardStates: {
      focused: true
    },

    /**
     * @Override
     */
    _createChildControlImpl(id, hash) {
      switch (id) {
        case "popup":
          var control = new qx.ui.popup.Popup(new qx.ui.layout.VBox()).set({
            autoHide: false,
            keepActive: false
          });

          control.add(this.getChildControl("allNone"));
          control.add(this.getChildControl("list"));
          control.addListener(
            "changeVisibility",
            this._onPopupChangeVisibility,
            this
          );

          return control;

        case "allNone":
          var control = new qx.ui.form.Button("All / None").set({
            allowGrowX: false
          });

          control.addListener("execute", this._onAllNoneExecute, this);
          return control;

        case "list":
          var control = new qx.ui.form.CheckedList().set({
            focusable: false,
            keepFocus: true,
            height: null,
            width: null,
            maxHeight: this.getMaxListHeight()
          });

          control.addListener("changeChecked", this._onListChangeChecked, this);
          return control;

        case "spacer":
          return new qx.ui.core.Spacer();

        case "tags":
          return new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
            allowGrowX: false
          });

        case "tag":
          return new qx.ui.form.Tag();

        case "arrow":
          return new qx.ui.basic.Image().set({ anonymous: true });
      }

      return super._createChildControlImpl(id);
    },

    /**
     * @Override
     * @see qx.ui.form.IField
     */
    getValue() {
      return this.getSelection();
    },

    /**
     * @Override
     * @see qx.ui.form.IField
     */
    setValue(value) {
      this.setSelection(value);
    },

    /**
     * @Override
     * @see qx.ui.form.IField
     */
    resetValue() {
      this.setSelection([]);
    },

    /**
     * Getter for psuedo property "checked"
     *
     * @return {qx.ui.form.IListItem[]}
     */
    getChecked() {
      return this.getChildControl("list").getChecked();
    },

    /**
     * Setter for psuedo property "checked"
     *
     * @param checked {qx.ui.form.IListItem[]}
     */
    setChecked(checked) {
      this.getChildControl("list").setChecked(checked);
    },

    /**
     * Reset for psuedo property "checked"
     */
    resetChecked() {
      this.getChildControl("list").resetChecked();
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    getSelection() {
      return this.getChildControl("list").getChecked();
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    setSelection(items) {
      this.getChildControl("list").setChecked(items);
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    resetSelection() {
      this.getChildControl("list").setChecked([]);
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    isSelected(item) {
      return qx.lang.Array.contains(
        this.getChildControl("list").getChecked(),
        item
      );
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    isSelectionEmpty() {
      return this.getChildControl("list").getChecked().length == 0;
    },

    /**
     * @Override
     * @see qx.ui.core.ISingleSelection
     */
    getSelectables() {
      return this.getChildControl("list").getChildren();
    },

    /**
     * @Override
     * @see qx.ui.core.IMultiSelection
     */
    selectAll() {
      let lst = this.getChildControl("list");
      lst.setChecked(lst.getChildren());
    },

    /**
     * @Override
     * @see qx.ui.core.IMultiSelection
     */
    addToSelection(item) {
      let lst = this.getChildControl("list");
      let checked = lst.getChecked();
      if (!qx.lang.Array.contain(checked, item)) {
        checked.push(item);
        lst.setChecked(checked);
      }
    },

    /**
     * @Override
     * @see qx.ui.core.IMultiSelection
     */
    removeFromSelection(item) {
      let lst = this.getChildControl("list");
      let checked = lst.getChecked();
      if (qx.lang.Array.remove(checked, item)) {
        lst.setChecked(checked);
      }
    },

    /**
     * @Override
     * @see qx.ui.form.IModelSelection
     */
    setModelSelection(value) {
      this.__onModelSelectionChange.replace(value ? value : []);
    },

    /**
     * @Override
     * @see qx.ui.form.IModelSelection
     */
    getModelSelection() {
      return this.__modelSelection;
    },

    /**
     * Event handler for changes to the modelSelection array
     */
    __onModelSelectionChange(evt) {
      let checked = [];
      let selected = {};
      this.getModelSelection().forEach(
        itemModel => (selected[itemModel.toHashCode()] = itemModel)
      );

      this.getChildren().forEach(item => {
        let itemModel = item.getModel();
        if (selected[itemModel.toHashCode()]) {
          checked.push(item);
        }
      });
      let lst = this.getChildControl("list");
      if (!qx.lang.Array.equals(checked, lst.getChecked())) {
        lst.setChecked(checked);
      }
    },

    /**
     * Event handler for the All/None button
     */
    _onAllNoneExecute() {
      let lst = this.getChildControl("list");
      let checked = lst.getChecked();
      if (checked.length == 0) {
        lst.setChecked(lst.getChildren());
      } else {
        lst.setChecked([]);
      }
    },

    /**
     * Event handler for changes to the list's checked array
     */
    _onListChangeChecked(evt) {
      let lst = this.getChildControl("list");
      let modelSelection = lst.getChecked().map(item => item.getModel());
      if (
        !qx.lang.Array.equals(
          modelSelection,
          this.getModelSelection().toArray()
        )
      ) {
        this.__modelSelection.replace(modelSelection);
        this.fireDataEvent("changeValue", this.getValue());

        let children = {};
        this.getChildren().forEach(item => {
          let itemModel = item.getModel();
          children[itemModel.toHashCode()] = item;
        });

        let tags = this.getChildControl("tags");
        const attachTag = (tag, itemModel) => {
          tags.add(tag);
          let item = children[itemModel.toHashCode()];
          tag.set({
            model: itemModel,
            label: item.getLabel()
          });

          this.fireDataEvent("attachResultsTag", {
            tagWidget: tag,
            item: item,
            itemModel: itemModel
          });
        };
        const detachTag = tag => {
          let itemModel = tag.getModel();
          tag.setModel(null);
          tags.remove(tag);
          this.fireDataEvent("detachResultsTag", {
            tagWidget: tag,
            item: children[itemModel.toHashCode()],
            itemModel: itemModel
          });
        };

        while (this.__atomsOnDisplay.length > modelSelection.length) {
          let tag = this.__atomsOnDisplay.pop();
          detachTag(tag);
        }
        modelSelection.forEach((itemModel, index) => {
          let tag = this.getChildControl("tag#" + index);
          if (this.__atomsOnDisplay.length <= index) {
            this.__atomsOnDisplay.push(tag);
          } else {
            this.__atomsOnDisplay[index] = tag;
          }
          attachTag(tag, itemModel);
        });
      }
    },

    /**
     * Listener method for "pointerover" event
     * <ul>
     * <li>Adds state "hovered"</li>
     * <li>Removes "abandoned" and adds "pressed" state (if "abandoned" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onPointerOver(e) {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      if (this.hasState("abandoned")) {
        this.removeState("abandoned");
        this.addState("pressed");
      }

      this.addState("hovered");
    },

    /**
     * Listener method for "pointerout" event
     * <ul>
     * <li>Removes "hovered" state</li>
     * <li>Adds "abandoned" and removes "pressed" state (if "pressed" state is set)</li>
     * </ul>
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onPointerOut(e) {
      if (!this.isEnabled() || e.getTarget() !== this) {
        return;
      }

      this.removeState("hovered");

      if (this.hasState("pressed")) {
        this.removeState("pressed");
        this.addState("abandoned");
      }
    },

    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Pointer} Pointer event
     */
    _onTap(e) {
      this.open();
    },

    /**
     * @Override
     */
    _onBlur(evt) {
      let popup = this.getChildControl("popup");
      for (
        let widget = evt.getRelatedTarget();
        widget;
        widget = widget.getLayoutParent()
      ) {
        if (widget == popup) {
          evt.getRelatedTarget().addListenerOnce("blur", this._onBlur, this);
          return;
        }
      }

      this.close();
    }
  }
});
