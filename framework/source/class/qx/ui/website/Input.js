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
 * @require(qx.module.TextSelection)
 *
 * @group (Widget)
 */
qx.Bootstrap.define("qx.ui.website.Input", {
  extend : qx.ui.website.Widget,


  construct : function(selector, context) {
     this.base(arguments, selector, context);
  },


  members : {
    // used for webkit only
    __selectable : null,
    __enabled : null,


    /**
     * Set the input element enabled / disabled.
     * Webkit needs a special treatment because the set color of the input
     * field changes automatically. Therefore, we use
     * <code>-webkit-user-modify: read-only</code> and
     * <code>-webkit-user-select: none</code>
     * for disabling the fields in webkit. All other browsers use the disabled
     * attribute.
     *
     * @param value {Boolean} true, if the input element should be enabled.
     * @return {qx.ui.website.Input} The collection for chaining
     */
    setEnabled : function(value) {
      this.setAttribute("disabled", value===false);

      if (qxWeb.env.get("engine.name") == "webkit") {
        this.__enabled = value;

        if (!value) {
          this.setStyles({
            "userModify": "read-only",
            "userSelect": "none"
          });
        } else {
          this.setStyles({
            "userModify": null,
            "userSelect": this.__selectable ? null : "none"
          });
        }
      }

      return this;
    },


    /**
     * Set whether the element is selectable. It uses the qooxdoo attribute
     * qxSelectable with the values 'on' or 'off'.
     * In webkit, a special css property will be used and checks for the
     * enabled state.
     *
     * @param value {Boolean} True, if the element should be selectable.
     * @return {qx.ui.website.Input} The collection for chaining
     */
    setSelectable : function(value) {
      if (!this[0]) {
        return this;
      }

      var enabled = this.__enabled;
      if (qxWeb.env.get("engine.name") != "webkit") {
        enabled = true;
      } else {
        this.__selectable = value;
      }
      value = enabled && value;

      var contentElement = this.eq(0);
      contentElement.setAttribute("qxSelectable", value ? "on" : "off");
      var userSelect = qx.core.Environment.get("css.userselect");
      if (userSelect) {
        contentElement.setStyle(userSelect, value ? "text" :
          qx.core.Environment.get("css.userselect.none"));
      }

      return this;
    }
  }
});
