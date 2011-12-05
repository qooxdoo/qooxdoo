/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * This widget represents a model item and allows editing one of its properties
 */
qx.Class.define("fce.view.ListItem", {

  extend : qx.ui.container.Composite,

  /**
   * @param modelItem {qx.core.Object?} Model item to represent, see {@link #modelItem}
   * @param valueProperty {String?} Name of the item property holding the value
   * to be edited
   * @param labelProperty {String?} Name of the item property holding the label
   */
  construct : function(modelItem, valueProperty, labelProperty)
  {
    var layout = new qx.ui.layout.HBox(10);
    this.base(arguments, layout);
    this.set({
      appearance: "listitem"
    });

    this.setLabelProperty(labelProperty);

    if (!qx.Class.hasProperty(modelItem.constructor, valueProperty)) {
      for (var prop in qx.util.PropertyUtil.getAllProperties(modelItem.constructor)) {
        if (prop !== "name" && prop !== "distinctValues") {
          valueProperty = prop;
          break;
        }
      }
    }
    this.setValueProperty(valueProperty);

    this.setModelItem(modelItem);
  },

  properties :
  {
    /** The model item to represent. Must be a qx.core.Object with the
     * properties name, initialValue and userValue */
    modelItem :
    {
      apply : "_applyModelItem"
    },

    /**  Name of the item property holding the label  */
    labelProperty :
    {
      init : null,
      nullable : true
    },

    /**  Name of the item property holding the value */
    valueProperty :
    {
      init : null,
      nullable : true
    },

    /** Necessary for theming support **/
    gap :
    {
      themeable : true
    }
  },

  members :
  {

    // property apply
    _applyModelItem : function(value, old)
    {
      var modelItem = value;

      var label = this.getChildControl("label");
      var labelText = "";
      if(this.getLabelProperty()) {
        var propName = this.getLabelProperty();
        labelText = modelItem.get(propName);
      }
      label.setValue(labelText);

      var itemValue = null;
      var isNumber = false;
      if(this.getValueProperty()) {
        var propName = this.getValueProperty();
        itemValue = modelItem.get(propName);
      }

      var input;
      if (typeof itemValue === "boolean") {
        input = this.getChildControl("checkbox");
      }
      else {
        input = this.getChildControl("textfield");
      }
      if (typeof itemValue === "number") {
        isNumber = true;
        itemValue = itemValue.toString();
      }
      input.setValue(itemValue);
      this.add(label, {flex: 1});
      this.add(input);

      if (this.getValueProperty()) {
        qx.data.SingleValueBinding.bind(input, "value", modelItem, this.getValueProperty(), {
          converter : function(data, modelObj, sourceObj, targetObj) {
            if (isNumber) {
              return parseInt(data, 10);
            }
            return data;
          }
        });
      }
    },

    // overriden
    _createChildControlImpl : function(id, hash)
    {
      var control;
      switch(id) {
        case "label":
          control = new qx.ui.basic.Label();
          control.set({
            anonymous: true,
            allowGrowX: true,
            font: "bigger"
          });
          break;
        case "checkbox":
          control = new qx.ui.form.CheckBox();
          break;
        case "textfield":
          control = new qx.ui.form.TextField();
          break;
      }

      return control;
    }
  }
});