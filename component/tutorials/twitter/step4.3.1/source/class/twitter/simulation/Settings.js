/**
 * @lint ignoreUndefined(simulator)
*/
qx.Class.define("twitter.simulation.Settings", {

  extend : simulator.unit.TestCase,

  members :
  {
    testChangeLanguage : function()
    {
      this.getQxSelenium().setSpeed(1000);

      // Click the Preferences button
      var preferencesButtonLocator = "qxhv=*/[@label=Preferences]";
      this.getQxSelenium().qxClick(preferencesButtonLocator);
      // Check if the Preferences window opened
      var settingsWindowLocator = "qxhv=[@classname=twitter.SettingsWindow]";
      var settingsWindowPresent = this.getQxSelenium().isElementPresent(settingsWindowLocator);
      this.assertTrue(settingsWindowPresent);

      // Click the radio button for Romanian
      var romanianLabelLocator = "qxhv=[@classname=twitter.SettingsWindow]/*/[@label=Romanian]";
      this.getQxSelenium().qxClick(romanianLabelLocator);
      // Click the window's close button
      var windowCloseButtonLocator = "qxhv=[@classname=twitter.SettingsWindow]/qx.ui.container.Composite/[@icon=close\.gif]";
      this.getQxSelenium().qxClick(windowCloseButtonLocator);
      // Check if the window was closed
      settingsWindowPresent = this.getQxSelenium().isElementPresent(settingsWindowLocator);
      this.assertFalse(settingsWindowPresent);

      // Get the translated string for the Preferences button label
      var translatedLabel = this.getQxSelenium().getRunInContext(preferencesButtonLocator,
      "return this.getLabel().translate().toString()");
      // Check if the label was translated
      this.assertEquals("Preferinte", translatedLabel);
    }
  }
});