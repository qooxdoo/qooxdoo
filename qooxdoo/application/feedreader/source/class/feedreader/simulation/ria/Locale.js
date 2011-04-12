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
 * Tests the Feedreader's internationalization feature.
 */
qx.Class.define("feedreader.simulation.ria.Locale", {

  extend : feedreader.simulation.ria.FeedreaderAbstract,

  members :
  {
    /**
     * Use the Preferences menu to change the application's locale to Italian.
     * Check if the Label of the "static feeds" tree folder changed.
     */
    testSwitchLocale : function()
    {
      // Get the original value of the "Static Feeds" label
      var labelScript = "return this.getLabel().translate().toString()";
      var staticLabelInitial = String(this.getQxSelenium().getRunInContext(this.locators.feedTreeItemStaticFeeds, labelScript));

      // Click "Preferences"
      this.getQxSelenium().qxClick(this.locators.preferencesButton);

      this.getSimulation().waitForWidget(this.locators.preferencesWindow, 10000);

      // Click the "Italiano" radio button.
      this.getQxSelenium().qxClick(this.locators.buttonItalian);

      // Click the "OK" button
      this.getQxSelenium().qxClick(this.locators.buttonOk);
      this.getSimulation().wait(2000);

      // Check if the Preferences window was closed
      // TODO: Find out why assertException won't work with Rhino's JavaExceptions
      var exception;
      try {
        this.getQxSelenium().qxClick(this.locators.preferencesWindow);
      } catch(ex) {
        exception = true;
      }
      if (!exception) {
        throw new Error("Preferences window did not close!");
      }

      // Get the new value of the "Static Feeds" label
      var staticLabelFinal = String(this.getQxSelenium().getRunInContext(this.locators.feedTreeItemStaticFeeds, labelScript));
      this.assertNotEquals(staticLabelFinal, staticLabelInitial);
    }
  }
});