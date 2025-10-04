const { assertAccessor } = require("@babel/types");

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2019-2022 Zenesis Ltd, https://www.zenesis.com

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com, @johnspackman)
     * Henner Kollmann (Henner.Kollmann@gmx.de, @hkollmann)

************************************************************************ */
qx.Class.define("qx.tool.cli.AbstractValue", {
  type: "abstract",
  extend: qx.core.Object,

  construct(name) {
    super();
    if (this.constructor === qx.tool.cli.AbstractValue) {
      throw new Error("The class 'qx.tool.cli.AbstractValue' is abstract! It is not possible to instantiate it.");
    }
    if (name) {this.setName(name);}
  },

  properties: {
    /** Name of the flag or argument */
    name: {
      init: null,
      nullable: true,
      check: "String",
      transform: "__transformName"
    },
    /** Short alternative */
    shortCode: {
      init: null,
      nullable: true,
      check: "String"
    },
    /** Description, used in the usage statement */
    description: {
      init: null,
      nullable: true,
      check: "String"
    },

    /** Data type  */
    type: {
      init: null,
      nullable: true,
      check: value => {
        if (qx.core.Environment.get("qx.debug")) {
          if (!qx.lang.Type.isArray(value)) {
            qx.core.Assert.assertInArray(value, [
              "string",
              "boolean",
              "integer",
              "float"
            ]);
          }
        }
        return true;
      },
      apply: "_applyType"
    },

    /** check function */
    check: {
      init: null,
      nullable: true,
      check: "Function"
    },

    /** Whether this is an array */
    array: {
      init: false,
      check: "Boolean"
    },

    /** Whether this must be provided */
    required: {
      init: false,
      check: "Boolean"
    },

    /** The parsed value */
    value: {
      init: null,
      nullable: true,
      apply: "_applyValue"
    }
  },

  members: {
    /** @type{String[]?} list of error messages */
    __errors: null,

    _applyType(value, old) {
    },

    _applyValue(value, old) {
      // Validate the value using the check function if available
      let checkFn = this.getCheck();
      if (checkFn && !checkFn(value)) {
        throw new Error(`Invalid value: ${value}`);
      }
    },

    /**
     * Transform for `name`
     */
    __transformName(value) {
      // Convert underscores to hyphens first, then apply camelCase
      let normalized = value.replace(/_/g, '-');
      return qx.lang.String.camelCase(normalized);
    },

    /**
     * Adds an error message
     *
     * @param {String} msg
     */
    _error(msg) {
      if (!this.__errors) {this.__errors = [];}
      this.__errors.push(msg);
    },

    /**
     * Returns list of error messages
     *
     * @return {String[]?} error messages or null if no errors
     */
    getErrors() {
      return this.__errors;
    },

    /**
     * Returns the hyphenated version of the `name` property (which is always held as camelCase)
     *
     * @returns {String}
     */
    getHyphenatedName() {
      return qx.lang.String.hyphenate(this.getName());
    },

    /**
     * Tests whether this matches the string (name or short code)
     *
     * @param {String} arg
     * @returns {Boolean}
     */
    is(arg) {
      let pos = arg.indexOf("=");
      if (pos > -1) {arg = arg.substring(0, pos);}
      if (arg.startsWith("--")) {
        let tmp = qx.lang.String.camelCase(arg.substring(2));
        return tmp == this.getName();
      } else if (arg.startsWith("-")) {
        return arg.substring(1) == this.getShortCode();
      }

      return false;
    },

    toString() {
      return this.getName() || this.getDescription() || this.classname;
    },

    /**
     * Parses the value
     *
     * @param {String} cmdName the command name
     * @param {Function} fnGetMore function to get more arguments
     */
    parse(cmdName, fnGetMore) {
      throw new Error(`No such implementation for ${this.classname}`);
    }
  }
});
