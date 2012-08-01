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
     * @param String {value} The characters to type
     * @return {webdriver.Promise} A promise that will be resolved when typing
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
  }
});