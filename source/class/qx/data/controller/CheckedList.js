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
 * Extension of `qx.data.controller.List` which adds support for `qx.ui.form.CheckedList`
 * and `qx.ui.form.CheckedSelectBox`.
 *
 * The principal is that the underlying `List` controller implementation has a model which
 * is the complete array of items that can be selected, and that array is used to populate
 * the UI widget (ie as normal).
 *
 * The `checked` psuedo property in this `CheckedList` controller relates to the checked
 * property of the UI widget.
 */
qx.Class.define("qx.data.controller.CheckedList", {
  extend: qx.data.controller.List,

  /**
   * Constructor
   *
   * @param model {qx.data.Array?null} the model array
   * @param widget {qx.ui.core.Widget?null} the widget target
   * @param path {String} the path in the model for the caption
   */
  construct(model, widget, path) {
    super(null, widget, path);
    this.setChecked(new qx.data.Array());
    if (model) {
      this.setModel(model);
    }
  },

  properties: {
    checked: {
      init: null,
      nullable: true,
      check: "qx.data.Array",
      event: "changeChecked",
      apply: "_applyChecked"
    },

    /**
     * The path to the property which holds the information that should be
     * shown as a label for a tag for a checked item. This is only needed if
     * used with a CheckedSelectBox, and only if live updates of the label
     * are required.
     */
    checkedLabelPath: {
      check: "String",
      apply: "__updateTags",
      nullable: true
    },

    /**
     * The path to the property which holds the information that should be
     * shown as an icon for a tag for a checked item. This is only needed if
     * used with a CheckedSelectBox, and only if live updates of the label
     * are required.
     */
    checkedIconPath: {
      check: "String",
      apply: "__updateTags",
      nullable: true
    },

    /**
     * A map containing the options for the checkedLabel binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    checkedLabelOptions: {
      apply: "__updateTags",
      nullable: true
    },

    /**
     * A map containing the options for the checked icon binding. The possible keys
     * can be found in the {@link qx.data.SingleValueBinding} documentation.
     */
    checkedIconOptions: {
      apply: "__updateTags",
      nullable: true
    }
  },

  members: {
    _applyChecked(value, oldValue) {
      if (oldValue) {
        oldValue.removeListener("change", this.__onCheckedChange, this);
      }
      if (value) {
        value.addListener("change", this.__onCheckedChange, this);
      }
      this._updateChecked();
    },

    /**
     * @Override
     */
    _createItem() {
      var delegate = this.getDelegate();
      var item;

      // check if a delegate and a create method is set
      if (delegate != null && delegate.createItem != null) {
        item = delegate.createItem();
      } else {
        item = new qx.ui.form.CheckBox();
      }

      // if there is a configure method, invoke it
      if (delegate != null && delegate.configureItem != null) {
        delegate.configureItem(item);
      }

      return item;
    },

    /**
     * Event handler for changes to the checked array
     *
     * @param evt {qx.event.type.Data} the event
     */
    __onCheckedChange(evt) {
      let data = evt.getData();
      if (data.type == "order") {
        return;
      }
      this._updateChecked();
    },

    /**
     * @Override
     */
    update() {
      super.update();
      this._updateChecked();
    },

    /**
     * @Override
     */
    _setFilter(value, old) {
      super._setFilter(value, old);
      this.__syncModelChecked = true;
      qx.ui.core.queue.Widget.add(this);
    },

    /**
     * @Override
     */
    syncWidget() {
      super.syncWidget();
      if (this.__syncModelChecked) {
        this._updateChecked();
      }
      this.__syncModelChecked = null;
    },

    /**
     * @Override
     */
    _applyModel(value, oldValue) {
      if (!value || !value.getLength()) {
        let checked = this.getChecked();
        if (checked) {
          checked.removeAll();
        }
      }
      super._applyModel(value, oldValue);
      this._updateChecked();
    },

    /**
     * @Override
     */
    _applyTarget(value, oldValue) {
      super._applyTarget(value, oldValue);
      if (oldValue) {
        oldValue.removeListener(
          "changeChecked",
          this.__onTargetCheckedChange,
          this
        );

        if (qx.Class.supportsEvent(oldValue.constructor, "attachResultsTag")) {
          oldValue.removeListener(
            "attachResultsTag",
            this.__onTargetAttachResultsTag,
            this
          );

          oldValue.removeListener(
            "detachResultsTag",
            this.__onTargetDetachResultsTag,
            this
          );
        }
      }
      if (value) {
        value.addListener("changeChecked", this.__onTargetCheckedChange, this);
        if (qx.Class.supportsEvent(value.constructor, "attachResultsTag")) {
          value.addListener(
            "attachResultsTag",
            this.__onTargetAttachResultsTag,
            this
          );

          value.addListener(
            "detachResultsTag",
            this.__onTargetDetachResultsTag,
            this
          );
        }
      }
    },

    /**
     * Event handler for changes in the target widget's `checked` property
     */
    __onTargetCheckedChange(evt) {
      if (this.__inUpdateChecked) {
        return;
      }
      let target = this.getTarget();
      let replacement = [];
      target.getChecked().forEach(item => {
        let itemModel = item.getModel();
        if (itemModel) {
          replacement.push(itemModel);
        }
      });
      let checked = this.getChecked();
      if (checked) {
        checked.replace(replacement);
      }
    },

    /**
     * Event handler for changes in the target widget's `attachResults` property
     */
    __onTargetAttachResultsTag(evt) {
      let { tagWidget, item } = evt.getData();
      item.setUserData(this.classname + ".tagWidget", tagWidget);
      this.__attachTag(tagWidget, item);
    },

    /**
     * Event handler for changes in the target widget's `detachResults` property
     */
    __onTargetDetachResultsTag(evt) {
      let { tagWidget, item } = evt.getData();
      this.__detachTag(tagWidget, item);
      item.setUserData(this.classname + ".tagWidget", null);
    },

    /**
     * Updates all tags in the target widget
     */
    __updateTags() {
      let target = this.getTarget();
      if (!target) {
        return;
      }
      target.getChecked().forEach(item => {
        let tagWidget = item.getUserData(this.classname + ".tagWidget");
        this.__detachTag(tagWidget, item);
        this.__attachTag(tagWidget, item);
      });
    },

    /**
     * Attaches a single tag; used to bind to the tag so that live updates to the underlying model are reflected in tag names
     *
     * @param tagWidget {qx.ui.core.Widget} the widget which is the tag
     * @param item {qx.ui.core.Widget} the list item that lists the model item that this tag is for
     */
    __attachTag(tagWidget, item) {
      let itemModel = item.getModel();
      let bindData = {};
      if (this.getCheckedLabelPath()) {
        bindData.checkedLabelId = itemModel.bind(
          this.getCheckedLabelPath(),
          tagWidget,
          "label",
          this.getCheckedLabelOptions()
        );
      }
      if (this.getCheckedIconPath()) {
        bindData.checkedIconId = itemModel.bind(
          this.getCheckedIconPath(),
          tagWidget,
          "label",
          this.getCheckedIconOptions()
        );
      }
      itemModel.setUserData(this.classname + ".bindData", bindData);
    },

    /**
     * Detaches a single tag, inverse of `__attachTag`
     *
     * @param tagWidget {qx.ui.core.Widget} the widget which is the tag
     * @param item {qx.ui.core.Widget} the list item that lists the model item that this tag is for
     */
    __detachTag(tagWidget, item) {
      let itemModel = item.getModel();
      let bindData = itemModel.getUserData(this.classname + ".bindData");
      if (bindData) {
        if (bindData.checkedLabelId) {
          itemModel.removeListenerById(bindData.checkedLabelId);
        }
        if (bindData.checkedIconId) {
          itemModel.removeListenerById(bindData.checkedIconId);
        }
        itemModel.setUserData(this.classname + ".bindData", null);
      }
    },

    /**
     * Updates the checked widget items to match the array of checked model items
     */
    _updateChecked() {
      let target = this.getTarget();
      if (!target) {
        return;
      }

      if (this.__inUpdateChecked) {
        return;
      }
      this.__inUpdateChecked = true;
      try {
        // Maps of the widget item, indexed by the hashcode of the model item
        let children = {};
        let toUncheck = {};

        target.getChildren().forEach(item => {
          let itemModel = item.getModel();
          if (itemModel) {
            let hash = itemModel.toHashCode();
            children[hash] = item;
            if (item.getValue()) {
              toUncheck[hash] = item;
            }
          }
        });

        let toRemove = [];
        let checked = this.getChecked();
        if (checked) {
          checked.forEach(itemModel => {
            let hash = itemModel.toHashCode();
            if (itemModel) {
              delete toUncheck[hash];
              if (children[hash]) {
                children[hash].setValue(true);
              } else {
                toRemove.push(itemModel);
              }
            }
          });
          Object.values(toUncheck).forEach(item => item.setValue(false));
          toRemove.forEach(item => checked.remove(item));
        }
      } finally {
        this.__inUpdateChecked = false;
      }
    }
  }
});
