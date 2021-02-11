/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2019 Zenesis Limited, http://www.zenesis.com
 *
 *    License:
 *      MIT: https://opensource.org/licenses/MIT
 *
 *      This software is provided under the same licensing terms as Qooxdoo,
 *      please see the LICENSE file in the Qooxdoo project's top-level directory
 *      for details.
 *
 *    Authors:
 *      * John Spackman (john.spackman@zenesis.com, @johnspackman)
 *
 * *********************************************************************** */

/**
 * Writer for serialising JSON, automatically indenting as required
 */
qx.Class.define("qx.tool.utils.json.Writer", {
  extend: qx.core.Object,
  
  construct: function() {
    this.base(arguments);
    this.buffer = "";
    this.__indent = 0;
    this.__indentStr = "";
    this.__currentLine = 0;
  },
  
  members: {
    /**
     * Writes a string/number.  Multiple lines are rewritten with indentation at the
     * start of each line
     */
    write(str) {
      if (str === null) {
        str = "null"; 
      } else if (str === undefined) {
        str = "undefined"; 
      } else if (typeof str === "number") {
        str = str.toString(); 
      } else if (typeof str === "boolean") {
        str = str ? "true" : "false"; 
      } else if (typeof str !== "string") {
        throw new Error("Can only write strings and numbers"); 
      }

      var startPos = 0;
      /* eslint-disable no-constant-condition */
      while (true) {
        var pos = str.indexOf("\n", startPos);
        if (pos > -1) {
          this.buffer += str.substring(startPos, pos + 1);
          this.__currentLine = this.buffer.length;
          this.buffer += this.__indentStr;
          startPos = pos + 1;
        } else {
          this.buffer += str.substring(startPos);
          break;
        }
      }

      return this;
    },

    /**
     * Outputs comments
     */
    comments(comments) {
      var t = this;
      if (comments) {
        comments.forEach(function(comment) {
          t.write(comment.source + "\n");
        });
      }
    },

    /**
     * Increases or decreases the indentation level (one indent is two spaces)
     * 
     * @param count {Number} number to increase/decrease by
     */
    indent(count) {
      if (this.__indent + count < 0) {
        throw new Error("Unbalanced indent"); 
      }
      this.__indent += count;
      
      var indentStr = this.__indentStr;
      if (count > 0) {
        var str = "";
        for (var i = 0; i < count; i++) {
          str += "  "; 
        }
        indentStr += str;
      } else {
        indentStr = indentStr.substring(0, indentStr.length + (count * 2));
      }
      var line = this.buffer.substring(this.__currentLine);
      if (!line.match(/[^\s]/)) {
        this.buffer = this.buffer.substring(0, this.__currentLine) + indentStr;
      }
      this.__indentStr = indentStr;

      return this;
    },
    
    /**
     * Detects the current indentation level in the output, which has been added manually,
     * ie outside of the `indent()` method.  When outputting an AST via `reprint()`, whitespace
     * is copied too, this allows the code to adopt whatever indentation level has been
     * output by the AST so that injecting `prettyPrint()`-ed new objects are at the same\
     * level.
     * 
     * The old indent is returned, and should be passed to `resetIndent()` to restore the
     * previous value.
     * 
     * @return {Object} previous indentation
     */
    matchIndent() {
      var line = this.buffer.substring(this.__currentLine);
      var m = line.match(/^([\s]*)/);
      var indent = m[0];
      var oldIndent = this.__indentStr;
      this.__indentStr = indent;
      return oldIndent;
    },
    
    /**
     * Restores the previous indentation settings prior to `matchIndent()`
     * 
     * @param indent {Object} previous indentation settings
     */
    resetIndent(indent) {
      this.__indentStr = indent;
    }
    
  }
});
