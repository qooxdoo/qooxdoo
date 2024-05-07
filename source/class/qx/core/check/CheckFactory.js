/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2023-24 Zenesis Limited (https://www.zenesis.com)

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (github.com/johnspackman)

************************************************************************ */

/**
 * Provider of checks for property values, cached by expression
 */
qx.Bootstrap.define("qx.core.check.CheckFactory", {
  extend: Object,
  type: "singleton",

  /**
   * prettier-ignore
   */
  construct() {
    super();
    this.__checks = {};
    const CHECKS = {
      Boolean: "qx.core.Assert.assertBoolean(value, msg) || true",
      String: "qx.core.Assert.assertString(value, msg) || true",

      Number: "qx.core.Assert.assertNumber(value, msg) || true",
      Integer: "qx.core.Assert.assertInteger(value, msg) || true",
      PositiveNumber: "qx.core.Assert.assertPositiveNumber(value, msg) || true",
      PositiveInteger:
        "qx.core.Assert.assertPositiveInteger(value, msg) || true",

      Error: "qx.core.Assert.assertInstance(value, Error, msg) || true",
      RegExp: "qx.core.Assert.assertInstance(value, RegExp, msg) || true",

      Object: "qx.core.Assert.assertObject(value, msg) || true",
      Array: "qx.core.Assert.assertArray(value, msg) || true",
      Map: "qx.core.Assert.assertMap(value, msg) || true",

      Function: "qx.core.Assert.assertFunction(value, msg) || true",
      Date: "qx.core.Assert.assertInstance(value, Date, msg) || true",
      Node: "value !== null && value.nodeType !== undefined",
      Element: "value !== null && value.nodeType === 1 && value.attributes",
      Document:
        "value !== null && value.nodeType === 9 && value.documentElement",
      Window: "value !== null && value.document",
      Event: "value !== null && value.type !== undefined",

      Class: 'value !== null && value.$$type === "Class"',
      Mixin: 'value !== null && value.$$type === "Mixin"',
      Interface: 'value !== null && value.$$type === "Interface"',
      Theme: 'value !== null && value.$$type === "Theme"',

      Color:
        "qx.lang.Type.isString(value) && qx.util.ColorUtil.isValidPropertyValue(value)",
      Decorator:
        "value !== null && qx.theme.manager.Decoration.getInstance().isValidPropertyValue(value)",
      Font: "value !== null && qx.theme.manager.Font.getInstance().isDynamic(value)"
    };

    /**
     * Contains types which need to be dereferenced
     */
    const NEEDS_DEREFERENCE = {
      Node: true,
      Element: true,
      Document: true,
      Window: true,
      Event: true
    };

    this.addCheck("any", new qx.core.check.Any());
    this.addCheck("any?", new qx.core.check.Any(true));

    for (let key in CHECKS) {
      let code = CHECKS[key];
      let needsDereference = NEEDS_DEREFERENCE[key];
      let check = new qx.core.check.SimpleCheck(
        new Function("value", code),
        false,
        needsDereference
      );
      this.addCheck(key, check);

      let hasNullCheck = key.indexOf("value !== null") > -1;
      if (!hasNullCheck) {
        let nullCheck = new qx.core.check.SimpleCheck(
          new Function("value", code),
          true,
          needsDereference
        );
        this.addCheck(key + "?", nullCheck);
      }
    }
  },

  members: {
    /** @type{Object<String,qx.core.check.ICheck} the list of known checks */
    __checks: null,

    /**
     * Gets a `qx.core.check.Check` instance that can be used to verify property value
     * compatibility; note that one will be created if it does not already exist
     *
     * @param {String} expr
     * @return {qx.core.check.Check}
     */
    getCheck(expr) {
      if (typeof expr == "function") {
        return new qx.core.check.SimpleCheck(expr, false);
      }
      let check = this.__checks[expr];
      if (check === null) {
        let nullable = false;
        let classname;
        if (expr.endsWith("?")) {
          nullable = true;
          classname = expr.substring(0, expr.length - 1);
        } else {
          classname = expr;
        }

        if (qx.Class.isDefined(classname)) {
          check = new qx.core.check.ClassInstanceCheck(
            qx.Class.getByName(classname),
            nullable
          );
        } else if (qx.Interface && qx.Interface.isDefined(classname)) {
          check = new qx.core.check.InterfaceImplementCheck(
            qx.Interface.getByName(classname),
            nullable
          );
        }
        if (check) {
          this.__checks[expr] = check;
        } else {
          return null;
        }
      }
      return check;
    },

    /**
     * Adds a check for a given expression - cannot be used to change an existing expression
     *
     * @param {String} expr the string expression to match
     * @param {qx.core.check.ICheck} check the check instance
     */
    addCheck(expr, check) {
      if (this.__checks[expr]) {
        throw new Error("Check already exists for " + expr);
      }
      this.__checks[expr] = check;
    }
  }
});
