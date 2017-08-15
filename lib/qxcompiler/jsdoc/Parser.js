/* ************************************************************************
 *
 *    qxcompiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qxcompiler
 *
 *    Copyright:
 *      2011-2017 Zenesis Limited, http://www.zenesis.com
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
 * ************************************************************************/

var qx = require("qooxdoo");

/**
 * JSDoc Parser
 */
qx.Class.define("qxcompiler.jsdoc.Parser", {
  extend: qx.core.Object,
  
  statics: {
    parseComment: function(comment) {
      var current = { name: "@description", body: "" };
      var cmds = [ current ];
      if (typeof comment == "string")
        comment = comment.split('\n');
      comment.forEach(function(line) {
        
        // Strip optional leading *
        var m = line.match(/^\s*\*\s?(.*)$/);
        if (m)
          line = m[1];
        line = line.trim();
        
        // Look for command at the begining of the line
        m = line.match(/^(\@[a-zA-Z0-9_]+)(.*)$/);
        if (!m) {
          if (current.body.length)
            current.body += "\n";
          current.body += line;
          return;
        }
        
        var name = m[1];
        var body = m[2];
        
        // Patch common command names
        if (name == "returns")
          name = "return";
        if (name == "throw")
          name = "throws";
        
        // store it
        current = { name: name, body: body };
        cmds.push(current);
      });
      cmds.forEach(function(cmd) {
        // If the body is surrounded by parameters, remove them
        var m = cmd.body.match(/^\s*\(([\s\S]*)\)\s*$/);
        if (m)
          cmd.body = m[1];
        cmd.body = cmd.body.trim();
      });
      return cmds;
    }
  }
});

