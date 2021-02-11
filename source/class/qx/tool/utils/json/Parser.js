/* ************************************************************************
 *
 *    qooxdoo-compiler - node.js based replacement for the Qooxdoo python
 *    toolchain
 *
 *    https://github.com/qooxdoo/qooxdoo-compiler
 *
 *    Copyright:
 *      2011-2019 Zenesis Limited, http://www.zenesis.com
 *      Vlad Trushin <monospectr@mail.ru> (https://github.com/vtrushin)
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
 *      * Vlad Trushin (monospectr@mail.ru, @vtrushin)
 *
 * *********************************************************************** */

/**
 * Parser, based on json-to-ast by Vlad trushin 
 */



qx.Class.define("qx.tool.utils.json.Parser", {
  statics: {
    literals: [
      qx.tool.utils.json.Tokenizer.tokenTypes.STRING,
      qx.tool.utils.json.Tokenizer.tokenTypes.NUMBER,
      qx.tool.utils.json.Tokenizer.tokenTypes.TRUE,
      qx.tool.utils.json.Tokenizer.tokenTypes.FALSE,
      qx.tool.utils.json.Tokenizer.tokenTypes.NULL
    ],

    objectStates: {
      _START_: 0,
      OPEN_OBJECT: 1,
      PROPERTY: 2,
      COMMA: 3
    },

    propertyStates: {
      _START_: 0,
      KEY: 1,
      COLON: 2
    },

    arrayStates: {
      _START_: 0,
      OPEN_ARRAY: 1,
      VALUE: 2,
      COMMA: 3
    },

    defaultSettings: {
      verbose: true,
      source: null
    },
    
    location(startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
      return {
        start: {
          line: startLine,
          column: startColumn,
          offset: startOffset
        },
        end: {
          line: endLine,
          column: endColumn,
          offset: endOffset
        },
        source: source || null
      };
    },
    
    comment(value, name, token) {
      if (token.comments !== undefined) {
        var valueComments = value[name];
        if (valueComments === undefined) {
          valueComments = value[name] = []; 
        }
        token.comments.forEach(function(comment) {
          valueComments.push({
            loc: comment.loc,
            source: comment.value
          });
        });
      }
    },
    
    parseObject(input, tokenizer, settings) {
      const { objectStates } = qx.tool.utils.json.Parser;
      const tokenTypes = qx.tool.utils.json.Tokenizer.tokenTypes;
      
      // object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
      let startToken;
      let object = {
        type: "object",
        children: []
      };
      let state = objectStates._START_;

      while (tokenizer.hasMore()) {
        const token = tokenizer.token();

        switch (state) {
          case objectStates._START_: {
            if (token.type === tokenTypes.LEFT_BRACE) {
              startToken = token;
              state = objectStates.OPEN_OBJECT;
              if (settings.verbose) {
                object.startToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(object, "leadingComments", token);
              }
              tokenizer.next();
            } else {
              return null;
            }
            break;
          }

          case objectStates.OPEN_OBJECT: {
            if (token.type === tokenTypes.RIGHT_BRACE) {
              if (settings.verbose) {
                object.loc = qx.tool.utils.json.Parser.location(
                  startToken.loc.start.line,
                  startToken.loc.start.column,
                  startToken.loc.start.offset,
                  token.loc.end.line,
                  token.loc.end.column,
                  token.loc.end.offset,
                  settings.source
                );
                object.endToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(object, "trailingComments", token);
              }
              tokenizer.next();
              return {
                value: object
              };
            } 
            const property = qx.tool.utils.json.Parser.parseProperty(input, tokenizer, settings);
            object.children.push(property.value);
            state = objectStates.PROPERTY;
            
            break;
          }

          case objectStates.PROPERTY: {
            if (token.type === tokenTypes.RIGHT_BRACE) {
              if (settings.verbose) {
                object.loc = qx.tool.utils.json.Parser.location(
                  startToken.loc.start.line,
                  startToken.loc.start.column,
                  startToken.loc.start.offset,
                  token.loc.end.line,
                  token.loc.end.column,
                  token.loc.end.offset,
                  settings.source
                );
                object.endToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(object, "trailingComments", token);
              }
              tokenizer.next();
              return {
                value: object
              };
            } else if (token.type === tokenTypes.COMMA) {
              qx.tool.utils.json.Parser.comment(object.children[object.children.length - 1], "trailingComments", token);
              state = objectStates.COMMA;
              tokenizer.next();
            } else {
              qx.tool.utils.json.Parser.error(
                qx.tool.utils.json.Parser.unexpectedToken(
                  input.substring(token.loc.start.offset, token.loc.end.offset),
                  token.loc.start.line,
                  token.loc.start.column
                ),
                input,
                token.loc.start.line,
                token.loc.start.column
              );
            }
            break;
          }

          case objectStates.COMMA: {
            const property = qx.tool.utils.json.Parser.parseProperty(input, tokenizer, settings);
            if (property) {
              object.children.push(property.value);
              state = objectStates.PROPERTY;
            } else {
              qx.tool.utils.json.Parser.error(
                qx.tool.utils.json.Parser.unexpectedToken(
                  input.substring(token.loc.start.offset, token.loc.end.offset),
                  token.loc.start.line,
                  token.loc.start.column
                ),
                input,
                token.loc.start.line,
                token.loc.start.column
              );
            }
            break;
          }
        }
      }

      qx.tool.utils.json.Parser.error(qx.tool.utils.json.Parser.unexpectedEnd());
      return null;
    },
    
    parseProperty(input, tokenizer, settings) {
      const { objectStates, propertyStates } = qx.tool.utils.json.Parser;
      const tokenTypes = qx.tool.utils.json.Tokenizer.tokenTypes;
      
      // property: STRING COLON value
      let startToken;
      let property = {
        type: "property",
        key: null,
        value: null
      };
      let state = objectStates._START_;

      while (tokenizer.hasMore()) {
        const token = tokenizer.token();

        switch (state) {
          case propertyStates._START_: {
            if (token.type === tokenTypes.STRING) {
              const key = {
                type: "identifier",
                value: token.value
              };
              if (settings.verbose) {
                key.loc = token.loc;
                property.startToken = key.startToken = key.endToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(key, "leadingComments", token);
              }
              startToken = token;
              property.key = key;
              state = propertyStates.KEY;
              tokenizer.next();
            } else {
              return null;
            }
            break;
          }

          case propertyStates.KEY: {
            if (token.type === tokenTypes.COLON) {
              if (settings.verbose) {
                qx.tool.utils.json.Parser.comment(property.key, "trailingComments", token);
                property.colonToken = token;
              }
              state = propertyStates.COLON;
              tokenizer.next();
            } else {
              qx.tool.utils.json.Parser.error(
                qx.tool.utils.json.Parser.unexpectedToken(
                  input.substring(token.loc.start.offset, token.loc.end.offset),
                  token.loc.start.line,
                  token.loc.start.column
                ),
                input,
                token.loc.start.line,
                token.loc.start.column
              );
            }
            break;
          }

          case propertyStates.COLON: {
            const value = qx.tool.utils.json.Parser.parseValue(input, tokenizer, settings);
            property.value = value.value;
            if (settings.verbose) {
              property.endToken = value.value.endToken;
              property.loc = qx.tool.utils.json.Parser.location(
                startToken.loc.start.line,
                startToken.loc.start.column,
                startToken.loc.start.offset,
                value.value.loc.end.line,
                value.value.loc.end.column,
                value.value.loc.end.offset,
                settings.source
              );
            }
            return {
              value: property
            };
          }
        }
      }
      
      return null;
    },
    
    parseArray(input, tokenizer, settings) {
      const { arrayStates } = qx.tool.utils.json.Parser;
      const tokenTypes = qx.tool.utils.json.Tokenizer.tokenTypes;
      
      // array: LEFT_BRACKET (value (COMMA value)*)? RIGHT_BRACKET
      let startToken;
      let array = {
        type: "array",
        children: []
      };
      let state = arrayStates._START_;
      let token;

      while (tokenizer.hasMore()) {
        token = tokenizer.token();

        switch (state) {
          case arrayStates._START_: {
            if (token.type === tokenTypes.LEFT_BRACKET) {
              startToken = token;
              if (settings.verbose) {
                array.startToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(array, "leadingComments", token);
              }
              state = arrayStates.OPEN_ARRAY;
              tokenizer.next();
            } else {
              return null;
            }
            break;
          }

          case arrayStates.OPEN_ARRAY: {
            if (token.type === tokenTypes.RIGHT_BRACKET) {
              if (settings.verbose) {
                array.loc = qx.tool.utils.json.Parser.location(
                  startToken.loc.start.line,
                  startToken.loc.start.column,
                  startToken.loc.start.offset,
                  token.loc.end.line,
                  token.loc.end.column,
                  token.loc.end.offset,
                  settings.source
                );
                array.endToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(array, "trailingComments", token);
              }
              tokenizer.next();
              return {
                value: array
              };
            } 
            let value = qx.tool.utils.json.Parser.parseValue(input, tokenizer, settings);
            array.children.push(value.value);
            state = arrayStates.VALUE;
            
            break;
          }

          case arrayStates.VALUE: {
            if (token.type === tokenTypes.RIGHT_BRACKET) {
              if (settings.verbose) {
                array.loc = qx.tool.utils.json.Parser.location(
                  startToken.loc.start.line,
                  startToken.loc.start.column,
                  startToken.loc.start.offset,
                  token.loc.end.line,
                  token.loc.end.column,
                  token.loc.end.offset,
                  settings.source
                );
                array.endToken = tokenizer.tokenIndex;
                qx.tool.utils.json.Parser.comment(array, "trailingComments", token);
              }
              tokenizer.next();
              return {
                value: array
              };
            } else if (token.type === tokenTypes.COMMA) {
              state = arrayStates.COMMA;
              tokenizer.next();
            } else {
              qx.tool.utils.json.Parser.error(
                qx.tool.utils.json.Parser.unexpectedToken(
                  input.substring(token.loc.start.offset, token.loc.end.offset),
                  token.loc.start.line,
                  token.loc.start.column
                ),
                input,
                token.loc.start.line,
                token.loc.start.column
              );
            }
            break;
          }

          case arrayStates.COMMA: {
            let value = qx.tool.utils.json.Parser.parseValue(input, tokenizer, settings);
            array.children.push(value.value);
            state = arrayStates.VALUE;
            break;
          }
        }
      }

      qx.tool.utils.json.Parser.error(
        qx.tool.utils.json.Parser.unexpectedEnd()
      );
      return null;
    },

    parseLiteral(input, tokenizer, settings) {
      // literal: STRING | NUMBER | TRUE | FALSE | NULL
      const token = tokenizer.token();

      const isLiteral = qx.tool.utils.json.Parser.literals.indexOf(token.type) !== -1;

      if (isLiteral) {
        let value = token.value;
        if (token.type == qx.tool.utils.json.Tokenizer.tokenTypes.STRING) {
          value = value.replace(/\\(.)/g, "$1");
        }
        const literal = {
          type: "literal",
          value: value,
          rawValue: input.substring(token.loc.start.offset, token.loc.end.offset)
        };
        if (settings.verbose) {
          literal.loc = token.loc;
          literal.startToken = literal.endToken = tokenizer.tokenIndex;
          qx.tool.utils.json.Parser.comment(literal, "leadingComments", token);
        }
        tokenizer.next();
        return {
          value: literal
        };
      }

      return null;
    },

    parseValue(input, tokenizer, settings) {
      // value: literal | object | array
      const token = tokenizer.token();

      const value = (
        qx.tool.utils.json.Parser.parseLiteral(...arguments) ||
        qx.tool.utils.json.Parser.parseObject(...arguments) ||
        qx.tool.utils.json.Parser.parseArray(...arguments)
      );

      if (value) {
        return value;
      } 
      qx.tool.utils.json.Parser.error(
        qx.tool.utils.json.Parser.unexpectedToken(
          input.substring(token.loc.start.offset, token.loc.end.offset),
          token.loc.start.line,
          token.loc.start.column
        ),
        input,
        token.loc.start.line,
        token.loc.start.column
      );
      return null;
    },

    parseToAst(input, settings) {
      settings = Object.assign({}, qx.tool.utils.json.Parser.defaultSettings, settings);
      const tokenizer = new qx.tool.utils.json.Tokenizer(input, settings);
      tokenizer.tokenize();

      if (!tokenizer.hasMore()) {
        qx.tool.utils.json.Parser.error(qx.tool.utils.json.Parser.unexpectedEnd());
      }

      const value = qx.tool.utils.json.Parser.parseValue(input, tokenizer, settings);

      if (!tokenizer.hasMore()) {
        var result = value.value;
        if (settings.verbose) {
          result.tokenizer = tokenizer;
        }
        return result;
      } 
      const token = tokenizer.next();
      qx.tool.utils.json.Parser.error(
        qx.tool.utils.json.Parser.unexpectedToken(
          input.substring(token.loc.start.offset, token.loc.end.offset),
          token.loc.start.line,
          token.loc.start.column
        ),
        input,
        token.loc.start.line,
        token.loc.start.column
      );
      return null;
    },
    
    parse(input, settings) {
      return qx.tool.utils.json.Parser.parseToAst(input, settings);
    },
    
    
    unexpectedEnd() {
      return "Unexpected end of JSON input";
    },
    
    unexpectedToken(token, line, column) {
      return `Unexpected token <${token}> at ${line}:${column}`;
    },
    
    error(message, source, line, column) {
      function showCodeFragment(source, linePosition, columnPosition) {
        const lines = source.split(/\n|\r\n?|\f/);
        const line = lines[linePosition - 1];
        const marker = new Array(columnPosition).join(" ") + "^";

        return line + "\n" + marker;
      }

      class ParseError extends SyntaxError {
        constructor(message, source, linePosition, columnPosition) {
          const fullMessage = linePosition ?
            message + "\n" + showCodeFragment(source, linePosition, columnPosition) :
            message;
          super(fullMessage);
          this.rawMessage = message;
        }
      }

      throw new ParseError(message, source, line, column);
    }

  }
});
