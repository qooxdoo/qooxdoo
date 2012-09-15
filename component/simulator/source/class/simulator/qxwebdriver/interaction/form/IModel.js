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

/**
 * Interactions for widgets that implement {@link qx.ui.form.IModel}
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.IModel", {

  statics :
  {
    /**
     * Returns the labels of the items in this widget's data model.
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array of item labels
     */
    getModelItemLabels : function()
    {
      var func = simulator.qxwebdriver.Util.getModelItemLabels;
      var script = simulator.qxwebdriver.Util.functionToString(func, {
        QXHASH : this.qxHash
      });
      script = 'return (' + script + ')()';

      return this.driver_.executeScript(script);
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.IModel",
      "getModelItemLabels", statics.getModelItemLabels);
  }
});