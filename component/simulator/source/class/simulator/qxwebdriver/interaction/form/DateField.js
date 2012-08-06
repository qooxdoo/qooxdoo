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
 * Interactions for {@link qx.ui.form.DateField} and derived widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.DateField", {

  statics :
  {
    /**
     * Clicks the calendar button of a {@link qx.ui.form.DateField}
     * @return {webdriver.promise.Promise} A promise that will be resolved
     * when the DateChooser has opened
     */
    clickCalendarButton : function()
    {
      var getButton = simulator.qxwebdriver.interaction.core.Widget.getChildControl;
      var findButton = simulator.qxwebdriver.Util.functionToString(getButton, {
        QXHASH : this.qxHash,
        CHILDCONTROL: 'button'
      });
      findButton= 'return (' + findButton + ')()';

      var getDateChooser = simulator.qxwebdriver.interaction.core.Widget.getChildControl;
      var findDateChooser = simulator.qxwebdriver.Util.functionToString(getDateChooser, {
        QXHASH : this.qxHash,
        CHILDCONTROL: 'popup'
      });
      findDateChooser= 'return (' + findDateChooser + ')()';

      var chooser = false;
      var waitForElement = function() {
        try {
          this.driver_.executeScript(findDateChooser, this.qxHash)
          .then(function(dateChooser) {
            chooser = dateChooser;
          });
        } catch(ex) {}

        return chooser;
      };

      return this.driver_.executeScript(findButton)
      .then(function(button) {
        return button.click()
        .then(function() {
          return this.driver_.wait(waitForElement.bind(this), 2000);
        }.bind(this));
      }.bind(this));
    },


    /**
     * Clicks a button of a {@link qx.ui.form.DateField}'s {@link qx.ui.control.DateChooser}.
     * @param childControl {String} The id of a DateChooser child control, e.g.
     * "next-year-button"
     * @return {webdriver.promise.Promise} A promise that will be resolved when the
     * button has been clicked
     */
    _clickDateChooserButton : function(childControl)
    {
      var getButton = "return qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildControl('list').getChildControl('" + childControl + "').getContentElement().getDomElement()";

      return this.driver_.executeScript(getButton)
      .then(function(button) {
        button.click();
      });
    },


    /**
     * Clicks the "next year" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickNextYearButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.form.DateField._clickDateChooserButton.bind(this);
      return boundHelper("next-year-button");
    },


    /**
     * Clicks the "next month" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickNextMonthButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.form.DateField._clickDateChooserButton.bind(this);
      return boundHelper("next-month-button");
    },


    /**
     * Clicks the "last year" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickLastYearButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.form.DateField._clickDateChooserButton.bind(this);
      return boundHelper("last-year-button");
    },


    /**
     * Clicks the "last month" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickLastMonthButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.form.DateField._clickDateChooserButton.bind(this);
      return boundHelper("last-month-button");
    },


    /**
     * Clicks a week day in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @param day {Integer} The day entry to click
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the day entry has been clicked
     */
    clickDay : function(day)
    {
      var getDayElement = function() {
        var dateField = qx.core.ObjectRegistry.fromHashCode('QXHASH');
        var dateChooser = dateField.getChildControl('list');
        var datePane = dateChooser.getChildControl('date-pane');
        var labels = datePane.getChildren();
        for (var i=0,l=labels.length; i<l; i++) {
          if (labels[i].getValue() == 'DAY') {
            return labels[i].getContentElement().getDomElement();
          }
        }
      };

      var script = simulator.qxwebdriver.Util.functionToString(getDayElement, {
        QXHASH : this.qxHash,
        DAY : day
      });
      script = 'return (' + script + ')()';

      return this.driver_.executeScript(script)
      .then(function(dayElement) {
        dayElement.click();
      });
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickCalendarButton", statics.clickCalendarButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickNextYearButton", statics.clickNextYearButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickNextMonthButton", statics.clickNextMonthButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickLastYearButton", statics.clickLastYearButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickLastMonthButton", statics.clickLastMonthButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickDay", statics.clickDay);
  }
});