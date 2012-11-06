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
 * Interactions for {@link qx.ui.form.SelectBox} and derived widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.SelectBox", {

  statics :
  {
    /**
     * Selects an entry from a {@link qx.ui.form.SelectBox}.
     * @param item {String|Integer} The target list item's label text or index
     * @return {webdriver.Promise} A promise that will be resolved when the
     * target item is selected
     * @lint ignoreUndefined(simulator.webdriver.By)
     * @lint ignoreUndefined(simulator.webdriver.promise)
     */
    selectItem : function(item)
    {
      var promise = simulator.webdriver.promise.Application.getInstance();
      var getItem = simulator.qxwebdriver.interaction.core.ISingleSelection.getItemFromSelectables;

      var script = simulator.qxwebdriver.Util.functionToString(getItem, {
        QXHASH : this.qxHash,
        ITEM : typeof item == "string" ? "'" + item + "'" : item
      });

      script = 'return (' + script + ')()';

      return promise.schedule("click SelectBox button", function() {
        return this.click()
        .then(function() {
          return this.findElement(simulator.webdriver.By.js(script)).
          then(function(element) {
            return element.click();
          });
        }.bind(this));
      }.bind(this));
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
