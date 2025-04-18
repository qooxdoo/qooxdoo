/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * Mixin handling the valid and required properties for the form widgets.
 */
qx.Mixin.define("qx.ui.form.MForm", {
  construct() {
    if (qx.core.Environment.get("qx.dynlocale")) {
      this.__changeLocaleMFormListenerId = qx.locale.Manager.getInstance().addListener(
        "changeLocale",
        this.__onChangeLocale,
        this
      );
    }
  },

  properties: {
    /**
     * Flag signaling if a widget is valid. If a widget is invalid, an invalid
     * state will be set.
     */
    valid: {
      check: "Boolean",
      init: true,
      apply: "_applyValid",
      event: "changeValid"
    },

    /**
     * Flag signaling if a widget is required.
     */
    required: {
      check: "Boolean",
      init: false,
      event: "changeRequired"
    },

    /**
     * Message which will be shown in an tooltip if the widget is invalid.
     */
    invalidMessage: {
      init: null,
      nullable: true,
      check: "String",
      event: "changeInvalidMessage"
    },

    /**
     * Message which will be shown in an invalid tooltip if the {@link #required} is
     * set to true.
     */
    requiredInvalidMessage: {
      check: "String",
      nullable: true,
      event: "changeRequiredInvalidMessage"
    }
  },

  members: {
    // apply method
    _applyValid(value, old) {
      value ? this.removeState("invalid") : this.addState("invalid");
    },

    /**
     * Locale change event handler
     *
     * @signature function(e)
     * @param e {Event} the change event
     */
    __onChangeLocale: qx.core.Environment.select("qx.dynlocale", {
      true(e) {
        // invalid message
        var invalidMessage = this.getInvalidMessage();
        if (invalidMessage && invalidMessage.translate) {
          this.setInvalidMessage(invalidMessage.translate());
        }
        // required invalid message
        var requiredInvalidMessage = this.getRequiredInvalidMessage();
        if (requiredInvalidMessage && requiredInvalidMessage.translate) {
          this.setRequiredInvalidMessage(requiredInvalidMessage.translate());
        }
      },

      false: null
    })
  },

  destruct() {
    if (qx.core.Environment.get("qx.dynlocale") && this.__changeLocaleMFormListenerId) {
      qx.locale.Manager.getInstance().removeListenerById(
        this.__changeLocaleMFormListenerId
      );
    }
  }
});
