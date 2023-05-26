/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Requests web fonts via {@link qx.bom.webfonts.WebFontLoader} and fires events
 * when their loading status is known.
 */
qx.Class.define("qx.bom.webfonts.WebFont", {
  extend: qx.bom.Font,

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties: {
    /**
     * Indicates that the font has loaded successfully
     */
    valid: {
      init: false,
      check: "Boolean",
      event: "changeValid",
      apply: "__applyValid"
    }
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    /**
     * Fired when the status of a web font has been determined. The event data
     * is a map with the keys "family" (the font-family name) and "valid"
     * (Boolean).
     */
    changeStatus: "qx.event.type.Data"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __families: null,
    __allValidPromise: null,

    toString() {
      let fontWeight = this.isBold() ? "bold" : "normal";
      if (this.getWeight() !== null) {
        fontWeight = this.getWeight();
      }
      let fontStyle = this.isItalic() ? "italic" : "normal";
      return (
        this.getFamily().join(",") +
        "[" +
        fontWeight +
        "::" +
        fontStyle +
        "] " +
        this.toHashCode()
      );
    },

    /**
     * @override
     */
    loadComplete() {
      let promises = [];
      for (let fontFamily of this.getFamily()) {
        let loader = qx.bom.webfonts.WebFontLoader.getLoader(fontFamily);
        if (loader) {
          let fontWeight = this.isBold() ? "bold" : "normal";
          if (this.getWeight() !== null) {
            fontWeight = this.getWeight();
          }
          let fontStyle = this.isItalic() ? "italic" : "normal";

          let validator = loader.getValidator(fontWeight, fontStyle);
          promises.push(validator.isValid());
        }
      }
      this.__allValidPromise = qx.Promise.all(promises).then(results => {
        if (results.length == 0 || results.indexOf(true) > -1) {
          this.setValid(true);
        } else {
          this.setValid(false);
        }
      });
    },

    async checkValid() {
      await this.__allValidPromise;
    },

    __applyValid(value) {
      this.fireDataEvent("changeStatus", {
        family: this.getFamily(),
        valid: value
      });
    }
  },

  statics: {
    /**
     * Timeout (in ms) to wait before deciding that a web font was not loaded.
     */
    VALIDATION_TIMEOUT: 5000
  }
});
