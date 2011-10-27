/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * @lint ignoreUndefined(simulator)
 */
qx.Class.define("mobileshowcase.simulation.Mobileshowcase", {

  extend : simulator.unit.TestCase,

  members :
  {
    /*
    ---------------------------------------------------------------------------
      TESTS
    ---------------------------------------------------------------------------
    */

    _testGeneric : function(elementToClick, newElement)
    {
      this.getQxSelenium().qxClick(elementToClick);
      this.getSimulation().wait(1000);
      var newEl = this.getQxSelenium().isElementPresent(newElement);
      this.assertNotNull(newEl, "Expected element not present after click!");
      this.getQxSelenium().qxClick("qxhv=*/[@classname=qx.ui.mobile.navigationbar.BackButton]");
      this.getSimulation().wait(1000);
    },

    testFormElements : function()
    {
      this._testGeneric('//div[text()="Form Elements"]', '//div[text()="Password: "]');
    },

    testList : function()
    {
      this._testGeneric('//div[text()="List"]', '//div[text()="Selectable Item0"]')
    },

    testTabBar : function()
    {
      this._testGeneric('//div[text()="Tab Bar"]', '//div[text()="View 1"]');
    },

    testToolbar : function()
    {
      this._testGeneric('//div[text()="Toolbar"]', '//h2[text()="Search"]');
    },

    testEvents : function()
    {
      this._testGeneric('//div[text()="Events"]', '//div[text()="Touch / Tap / Swipe this area"]');
    },

    testPageTransitions : function()
    {
      this._testGeneric('//div[text()="Page Transitions"]', '//div[text()="Slide"]');
    }
  }

});