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

/* eslint-disable no-redeclare */

/**
 * Stringify 
 */
qx.Class.define("qx.tool.utils.json.Stringify", {
  extend: qx.core.Object,
  
  statics: {
    /**
     * Pretty prints an AST tree
     */
    prettyPrint(ast) {
      var writer = new qx.tool.utils.json.Writer();

      /**
       * Writes a node, used recursively
       */
      function writeNode(node) {
        switch (node.type) {
          case "object":
            writer.comments(node.leadingComments);
            writer.write("{\n").indent(+1);
            node.children.forEach(function(child, index) {
              if (index > 0) {
                writer.write(",\n"); 
              }
              writer.write("\"" + child.key.value + "\" : ");
              writeNode(child.value);
            });
            if (node.children.length) {
              writer.write("\n"); 
            }
            writer.comments(node.trailingComments);
            writer.indent(-1).write("}");
            break;

          case "array":
            writer.comments(node.leadingComments);
            writer.write("[\n").indent(+1);
            node.children.forEach(function(child, index) {
              if (index > 0) {
                writer.write(",\n"); 
              }
              writeNode(child.value);
            });
            if (node.children.length) {
              writer.write("\n"); 
            }
            writer.comments(node.trailingComments);
            writer.indent(-1).write("]\n");
            break;

          case "property":
            writeNode(node.key);
            writer.write(" : ");
            writeNode(node.value);
            break;

          case "identifier":
            writer.write("\"" + node.value + "\"");
            break;

          case "literal":
            writer.comments(node.leadingComments);
            writer.write(node.rawValue);
            writer.comments(node.trailingComments);
            break;

          default:
            throw new Error("Unexpected node type '" + node.type + "'");
        }
      }

      writeNode(ast);

      return writer.buffer;
    },

    /**
     * Prints an object out, using the AST to preserve formatting and whitespace 
     * (and include comments) wherever possible.  Any parts of the object which
     * do not have a corresponding AST tree will be pretty printed  
     * 
     * This is only really suitable for amendments to the object graph because
     * preserving formatting & comments relies on a 1:1 comparison between the
     * AST and the object.  This means that if you move a subset of an object to 
     * another part of the object graph, it will be seen as a deletion of one
     * subset and a brand new subset - you will loose all comments as well as 
     * layout. 
     * 
     * @param object {Object}
     * @param ast {Tokenizer}
     * @return {String}
     */
    reprint(object, ast) {
      var writer = new qx.tool.utils.json.Writer();
      
      if (!ast) {
        prettyPojo(object);
        return writer.buffer;
      }
      var tokenizer = ast.tokenizer;

      /*
       * Pretty prints any old POJO or native value
       */
      function prettyPojo(obj) {
        if (typeof obj == "string") {
          writer.write("\"" + obj + "\""); 
        } else if (typeof obj == "number") {
          writer.write(obj); 
        } else if (typeof obj == "boolean") {
          writer.write(obj ? "true" : "false"); 
        } else if (qx.lang.Type.isArray(obj)) {
          writer.write("[ ");
          obj.forEach(function(elem, index) {
            if (index != 0) {
              writer.write(", "); 
            }
            prettyPojo(elem);
          });
          writer.write(" ]");
        } else {
          var first = true;
          var oldIndent = writer.matchIndent();
          writer.write("{\n").indent(+1);
          for (var name in obj) {
            if (!first) {
              writer.write(",\n"); 
            }
            writer.write("\"" + name + "\": ");
            prettyPojo(obj[name]);
            first = false;
          }
          writer.write("\n").indent(-1).write("}");
          writer.resetIndent(oldIndent);
        }
      }

      /*
       * Pretty prints a key:value pair
       */
      function prettyPojoProperty(key, value) {
        writer.write("\"" + key + "\": ");
        prettyPojo(value);
      }

      /*
       * Writes tokens which underly the AST, up to a given index
       */
      var startTokenIndex = 0;
      function writeTokensUntil(index) {
        if (startTokenIndex > -1) {
          while (startTokenIndex < index) {
            var token = tokenizer.tokens[startTokenIndex];
            writer.write(token.rawValue||token.value);
            startTokenIndex++;
          }
        }
      }

      /*
       * Writes an object, comparing it with the AST node.  Used recursively 
       */
      function writeNode(object, node) {
        /*
         * Pretty prints a node to the writer
         */
        function pretty(node) {
          var str = qx.tool.utils.json.Stringify.prettyPrint(node);
          writer.write(str);
          startTokenIndex = -1;
        }

        /*
         * Calculates the largest endToken
         * 
         * @param endToken {Number} current largest endToken, or -1 for none
         * @param node {AST Node}
         */
        function maxEndToken(endToken, node) {
          var index;
          if (node.endToken !== undefined) {
            index = node.endToken; 
          } else if (node.startToken !== undefined) {
            index = node.startToken; 
          } else {
            return endToken; 
          }
          if (endToken > index) {
            return endToken; 
          }
          return index;
        }

        // No startToken?  Then it was not parsed, pretty print it
        if (node.startToken === undefined) {
          pretty(node);
          return;
        }

        switch (node.type) {
          case "object":
          // If it's not the correct type, then pretty print
            if (!qx.tool.utils.json.Stringify.isPlainObject(object)) {
              prettyPojo(object);
              return;
            }

            // Create lookups
            var childAstLookup = {};
            node.children.forEach(function(child, index) {
              childAstLookup[child.key.value] = child;
            });
            var childPropertyLookup = {};
            for (var name in object) {
              childPropertyLookup[name] = object[name]; 
            }

            // Opening brace
            writeTokensUntil(node.startToken + 1);

            // Output known children first
            var endToken = -1;
            var first = true;
            for (var i = 0; i < node.children.length; i++) {
              var child = node.children[i];
              var key = child.key.value;
              var value = object[key];
            
              // Deleted a child?
              if (value === undefined) {
                writeTokensUntil(child.key.startToken);
                startTokenIndex = child.value.endToken + 1;
                if (first && i < node.children.length - 1) {
                  while (tokenizer.tokens[startTokenIndex].type != qx.tool.utils.json.Tokenizer.tokenTypes.COMMA) {
                    startTokenIndex++; 
                  }
                  startTokenIndex++;
                }
                continue;
              }
            
              first = false;
              endToken = maxEndToken(endToken, child.value);
            
              // Write existing property
              writeTokensUntil(child.value.startToken);
              writeNode(value, child.value);
              delete childPropertyLookup[key];
            }
          
            // Added properties
            var first = node.children.length === 0;
            var oldIndent = writer.matchIndent();
            for (var name in childPropertyLookup) {
              if (!first) {
                writer.write(",\n");
                first = false;
              }
              prettyPojoProperty(name, childPropertyLookup[name]);
            }
          
            // Unindent and output the closing brace
            writer.resetIndent(oldIndent);
            if (endToken === -1) {
              startTokenIndex = node.endToken; 
            } else {
              startTokenIndex = endToken + 1; 
            }
            writeTokensUntil(node.endToken + 1);
            break;

          case "array":
            if (!qx.lang.Type.isArray(object)) {
              prettyPojo(object);
              return;
            }
          
            // Opening brace
            writeTokensUntil(node.startToken + 1);

            for (var i = 0; i < object.length; i++) {
              var child = i < node.children.length ? node.children[i] : undefined;
              if (child !== undefined) {
                writeTokensUntil(child.startToken);
                writeNode(object[i], child);
                startTokenIndex = child.endToken + 1;
              } else {
                var oldIndent = writer.matchIndent();
                if (i != 0) {
                  writer.write(",\n"); 
                }
                prettyPojo(object[i]);
                writer.resetIndent(oldIndent);
              //startTokenIndex = node.endToken;
              }
            }
          
            // Closing brace
            writeTokensUntil(node.endToken + 1);
            break;

          case "property":
            break;

          case "literal":
          // Check type
            if (!qx.tool.utils.json.Stringify.isLiteral(object)) {
              prettyPojo(object);
              startTokenIndex = node.endToken + 1;
              return;
            }
          
            // If it has not changed, then use the AST
            if (qx.tool.utils.json.Stringify.isSameLiteral(node, object)) {
              writeTokensUntil(node.startToken + 1);
          
              // New value, but try and preserve prefix comment & whitespace
            } else {
              writeTokensUntil(node.startToken);
              if (typeof object === "string") {
                writer.write("\"" + object + "\""); 
              } else {
                writer.write(object); 
              }
              startTokenIndex = node.startToken + 1;
            }
            break;

          default:
            throw new Error("Unexpected node type '" + node.type + "'");
        }
      }

      // Go
      writeNode(object, ast);

      // Append any whitespace or comments which trail the JSON
      if (startTokenIndex > -1) {
        while (startTokenIndex < tokenizer.tokens.length) {
          var token = tokenizer.tokens[startTokenIndex++];
          if (token.type != qx.tool.utils.json.Tokenizer.tokenTypes.COMMENT && token.type != qx.tool.utils.json.Tokenizer.tokenTypes.WHITESPACE) {
            break; 
          }
          writer.write(token.rawValue||token.value);
        }
      }

      return writer.buffer;
    },

    /**
     * Converts an AST into an ordinary POJO 
     */
    astToObject(ast, settings) {
      function writeNode(node) {
        var result;
        
        switch (node.type) {
          case "object":
            result = {}; 
            node.children.forEach(function(child, index) {
              result[child.key.value] = writeNode(child.value);
            });
            break;

          case "array":
            result = [];
            node.children.forEach(function(child, index) {
              result.push(writeNode(child));
            });
            break;

          case "literal":
            result = node.value;
            break;

          default:
            throw new Error("Unexpected node type '" + node.type + "'");
        }
        return result;
      }

      return writeNode(ast);
    },

    /**
     * Detects whether the value is a native object
     * 
     * @param obj {Object}
     * @returns boolean
     */
    isPlainObject(obj) {
      if (typeof obj === "object" && obj !== null) {
        var proto = Object.getPrototypeOf(obj);
        return proto === Object.prototype || proto === null;
      }

      return false;
    },

    /**
     * Detects whether the value is a literal value
     * 
     * @param obj {Object}
     * @returns boolean
     */
    isLiteral(obj) {
      if (obj === null || typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
        return true; 
      }
      return false;
    },

    /**
     * Compares a node to see if it is the same as a literal value
     */
    isSameLiteral(node, object) {
      if (node.rawValue === null && object === null) {
        return true; 
      }
      if ((node.rawValue !== null && object === null) || (node.rawValue === null && object !== null)) {
        return false; 
      }
      if (typeof node.value !== typeof object) {
        return false; 
      }
      if (typeof node.value === "string") {
        return node.value === object;
      }
      return node.rawValue == object;
    }
    
  }
});
