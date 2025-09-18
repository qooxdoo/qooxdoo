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
qx.Class.define("qx.tool.cli.Flag", {
  extend: qx.tool.cli.AbstractValue,

  properties: {
  },

  members: {
    /**
     * Returns a string that can be used to in the usage output of the command
     *
     * @return {String}
     */
    usage() {
      let str = "--" + qx.lang.String.hyphenate(this.getName());
      if (this.getShortCode()) { str += "|-" + this.getShortCode(); }

      const TYPES = {
        string: "String",
        boolean: "Boolean",
        integer: "Integer",
        float: "Float"
      };

      let type = this.getType();
      if (this.isArray()) {
        str += " [" + (TYPES[type] || type) + "]";
      } else {
        if (type) {
          if (qx.lang.Type.isArray(type)) {
            str += " [" + type + "]";
          } else {
            str += " (" + TYPES[type] + ")";
          }
        }
      }
      str +=
        "  ::  " +
        (this.getValue() === null ? "-" : `[default: ${this.getValue()}]`);
      if (this.getDescription()) { str += "  ::  " + this.getDescription(); }
      return str;
    },

    /**
     * Parses the flag
     *
     * @param {String} cmdName the command name/flag being parsed
     * @param {Function} fnGetMore function to get more arguments
     */
    parse(cmdName, fnGetMore) {
      let initialValue = null;
      let pos = cmdName.indexOf("=");
      if (pos > -1) {
        initialValue = cmdName.substring(pos + 1);
        cmdName = cmdName.substring(0, pos);
      }

      let eatAll = false;
      let argIndex = 0;

      function getArg(index) {
        if (initialValue !== null) { return index == 0 ? initialValue : fnGetMore(index - 1); }
        return fnGetMore(index);
      }

      function next() {
        let value = getArg(argIndex++);
        if (value == "--") {
          eatAll = true;
        }
        if (!eatAll && value) {
          if (value[0] == "-") { value = null; }
        }
        if (value === null) { argIndex--; }
        return value;
      }

      let type = this.getType();

      const parseNext = (arg, pass) => {
        switch (type) {
          case "string":
          case null:
            if (arg === null) { return null; }
            return arg;

          case "boolean":
            if (arg === null) { return true; }
            if (arg == "true" || arg == "yes" || arg == "1") { return true; }
            if (arg == "false" || arg == "no" || arg == "0") { return false; }
            if (initialValue === null && pass == 0) {
              argIndex--;
              return true;
            }
            throw new Error(
              "Invalid value for " +
              this.toString() +
              ", expected nothing (true) or the words true or false"
            );

          case "integer":
            if (arg === null) {
              throw new Error(
                `Invalid value for ${this.toString()}, expected an integer`
              );
            }
            var value = parseInt(arg, 10);
            if (isNaN(arg)) {
              throw new Error(
                `Invalid value for ${this.toString()}, expected an integer`
              );
            }
            return value;

          case "float":
            if (arg === null) {
              throw new Error(
                `Invalid value for ${this.toString()}, expected a number`
              );
            }
            var value = parseFloat(arg);
            if (isNaN(arg)) {
              throw new Error(
                `Invalid value for ${this.toString()}, expected a number`
              );
            }
            return value;
        }

        // Handle enum types (array of valid values)
        if (qx.lang.Type.isArray(type)) {
          if (arg === null) {
            throw new Error(
              `Invalid value for ${this.toString()}, expected one of: ${type.join(", ")}`
            );
          }
          if (!type.includes(arg)) {
            throw new Error(
              `Invalid value for ${this.toString()}, expected one of: ${type.join(", ")}, but got: ${arg}`
            );
          }
          return arg;
        }

        if (arg === null) {
          throw new Error(
            `Invalid value for ${this.toString()}, expected a string`
          );
        }
        return arg;
      };

      let arg = next();
      let result = null;
      if (arg == "--") {
        result = parseNext(null, 0);
        this.setValue(result);
        return;
      }
      if (this.isArray()) {
        if (arg === null) {
          throw new Error(
            `Invalid value for ${this.toString()}, expected at least one value`
          );
        }
        if (initialValue !== null) {
          result = initialValue.split(",");
        } else {
          result = [];
          do {
            let value = parseNext(arg, result.length);
            result.push(value);
            arg = next();
          } while (arg);
        }
      } else {
        result = parseNext(arg, 0);
      }

      if (initialValue) { fnGetMore(argIndex - 1, true); }
      else { fnGetMore(argIndex, true); }
      this.setValue(result);
    }
  }
});
