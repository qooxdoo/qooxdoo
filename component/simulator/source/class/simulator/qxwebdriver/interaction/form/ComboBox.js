/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Author:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* ************************************************************************
#ignore(simulator.webdriver.By)
************************************************************************ */

/**
 * Interactions for {@link qx.ui.form.ComboBox} and derived widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.ComboBox", {

  statics :
  {
    /**
     * Simulates a user clicking the ComboBox button and then clicking an item
     * from the popup list
     * @param item {String|Integer} The index or label of the list item to click
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the specified list item has been selected
     * @lint ignoreUndefined(simulator.webdriver.By)
     */
    selectItem : function(item)
    {
      var getButton = simulator.qxwebdriver.interaction.core.Widget.getChildControl;
      var findButton = simulator.qxwebdriver.Util.functionToString(getButton, {
        QXHASH : this.qxHash,
        CHILDCONTROL: 'button'
      });
      findButton= 'return (' + findButton + ')()';

      var getItem = simulator.qxwebdriver.interaction.core.MRemoteChildrenHandling.getItemFromChildren;
      var findItem = simulator.qxwebdriver.Util.functionToString(getItem, {
        QXHASH : this.qxHash,
        ITEM : typeof item == "string" ? "'" + item + "'" : item
      });
      findItem = 'return (' + findItem + ')()';

      return this.driver_.executeScript(findButton)
      .then(function(button) {
        button.click()
        .then(function() {
          return this.findElement(simulator.webdriver.By.js(findItem))
          .then(function(element) {
            return element.click();
          });
        }.bind(this));
      }.bind(this));
    },


    /**
     * Get the label values from the list items in a {@link qx.ui.form.ComboBox}
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array of item labels
     */
    getListItemLabels : simulator.qxwebdriver.interaction.core.MRemoteChildrenHandling.getLabelsFromChildren,


    /**
     * Simulates typing in the text field of a {@link qx.ui.form.ComboBox}
     * @param value {String} The characters to type
     * @return {webdriver.promise.Promise} A promise that will be resolved when typing
     * is finished
     */
    type : function(value)
    {
      var getTextField = "return qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildControl('textfield').getContentElement().getDomElement()";

      return this.driver_.executeScript(getTextField)
      .then(function(textField) {
        console.log("typeInCombo");
        return textField.sendKeys(value);
      });
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "selectItem", statics.selectItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "getListItemLabels", statics.getListItemLabels);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "type", statics.type);
  }
});
