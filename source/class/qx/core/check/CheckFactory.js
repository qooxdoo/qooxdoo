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
 *
 * NOTE :: The default checks are initialised only on demand - this is not a
 * performance requirement, but rather to manage the dependency of classes during
 * the early stages of loading an application.
 *
 * @require(qx.core.check.DynamicTypeCheck)
 */
qx.Bootstrap.define("qx.core.check.CheckFactory", {
  extend: Object,
  type: "singleton",

  construct() {
    super();
    this.__checks = {};
    this.addCheck("any", new qx.core.check.Any());
    this.addCheck("any?", new qx.core.check.Any(true));
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
    getCheck(expr, nullable) {
      nullable = !!nullable;
      if (typeof expr == "function") {
        return new qx.core.check.SimpleCheck(expr, false);
      }
      if (qx.lang.Type.isArray(expr)) {
        for (let i = 0; i < expr.length; i++) {
          if (expr[i] === null) {
            nullable = true;
            qx.lang.Array.removeAt(expr, i);
            break;
          }
        }
        return new qx.core.check.IsOneOfCheck(expr, nullable);
      }

      let checkname = expr;
      if (checkname.endsWith("?")) {
        checkname = checkname.substring(0, checkname.length - 1);
        nullable = true;
      }
      if (nullable) {
        expr = checkname + "?";
      }

      let check = this.__checks[expr];
      if (check) {
        return check;
      }

      let clazz = qx.core.check.CheckFactory.__STANDARD_CHECKS[checkname];
      if (clazz) {
        check = new clazz(nullable);
        if (check.isNullable() === null) {
          debugger;
          check = new clazz(nullable);
        }
        this.__checks[expr] = check;
        return check;
      }

      if (checkname.indexOf("(") > 0) {
        check = new qx.core.check.SimpleCheck(new Function("value", "return " + checkname), nullable);
      } else {
        check = new qx.core.check.DynamicTypeCheck(checkname, nullable);
      }
      if (check) {
        this.__checks[expr] = check;
        return check;
      }

      return null;
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
  },

  statics: {
    __STANDARD_CHECKS: {
      Boolean: qx.core.check.standard.BooleanCheck,
      String: qx.core.check.standard.StringCheck,
      Number: qx.core.check.standard.NumberCheck,
      Integer: qx.core.check.standard.IntegerCheck,
      PositiveNumber: qx.core.check.standard.PositiveNumberCheck,
      PositiveInteger: qx.core.check.standard.PositiveIntegerCheck,
      Error: qx.core.check.standard.ErrorCheck,
      RegExp: qx.core.check.standard.RegExpCheck,
      Object: qx.core.check.standard.ObjectCheck,
      Array: qx.core.check.standard.ArrayCheck,
      Map: qx.core.check.standard.MapCheck,
      Function: qx.core.check.standard.FunctionCheck,
      Date: qx.core.check.standard.DateCheck,
      Node: qx.core.check.standard.NodeCheck,
      Element: qx.core.check.standard.ElementCheck,
      Document: qx.core.check.standard.DocumentCheck,
      Window: qx.core.check.standard.WindowCheck,
      Event: qx.core.check.standard.EventCheck,
      Class: qx.core.check.standard.ClassCheck,
      Mixin: qx.core.check.standard.MixinCheck,
      Interface: qx.core.check.standard.InterfaceCheck,
      Theme: qx.core.check.standard.ThemeCheck,
      Color: qx.core.check.standard.ColorCheck,
      Decorator: qx.core.check.standard.DecoratorCheck,
      Font: qx.core.check.standard.FontCheck
    }
  }
});
