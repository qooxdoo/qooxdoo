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
qx.Class.define("qx.tool.cli.Argument", {
  extend: qx.tool.cli.AbstractValue,

  properties: {
    type: {
      init: "string",
      refine: true
    }
  },

  members: {
    /**
     * Returns a string that can be used to in the usage output of the command
     *
     * @return {String}
     */
    usage() {
      let str = "";
      if (this.getName()) {
        str += this.getName();
        if (this.isArray()) {str += "...";}
      }

      const TYPES = {
        string: "String",
        boolean: "Boolean",
        integer: "Integer",
        float: "Float"
      };

      let type = this.getType();
      if (type) {
        if (this.isArray()) {str += " (" + TYPES[type] + "s)";}
        else {str += " (" + TYPES[type] + ")";}
      }

      if (this.getDescription()) {
        if (str.length > 0) {
          str += "  ::  " + this.getDescription();
        } else {
          str += this.getDescription();
        }
      }

      return str;
    },

    /**
     * Parses the argument
     *
     * @param {String} initialValue the initial value to parse
     * @param {Function} fnGetMore function to get more arguments
     */
    parse(initialValue, fnGetMore) {
      let type = this.getType();

      let parseNext = (arg, index) => {
        function noMatch(msg) {
          if (index == 0) {throw new Error(msg);}
          return null;
        }
        switch (type) {
          case "string":
          case null:
            return arg;

          case "boolean":
            if (arg == "true" || arg == "yes" || arg == "1") {return true;}
            if (arg == "false" || arg == "no" || arg == "0") {return false;}
            return noMatch(
              "Invalid value for " +
                this.toString() +
                ", expected nothing (true) or the words true or false"
            );

          case "integer":
            var value = parseInt(arg, 10);
            if (isNaN(value))
              {return noMatch(
                `Invalid value for ${this.toString()}, expected an integer`
              );}
            return value;

          case "float":
            var value = parseFloat(arg);
            if (isNaN(value))
              {return noMatch(
                `Invalid value for ${this.toString()}, expected a number`
              );}
            return value;
        }

        if (arg === null)
          {return noMatch(
            `Invalid value for ${this.toString()}, expected a string`
          );}
        return arg;
      };

      let argvIndex = 0;
      function next() {
        let value = fnGetMore(argvIndex++);
        if (value === null) {argvIndex--;}
        return value;
      }

      let arg = initialValue;
      if (arg && arg.indexOf) {
        let pos = arg.indexOf("=");
        if (pos > -1) {arg = arg.substring(pos + 1);}
      }
      let result = null;
      if (this.isArray()) {
        if (arg === null)
          {throw new Error(
            `Invalid value for ${this.toString()}, expected at least one value`
          );}
        result = [];
        let index = 0;
        do {
          let value = parseNext(arg, index++);
          if (value === null) {
            argvIndex--;
            break;
          }
          result.push(value);
          arg = next();
        } while (arg);
      } else {
        result = parseNext(arg, 0);
      }

      fnGetMore(argvIndex, true);
      this.setValue(result);
    }
  }
});
