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
 * Base class for Feedreader GUI tests
 *
 * @lint ignoreUndefined(simulator)
 * @lint ignoreUndefined(selenium)
 */
qx.Class.define("feedreader.simulation.ria.FeedreaderAbstract", {

  extend : simulator.unit.TestCase,

  type : "abstract",

  construct : function()
  {
    this.base(arguments);
    this.locators = {
      articleView : 'qxh=qx.ui.container.Composite/qx.ui.splitpane.Pane/qx.ui.splitpane.Pane/[@classname="feedreader.view.desktop.Article"]',
      feedTree : 'qxh=qx.ui.container.Composite/qx.ui.splitpane.Pane/qx.ui.tree.Tree',
      feedTreeItemStaticFeeds : 'qxhv=*/qx.ui.tree.Tree/*/qx.ui.tree.TreeFolder',
      reloadButton : 'qxhv=*/[@label="Reload"]',
      firstFeed : 'qxh=child[0]/qx.ui.splitpane.Pane/qx.ui.tree.Tree/*/[@label="qooxdoo News"]',
      firstFeedItem : 'qxh=child[0]/qx.ui.splitpane.Pane/qx.ui.splitpane.Pane/[@classname="feedreader.view.desktop.List"]/qx.ui.container.Stack/qx.ui.form.List/qx.ui.core.scroll.ScrollPane/qx.ui.container.Composite/child[0]',
      staticFeedsItem : 'qxh=qx.ui.container.Composite/qx.ui.splitpane.Pane/qx.ui.tree.Tree/child[0]/child[1]',
      preferencesButton : 'qxhv=*/[@label="Preferences"]',
      preferencesWindow : 'qxhv=[@classname="feedreader.view.desktop.PreferenceWindow"]',
      addFeedButton : 'qxhv=*/[@label="Add"]',
      feedWindow : 'qxhv=[@classname="feedreader.view.desktop.AddFeedWindow"]',
      feedWindowButton : 'qxh=app:[@caption=".*feed.*"]/qx.ui.form.renderer.SinglePlaceholder/qx.ui.container.Composite/qx.ui.form.Button'
    };

    this.locators.buttonItalian = this.locators.preferencesWindow + '/*/[@label="Italiano"]';
    this.locators.buttonOk = this.locators.preferencesWindow + '/*/[@label="OK"]';
  },

  members :
  {
    locators : null,

    setUp : function()
    {
      this.getQxSelenium().getEval(simulator.Simulation.AUTWINDOW + '.qx.log.Logger.setLevel("warn");');
      this.getQxSelenium().getEval(simulator.Simulation.AUTWINDOW + '.qx.log.Logger.clear();');
      this.getSimulation().clearAutLogStore();
      this.getSimulation().clearGlobalErrorStore();
      this.waitForFeeds();
      this.getQxSelenium().setSpeed(250);
    },

    tearDown : function()
    {
      this.getQxSelenium().setSpeed(0);
      this.getSimulation().logAutLogEntries();
      this.getSimulation().logGlobalErrors();
    },

    /**
     * Checks if all feeds in the tree have finished loading. If any feeds are
     * still displaying the "loading" icon after 30 seconds, the "Reload"
     * button is clicked and we wait for another 30 seconds.
     *
     * @lint ignoreUndefined(selenium)
     */
    waitForFeeds : function()
    {
      var feedsLoaded = function(treeLocator) {
        var tree = selenium.getQxWidgetByLocator(treeLocator);
        var ready = true;
        var items = tree.getItems();
        for (var i=0,l=items.length; i<l; i++) {
          if (items[i].getChildren().length == 0) {
            var icon = items[i].getIcon();
            if (!(icon.indexOf('internet-feed-reader.png') >=0 || icon.indexOf('process-stop') >=0 )) {
              ready = false;
            }
          }
        }
        return ready;
      };
      this.getSimulation()._addOwnFunction("feedsLoaded", feedsLoaded);
      var condition = 'selenium.qxStoredVars["autWindow"].qx.Simulation.feedsLoaded("' + this.locators.feedTree + '")';
      try {
        this.getQxSelenium().waitForCondition(condition, "30000");
        //this.debug("All feeds finished loading.");
      } catch(ex) {
        this.warn("Feeds not loaded after 30 seconds, clicking reload");
        this.getQxSelenium().qxClick(this.locators.reloadButton);
        this.getQxSelenium().waitForCondition(condition, "30000");
      }
    }
  }

});