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
 * Provides a version of `qx.ui.form.List` which expects children to be instances
 * of `qx.ui.form.CheckBox` and has a `checked` property
 */
qx.Class.define("qx.ui.form.CheckedList", {
  extend: qx.ui.form.List,

  construct() {
    super();
    this.__checked = {};
  },

  destruct() {
    this.__checked.dispose();
    this.__checked = null;
  },

  events: {
    /** Fired when the checked array changes, data is the array */
    changeChecked: "qx.event.type.Data"
  },

  members: {
    /** @type {Map<String,qx.ui.form.CheckBox>} map of checked items, indexed by hash code */
    __checked: null,

    /**
     * Returns the array of checked items
     *
     * @return {qx.ui.form.CheckBox[]}
     */
    getChecked() {
      return Object.values(this.__checked);
    },

    /**
     * Sets the array of checked items
     *
     * @param {qx.ui.form.CheckBox[]} the replacement array of checked items
     */
    setChecked(checked) {
      let oldData = this.getChecked();
      this.__inChangingChecked = true;
      try {
        let toUncheck = {};
        Object.values(this.__checked).forEach(
          item => (toUncheck[item.toHashCode()] = item)
        );

        let replacement = {};
        if (!checked) {
          checked = [];
        } else {
          if (qx.core.Environment.get("qx.debug")) {
            let lookup = {};
            this.getChildren().forEach(
              item => (lookup[item.toHashCode()] = item)
            );

            checked.forEach(item =>
              this.assertTrue(
                !!lookup[item.toHashCode()],
                `The item ${item} to be checked is not a child of this list`
              )
            );
          }

          let someTurnedOn = false;
          checked.forEach(item => {
            let hash = item.toHashCode();
            if (!this.__checked[hash]) {
              someTurnedOn = true;
              item.setValue(true);
            }
            delete toUncheck[hash];
            replacement[hash] = item;
          });

          // Nothing turned on and nothing to turn off - then no change
          if (!someTurnedOn && Object.keys(toUncheck).length == 0) {
            return;
          }
        }
        Object.values(toUncheck).forEach(item => item.setValue(false));
        this.__checked = replacement;
      } finally {
        this.__inChangingChecked = false;
      }

      this.fireDataEvent("changeChecked", this.getChecked(), oldData);
    },

    /**
     * Clears the list of checked items
     */
    resetChecked() {
      this.setChecked(null);
    },

    /*
     * @Override
     */
    _onAddChild(evt) {
      super._onAddChild(evt);

      let item = evt.getData();
      if (qx.core.Environment.get("qx.debug")) {
        this.assertInstance(
          item,
          qx.ui.form.CheckBox,
          this.classname +
            " only supports instances of qx.ui.form.CheckBox as children"
        );
      }
      if (item.getValue()) {
        this.__onItemChangeCheckedImpl(item);
      }
      item.addListener("changeValue", this.__onItemChangeChecked, this);
    },

    /*
     * @Override
     */
    _onRemoveChild(evt) {
      super._onRemoveChild(evt);

      let item = evt.getData();
      item.removeListener("changeValue", this.__onItemChangeChecked, this);

      if (item.getValue()) {
        this.__onItemChangeCheckedImpl(item, true);
      }
    },

    /**
     * Event handler for when an item is [un]checked
     *
     * @param evt {qx.event.type.Data} the event
     */
    __onItemChangeChecked(evt) {
      if (this.__inChangingChecked) {
        return;
      }
      this.__onItemChangeCheckedImpl(evt.getTarget());
    },

    /**
     * Handles changes in the items checked state
     *
     * @param item {qx.ui.form.CheckBox} the item
     * @param removing {Boolean} whether the item is being removed (act as if unchecking)
     */
    __onItemChangeCheckedImpl(item, removing) {
      let hash = item.toHashCode();
      let checked = item.getValue();
      if (removing) {
        checked = false;
      }
      let changed = false;
      let oldData = this.getChecked();
      if (checked) {
        if (!this.__checked[hash]) {
          changed = true;
          this.__checked[hash] = item;
        }
      } else {
        if (this.__checked[hash]) {
          delete this.__checked[hash];
          changed = true;
        }
      }
      if (changed) {
        this.fireDataEvent("changeChecked", this.getChecked(), oldData);
      }
    }
  }
});
