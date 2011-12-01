/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Widgetbrowser GUI tests
 *
 * @lint ignoreUndefined(simulator)
 * @lint ignoreUndefined(selenium)
 */
qx.Class.define("widgetbrowser.simulation.Widgetbrowser", {

  extend : simulator.unit.TestCase,

  construct : function()
  {
    this.base(arguments);
    this.locators = {
      tabView : 'qxh=child[0]/qx.ui.container.Scroll/qx.ui.core.scroll.ScrollPane/[@classname="widgetbrowser.view.TabView"]',
      tabContainer : '/qx.ui.container.SlideBar/qx.ui.core.scroll.ScrollPane/qx.ui.container.Composite'
    }
  },

  members :
  {
    locators : null,
    __tabNames : null,

    setUp : function()
    {
      this.getSimulation().clearAutLogStore();
      var setLocale = simulator.Simulation.AUTWINDOW + ".qx.locale.Manager.getInstance().setLocale('en')";
      this.getQxSelenium().getEval(setLocale);
      if (!this.__tabNames) {
        this.__tabNames = this._getTabNames();
      };
    },

    tearDown : function()
    {
      this.getSimulation().logAutLogEntries();
    },

    /**
     * Get the tabs' labels
     *
     * @lint ignoreDeprecated(eval)
     * @return {String[]} Array of tab labels
     */
    _getTabNames : function()
    {
      this.getSimulation().wait(5000);
      var labelGetter = "var labels = [];"
      + "var pages = this.getChildren();"
      + "for (var i=0,l=pages.length; i<l; i++) {"
      + "  labels.push(pages[i].getLabel());"
      + "}"
      + "return labels;";

      try {
        var strVal = String(this.getQxSelenium().getRunInContext(this.locators.tabView, labelGetter));
      }
      catch(ex) {
        this.getSimulation().wait(999999);
      }
      try {
        return eval(strVal);
      } catch(ex) {
        return strVal.split(",");
      }

    },

    "test load each tab page" : function()
    {
      for (var i=0; i<this.__tabNames.length; i++) {
        var tabName = this.__tabNames[i];
        this.info("Clicking tab " + tabName);
        if (tabName.indexOf('/') >= 0) {
          tabName = /(.*?)\//.exec(tabName)[1];
        }
        this.getQxSelenium().qxClick(this.locators.tabView + this.locators.tabContainer + '/[@label=' + tabName + ']');
        // Give the demo part some time to appear
        this.getSimulation().wait(5000);
        // Log any errors caught during demo startup
        this.getSimulation().logGlobalErrors();
        this.getSimulation().clearGlobalErrorStore();
      }
    }
  }
});