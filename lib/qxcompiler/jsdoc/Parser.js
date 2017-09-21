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
require("./ParamParser");
require("./ReturnParser");

/**
 * JSDoc Parser
 */
qx.Class.define("qxcompiler.jsdoc.Parser", {
  extend: qx.core.Object,
  
  statics: {
    /**
     * Parses a JSDoc comment, returns an object where the keys are the name of the JSDoc (eg "@description")
     * and the value are an array of objects, one for each entry that was found.  The individual entries
     * consist of the name, the body of the JSDoc entry, and optional, key-specific parsed data (where supported)
     */
    parseComment: function(comment) {
      var current = { name: "@description", body: "" };
      var cmds = [ current ];
      if (typeof comment == "string")
        comment = comment.split('\n');
      comment.forEach(function(line) {
        // Strip optional leading *
        line = line.trim();
        var m = line.match(/^\*\s?(.*)$/);
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
        if (name == "@returns")
          name = "@return";
        if (name == "@throw")
          name = "@throws";
        
        // store it
        current = { name: name, body: body };
        cmds.push(current);
      });
      var result = {};
      cmds.forEach(function(cmd) {
        // If the body is surrounded by parameters, remove them
        var m = cmd.body.match(/^\s*\(([\s\S]*)\)\s*$/);
        if (m)
          cmd.body = m[1];
        cmd.body = cmd.body.trim();
        if (result[cmd.name])
          result[cmd.name].push(cmd);
        else
          result[cmd.name] = [ cmd ];
      });
      return result;
    },
    
    parseJsDoc: function(jsdoc, classname, analyser) {
      for (var key in jsdoc) {
        var parser = this.__PARSERS[key];
        if (parser) {
          jsdoc[key].forEach((pdoc) => parser.parseCommand(pdoc, classname, analyser));
        }
      }
    },
    
    __PARSERS: {
      "@param": new qxcompiler.jsdoc.ParamParser(),
      "@return": new qxcompiler.jsdoc.ReturnParser()
    }
  }
});

