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
 * Interactions for {@link qx.ui.form.VirtualComboBox} and derived widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.VirtualComboBox", {

  statics :
  {
    /**
     * Selects an entry from the drop-down list of a {@link qx.ui.form.ComboBox}.
     * @param item {String|Integer} The index or label of the list item to click
     * @return {webdriver.Promise} A promise that will be resolved when the
     * target item is selected
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
        button.click();
        return this.findElement(simulator.webdriver.By.js(findItem))
        .then(function(element) {
          element.click();
        });
      }.bind(this));
    },

    /**
     * Simulates typing in the text field of a {@link qx.ui.form.VirtualComboBox}
     * @param value {String} The characters to type
     * @return {webdriver.promise.Promise} A promise that will be resolved when typing
     * is finished
     */
    type : simulator.qxwebdriver.interaction.form.ComboBox.type
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.VirtualComboBox",
      "selectItem", statics.selectItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.VirtualComboBox",
      "type", statics.type);
  }
});
