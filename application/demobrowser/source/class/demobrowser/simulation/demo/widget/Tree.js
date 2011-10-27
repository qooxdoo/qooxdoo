/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * QxSelenium test case for the widget.Tree demo.
 *
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("demobrowser.simulation.demo.widget.Tree", {

  extend : demobrowser.simulation.demo.Abstract,

  members :
  {
    locators : null,

    setUp : function()
    {
      this.base(arguments);
      if (!this.locators) {
        this.locators = {};
        this.locators.tree = this.iframeRootLocator + "/qx.ui.container.Composite/qx.ui.tree.Tree";
        this.locators.textField = this.iframeRootLocator + "/qx.ui.container.Composite/qx.ui.groupbox.GroupBox/qx.ui.form.TextField"
      }
    },

    testSingleSelection : function()
    {
      //get the label of the tree root's first child
      var firstItemLocator = this.locators.tree + "/child[0]/child[0]";
      var firstItemLabel = String(this.getQxSelenium().getQxObjectFunction(firstItemLocator, "getLabel"));
      //click the root's first child
      this.getQxSelenium().qxClick(firstItemLocator);
      this.getSimulation().wait(1000);
      //check the text field's value
      var textFieldValue = String(this.getQxSelenium().getQxObjectFunction(this.locators.textField, "getValue"));
      this.assertEquals(firstItemLabel, textFieldValue);
    }
  }
});