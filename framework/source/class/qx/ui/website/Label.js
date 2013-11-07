/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)
     * Daniel Wagner (danielwagner)

************************************************************************ */
/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Label", {
  extend : qx.ui.website.Widget,


  construct : function(selector, context) {
     this.base(arguments, selector, context);
  },


  members : {

    /**
     * Sets the label's text wrapping behavior
     *
     * @param value {Boolean} <code>true</code> if the label's text should
     * wrap if too long
     * @return {qxWeb} The collection for chaining
     */
    setWrap : function(value) {
      // apply the white space style to the label to force it not
      // to wrap if wrap is set to false [BUG #3732]
      var whiteSpace = value ? "normal" : "nowrap";
      this.setStyle("whiteSpace", whiteSpace);

      return this;
    },


    /**
     * Returns the label's text wrapping behavior
     *
     * @return {Boolean} <code>true</code> if the label's text will wrap
     */
    getWrap : function() {
      var whiteSpace = this.getStyle("whiteSpace");
      return whiteSpace == "normal";
    },


    /**
     * Sets the label's text
     *
     * @param value {String} label text
     * @return {qxWeb} The collection for chaining
     */
    setValue : function(value) {
      if (value === null) {
        value = "";
      }

      this.setHtml(value);
      return this;
    },


    /**
     * Returns the label's text
     *
     * @return {String} label text
     */
    getValue : function() {
      return this.getHtml();
    }
  }
});
