/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * Global class which handles the single stylesheet used for qx.desktop.
 */
qx.Class.define("qx.ui.style.Stylesheet",
{
  type : "singleton",
  extend : qx.core.Object,


  construct : function() {
    this.base(arguments);
    this.__sheet = qx.bom.Stylesheet.createElement();
    this.__rules = [];
  },


  members :
  {
    __rules : null,
    __sheet : null,


    /**
     * Adds a rule to the global stylesheet.
     * @param selector {String} The CSS selector to add the rule for.
     * @param css {String} The rule's content.
     */
    addRule : function(selector, css) {
      if (this.hasRule(selector)) {
        return;
      }
      qx.bom.Stylesheet.addRule(this.__sheet, selector, css);
      this.__rules.push(selector);
    },


    /**
     * Check if a rule exists.
     * @param selector {String} The selector to check.
     * @return {Boolean} <code>true</code> if the rule exists
     */
    hasRule : function(selector) {
      return this.__rules.indexOf(selector) != -1;
    },


    /**
     * Remove the rule for the given selector.
     * @param selector {String} The selector to identify the rule.
     */
    removeRule : function(selector) {
      delete this.__rules[this.__rules.indexOf(selector)];
      qx.bom.Stylesheet.removeRule(this.__sheet, selector);
    }
  }
});