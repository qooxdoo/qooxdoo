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
 * Interactions for form widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.Form", {

  statics :
  {

    /**
     * Simulates typing in a widget that uses an HTML text input
     * or text area as its DOM element, e.g. {@link qx.ui.form.AbstractField}
     * @param value {String} Characters to type
     * @return {webdriver.Promise} A promise that will be resolved when typing
     * is finished
     */
    type : function(value)
    {
      var getDomElement = "return qx.ui.core.Widget.getWidgetByElement(arguments[0])" +
        ".getContentElement().getDomElement()";
      return this.driver_.executeScript(getDomElement, this)
      .then(function(contentEl) {
        contentEl.sendKeys(value);
      });
    },


    /**
     * Selects an entry from a {@link qx.ui.form.SelectBox}.
     * @param itemLocator {webdriver.Locator} Locator strategy to find the
     * target list item
     * @return {webdriver.Promise} A promise that will be resolved when the
     * target item is selected
     */
    selectSelectBoxItem : function(itemLocator)
    {
      this.click();
      var menu = null;
      var waitForElement = function() {
        try {
          //TODO: Make sure we've got the right popup
          menu = this.findElement(simulator.webdriver.By.xpath('//div[@qxclass="qx.ui.popup.Popup"]'));
          return menu !== null;
        }
        catch(ex) {
          return false;
        }
      };

      return this.driver_.wait(waitForElement.bind(this), 500)
      .then(function() {
        return menu.findElement(itemLocator)
        .then(function(element) {
          return element.click();
        }, function(e) {
          e.message = "Couldn't find menu child of SelectBox! " + e.message;
          throw e;
        });
      });
    },


    /**
     * Selects an entry from the drop-down list of a {@link qx.ui.form.ComboBox}.
     * @param itemLocator {webdriver.Locator} Locator strategy to find the
     * target list item
     * @return {webdriver.Promise} A promise that will be resolved when the
     * target item is selected
     */
    selectComboBoxItem : function(itemLocator)
    {
      var getButton = "return qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildControl('button').getContentElement().getDomElement()";

      var menu = null;
      var waitForElement = function() {
        try {
          //TODO: Make sure we've got the right popup
          menu = this.findElement(simulator.webdriver.By.xpath('//div[@qxclass="qx.ui.popup.Popup"]'));
          return menu !== null;
        }
        catch(ex) {
          return false;
        }
      };

      var driver = this._driver;
      return this.driver_.executeScript(getButton)
      .then(function(button) {
        return button.click()
        .then(function() {
          return this.driver_.wait(waitForElement.bind(this), 500)
          .then(function() {
            return menu.findElement(itemLocator)
            .then(function(menuItem) {
              return menuItem.click();
            });
          });
        }.bind(this));
      }.bind(this));
    },


    /**
     * Get the label values from the list items in a {@link qx.ui.form.SelectBox}
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array of item labels
     */
    getSelectBoxListItemLabels : function()
    {
      var script = "var labels = []; qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getSelectables().forEach(function(item) { labels.push(item.getLabel()) });" +
        "return labels;";
      return this.driver_.executeScript(script)
      .then(function(value) {
        return value;
      });
    },


    /**
     * Get the label values from the list items in a {@link qx.ui.form.ComboBox}
     * @return {webdriver.promise.Promise} A promise that will be resolved with
     * an Array of item labels
     */
    getComboBoxListItemLabels : function()
    {
      var script = "var labels = []; qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildren().forEach(function(item) { labels.push(item.getLabel()) });" +
        "return labels;";
      return this.driver_.executeScript(script)
      .then(function(value) {
        return value;
      });
    },


    /**
     * Simulates typing in the text field of a {@link qx.ui.form.ComboBox}
     * @param value {String} The characters to type
     * @return {webdriver.promise.Promise} A promise that will be resolved when typing
     * is finished
     */
    typeInComboBox : function(value)
    {
      var getTextField = "return qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildControl('textfield').getContentElement().getDomElement()";

      return this.driver_.executeScript(getTextField)
      .then(function(textField) {
        textField.sendKeys(value);
      });
    },


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
    },


    /**
     * Clicks the calendar button of a {@link qx.ui.form.DateField}
     * @return {webdriver.promise.Promise} A promise that will be resolved
     * when the DateChooser has opened
     */
    clickDateFieldCalendarButton : function()
    {
      var getButton = "return qx.core.ObjectRegistry.fromHashCode('" + this.qxHash + "')" +
        ".getChildControl('button').getContentElement().getDomElement()";

      var menu = null;
      var waitForElement = function() {
        try {
          menu = this.findElement(simulator.webdriver.By.xpath('//div[@qxclass="qx.ui.popup.Popup"]'));
          return menu !== null;
        }
        catch(ex) {
          return false;
        }
      };

      return this.driver_.executeScript(getButton)
      .then(function(button) {
        button.click();
        return this.driver_.wait(waitForElement.bind(this), 1500);
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
    clickDateFieldNextYearButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.Form._clickDateChooserButton.bind(this);
      return boundHelper("next-year-button");
    },


    /**
     * Clicks the "next month" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickDateFieldNextMonthButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.Form._clickDateChooserButton.bind(this);
      return boundHelper("next-month-button");
    },


    /**
     * Clicks the "last year" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickDateFieldLastYearButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.Form._clickDateChooserButton.bind(this);
      return boundHelper("last-year-button");
    },


    /**
     * Clicks the "last month" button in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the button has been clicked
     */
    clickDateFieldLastMonthButton : function()
    {
      var boundHelper = simulator.qxwebdriver.interaction.Form._clickDateChooserButton.bind(this);
      return boundHelper("last-month-button");
    },


    /**
     * Clicks a week day in a {@link qx.ui.form.DateField}'s
     * {@link qx.ui.form.DateChooser}.
     * @param day {Integer} The day entry to click
     * @return {webdriver.promise.Promise} A promise that will be resolved when
     * the day entry has been clicked
     */
    clickDateFieldDay : function(day)
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
    simulator.qxwebdriver.Interaction.register("qx.ui.form.AbstractField",
      "type", statics.type);

    simulator.qxwebdriver.Interaction.register("qx.ui.form.SelectBox",
      "selectItem", statics.selectSelectBoxItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.SelectBox",
      "getListItemLabels", statics.getSelectBoxListItemLabels);

    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "selectItem", statics.selectComboBoxItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "getListItemLabels", statics.getComboBoxListItemLabels);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.ComboBox",
      "type", statics.typeInComboBox);

    simulator.qxwebdriver.Interaction.register("qx.ui.form.VirtualComboBox",
      "selectItem", statics.selectComboBoxItem);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.VirtualComboBox",
      "getListItemLabels", statics.getModelItemLabels);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.VirtualComboBox",
      "type", statics.typeInComboBox);

    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickCalendarButton", statics.clickDateFieldCalendarButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickNextYearButton", statics.clickDateFieldNextYearButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickNextMonthButton", statics.clickDateFieldNextMonthButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickLastYearButton", statics.clickDateFieldLastYearButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickLastMonthButton", statics.clickDateFieldLastMonthButton);
    simulator.qxwebdriver.Interaction.register("qx.ui.form.DateField",
      "clickDay", statics.clickDateFieldDay);
  }
});