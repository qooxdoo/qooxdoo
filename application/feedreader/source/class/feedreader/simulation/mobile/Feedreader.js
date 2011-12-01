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
 * Mobile Feedreader GUI tests
 *
 * @lint ignoreUndefined(simulator)
 * @lint ignoreUndefined(selenium)
 */
qx.Class.define("feedreader.simulation.mobile.Feedreader", {

  extend : simulator.unit.TestCase,

  construct : function()
  {
    this.base(arguments);
    this.locators = {
      feedList : "qxhv=[@classname=feedreader.view.mobile.OverviewPage]/qx.ui.mobile.container.Scroll/qx.ui.mobile.container.Composite/qx.ui.mobile.list.List",
      backButton : "qxhv=*/[@classname=qx.ui.mobile.navigationbar.BackButton]"
    };
  },

  members : {

    __feedTitles : null,

    /**
     * Returns a list with the titles of all displayed feeds
     *
     * @lint ignoreDeprecated(eval)
     * @return {String[]} Feed titles
     */
    _getFeedTitles : function()
    {
      if (this.__feedTitles) {
        return this.__feedTitles;
      }

      var getFeedTitles = 'function() {'
      +   'var titles = [];'
      +   'var items = selenium.qxStoredVars["autWindow"].document.getElementsByClassName("listItem");'
      +   'for (var i=0, l=items.length; i<l; i++) {'
      +   '  var title = items[i].firstChild.children[1].firstChild.firstChild.nodeValue;'
      +   '  titles.push(title);'
      +   '}'
      +   'return JSON.stringify(titles);'
      + '};';

      this.getSimulation()._addOwnFunction("getFeedTitles", getFeedTitles);
      var functionCall = 'selenium.qxStoredVars["autWindow"].qx.Simulation.getFeedTitles()';
      var result = String(this.getQxSelenium().getEval(functionCall));
      this.__feedTitles = eval(result);
      return this.__feedTitles;
    },

    setUp : function()
    {
      this.getQxSelenium().setSpeed(1000);
    },

    tearDown : function()
    {
      this.getQxSelenium().setSpeed(250);
    },

    "test feeds displayed" : function()
    {
      var feedTitles = this._getFeedTitles();
      this.assertNotEquals(0, feedTitles.length, "No feeds displayed!");
    },

    "test select each feed" : function()
    {
      var titles = this._getFeedTitles();

      for (var i=0, l=titles.length; i<l; i++) {
        var feedTitle = titles[i];
        var subLocator = '//div[text()="' + feedTitle + '"]/../../..';
        var fullLocator = "qxhybrid=" + this.locators.feedList +  "&&" + subLocator;

        this.getQxSelenium().qxClick(fullLocator);
        this.getSimulation().wait(250);
        var back = this.getSimulation().getWidgetOrNull(this.locators.backButton);
        this.assertNotNull(back, "Back button not present after clicking " + feedTitle);

        this.getQxSelenium().qxClick(this.locators.backButton);
        this.getSimulation().wait(250);
        back = this.getSimulation().getWidgetOrNull(this.locators.backButton);

        if (back) {
          this.getQxSelenium().qxClick(this.locators.backButton);
          this.getSimulation().wait(250);
          back = this.getSimulation().getWidgetOrNull(this.locators.backButton);
        }
        this.assertNull(back, "Back button still present! Feed: " + feedTitle);
      }
    }

  }
});