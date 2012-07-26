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
 * Interactions for form widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.Form", {

  statics :
  {
    /**
     * Used to select an entry from a {@link qx.ui.form.SelectBox}.
     * @param itemLocator {webdriver.Locator} Locator strategy to find the
     * target list item
     * @return {webdriver.Promise} A promise that will be resolved when the
     * target item is selected
     */
    selectItem : function(itemLocator)
    {
      this.click();
      var menu = null;
      var waitForElement = function() {
        try {
          //TODO: Make sure we've got the right popup
          menu = this.findElement(simulator.webdriver.By.xpath('//div[@qxclass="qx.ui.popup.Popup"]'));
          return menu !== null;
        }
        catch(ex) {
          return false;
        }
      };

      this.driver_.wait(waitForElement.bind(this), 500)
      .then(function() {
        menu.findElement(itemLocator).then(function(element) {
          element.click();
        }, function(e) {
          e.message = "Couldn't find menu child of SelectBox! " + e.message;
          throw e;
        });
      });
    },

    /**
     * Get the label values from the list items in a {@link qx.ui.form.SelectBox}
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array of item labels
     */
    getListItemLabels : function()
    {
      var script = "var labels = []; qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getSelectables().forEach(function(item) { labels.push(item.getLabel()) });" +
        "return labels;";
      return this.driver_.executeScript(script)
      .then(function(value) {
        return value;
      });
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.SelectBox",
      "selectItem", statics.selectItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.SelectBox",
      "getListItemLabels", statics.getListItemLabels);
  }
});