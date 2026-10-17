qx.Class.define("qx.tool.utils.BabelHelpers", {
  extend: qx.core.Object,

  statics: {
    /**
     * Helper method that collapses the MemberExpression into a string
     * @param node
     * @returns {string}
     */
    collapseMemberExpression(node) {
      const types = require("@babel/types");

      var done = false;
      function doCollapse(node) {
        if (node.type == "ThisExpression") {
          return "this";
        }
        if (node.type == "Identifier") {
          return node.name;
        }
        if (node.type == "RestElement") {
          return "..." + doCollapse(node.argument);
        }
        if (node.type == "ArrayExpression") {
          var result = [];
          node.elements.forEach(element => result.push(doCollapse(element)));
          return result;
        }
        if (node.type === "StringLiteral") {
          return node.value;
        }
        if (node.type != "MemberExpression") {
          return "(" + node.type + ")";
        }
        if (types.isIdentifier(node.object)) {
          let str = node.object.name;
          if (node.property.name) {
            str += "." + node.property.name;
          } else {
            done = true;
          }
          return str;
        }
        var str;
        if (node.object.type == "ArrayExpression") {
          str = "[]";
        } else {
          str = doCollapse(node.object);
        }
        if (done) {
          return str;
        }
        // `computed` is set if the expression is a subscript, eg `abc[def]`
        if (node.computed) {
          done = true;
        } else if (node.property.name) {
          str += "." + node.property.name;
        } else {
          done = true;
        }
        return str;
      }

      return doCollapse(node);
    },

    /**
     * Helper method that collapses the MemberExpression into a string
     * @param param
     * @param {number} idx
     * @returns {string}
     */
    collapseParam(param, idx) {
      switch (param.type) {
        case "Identifier":
          return param.name;

        case "AssignmentPattern":
          return qx.tool.utils.BabelHelpers.collapseParam(param.left, idx);

        case "RestElement":
          return (
            "..." +
            qx.tool.utils.BabelHelpers.collapseParam(param.argument, idx)
          );

        case "ObjectPattern":
        case "ArrayPattern":
          return `arg${idx}`;
      }

      throw new Error(
        `collapseParam: ${param.type} not useable as a parameter`
      );
    },
    

    /**
     * Extracts and parses JSDoc
     *
     * @param {*} comment
     * @returns
     */
    getJsDoc(comment) {
      if (!comment) {
        return null;
      }
      if (qx.lang.Type.isArray(comment)) {
        comment = comment.slice(-1)[0];
      }
      const result = {
        raw: comment.value?.split("\n")
      };

      const tmp = qx.tool.compiler.jsdoc.Parser.parseComment(comment.value);
      for (const key in tmp) {
        result[key] = tmp[key];
      }

      return result;
    }
  }
});
