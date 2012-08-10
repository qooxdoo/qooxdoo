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
 * Interactions for text field widgets
 */
qx.Class.define("simulator.qxwebdriver.interaction.form.AbstractField", {

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
        return contentEl.sendKeys(value);
      });
    }
  },

  defer : function(statics)
  {
    simulator.qxwebdriver.Interaction.register("qx.ui.form.AbstractField",
      "type", statics.type);
  }
});