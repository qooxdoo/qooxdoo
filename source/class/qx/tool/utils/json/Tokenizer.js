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

/* eslint-disable no-label */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-redeclare */
/* eslint-disable no-constant-condition */
/* eslint-disable no-labels */

const __tokenTypes = {
  LEFT_BRACE: 0, // {
  RIGHT_BRACE: 1, // }
  LEFT_BRACKET: 2, // [
  RIGHT_BRACKET: 3, // ]
  COLON: 4, // :
  COMMA: 5, // ,
  STRING: 6, //
  NUMBER: 7, //
  TRUE: 8, // true
  FALSE: 9, // false
  NULL: 10, // null
  COMMENT: 11,
  WHITESPACE: 12
};


/**
 * Tokenizer, based on json-to-ast by Vlad trushin 
 */
qx.Class.define("qx.tool.utils.json.Tokenizer", {
  extend: qx.core.Object,
  
  construct: function(input, settings) {
    this.base(arguments);
    this.input = input;
    this.settings = settings||{};
    this.tokens = null;
    this.tokenIndex = -1;
  },
  
  members: {
    token() {
      if (this.tokens === null) {
        throw new Error("No tokens to return (have you called tokenize?)"); 
      }
      if (this.tokenIndex >= this.tokens.length) {
        throw new Error("No more tokens available"); 
      }
      if (this.tokenIndex < 0) {
        return this.next(); 
      }
      return this.tokens[this.tokenIndex];
    },
    
    hasMore() {
      const tokenTypes = qx.tool.utils.json.Tokenizer.tokenTypes;
      
      if (this.tokens === null) {
        throw new Error("No tokens to return (have you called tokenize?)"); 
      }
      
      if (this.settings.returnWhitespace) {
        return this.tokenIndex < this.tokens.length;
      }
      
      var tokenIndex = this.tokenIndex;
      if (tokenIndex < 0) {
        tokenIndex = 0; 
      }
      for (; tokenIndex < this.tokens.length; tokenIndex++) {
        var token = this.tokens[tokenIndex];
        if (token.type != tokenTypes.COMMENT && token.type != tokenTypes.WHITESPACE) {
          return true; 
        }
      }
      return false;
    },
    
    next() {
      const tokenTypes = qx.tool.utils.json.Tokenizer.tokenTypes;
      
      if (this.tokens === null) {
        throw new Error("No tokens to return (have you called tokenize?)"); 
      }
      if (this.tokenIndex >= this.tokens.length) {
        throw new Error("No more tokens to get"); 
      }
      
      if (this.settings.returnWhitespace) {
        if (this.tokenIndex < this.tokens.length) {
          return this.tokens[++this.tokenIndex]; 
        }
      } else {
        for (++this.tokenIndex; this.tokenIndex < this.tokens.length; this.tokenIndex++) {
          var token = this.tokens[this.tokenIndex];
          if (token.type != tokenTypes.COMMENT && token.type != tokenTypes.WHITESPACE) {
            return token; 
          }
        }
      }
      
      return null;
    },
    
    tokenize() {
      const Tokenizer = qx.tool.utils.json.Tokenizer;
      
      let line = 1;
      let column = 1;
      let index = 0;
      const tokens = this.tokens = [];
      var input = this.input;

      while (index < input.length) {
        const args = [input, index, line, column, this.settings];

        const matched = (
          Tokenizer.parseWhitespace(...args) ||
          Tokenizer.parseComment(...args) ||
          Tokenizer.parseChar(...args) ||
          Tokenizer.parseKeyword(...args) ||
          Tokenizer.parseString(...args) ||
          Tokenizer.parseNumber(...args)
        );

        if (matched) {
          const token = {
            type: matched.type,
            value: matched.value,
            loc: qx.tool.utils.json.Parser.location(
              line,
              column,
              index,
              matched.line,
              matched.column,
              matched.index,
              this.settings.source
            )
          };
          if (matched.rawValue) {
            token.rawValue = matched.rawValue; 
          }

          tokens.push(token);
          index = matched.index;
          line = matched.line;
          column = matched.column;
        } else {
          qx.tool.utils.json.Parser.error(
            Tokenizer.cannotTokenizeSymbol(input.charAt(index), line, column),
            input,
            line,
            column
          );
        }
      }

      return tokens;
    }    
  },
  
  statics: {
    tokenTypes: __tokenTypes,

    punctuatorTokensMap: { // Lexeme: Token
      "{": __tokenTypes.LEFT_BRACE,
      "}": __tokenTypes.RIGHT_BRACE,
      "[": __tokenTypes.LEFT_BRACKET,
      "]": __tokenTypes.RIGHT_BRACKET,
      ":": __tokenTypes.COLON,
      ",": __tokenTypes.COMMA
    },

    keywordTokensMap: { // Lexeme: Token config
      "true": { type: __tokenTypes.TRUE, value: true },
      "false": { type: __tokenTypes.FALSE, value: false },
      "null": { type: __tokenTypes.NULL, value: null }
    },

    stringStates: {
      _START_: 0,
      START_QUOTE_OR_CHAR: 1,
      ESCAPE: 2
    },

    escapes: {
      "\"": "\"", // Quotation mask
      "\\": "\\", // Reverse solidus
      "/": "/", // Solidus
      "b": "\b", // Backspace
      "f": "\f", // Form feed
      "n": "\n", // New line
      "r": "\r", // Carriage return
      "t": "\t", // Horizontal tab
      "u": "u" // 4 hexadecimal digits
    },

    numberStates: {
      _START_: 0,
      MINUS: 1,
      ZERO: 2,
      DIGIT: 3,
      POINT: 4,
      DIGIT_FRACTION: 5,
      EXP: 6,
      EXP_DIGIT_OR_SIGN: 7
    },

    // HELPERS

    isDigit1to9(char) {
      return char >= "1" && char <= "9";
    },

    isDigit(char) {
      return char >= "0" && char <= "9";
    },

    isHex(char) {
      return (
        qx.tool.utils.json.Tokenizer.isDigit(char) ||
        (char >= "a" && char <= "f") ||
        (char >= "A" && char <= "F")
      );
    },

    isExp(char) {
      return char === "e" || char === "E";
    },
    
    // ERRORS
    
    cannotTokenizeSymbol(symbol, line, column) {
      return `Cannot tokenize symbol <${symbol}> at ${line}:${column}`;
    },

    // PARSERS

    parseWhitespace(input, index, line, column) {
      var value = "";

      while (true) {
        var char = input.charAt(index);
        if (char === "\r") { // CR (Unix)
          index++;
          line++;
          column = 1;
          value += char;
          if (input.charAt(index) === "\n") { // CRLF (Windows)
            index++;
            value += "\n";
          }
        } else if (char === "\n") { // LF (MacOS)
          index++;
          line++;
          column = 1;
          value += char;
        } else if (char === "\t" || char === " ") {
          index++;
          column++;
          value += char;
        } else {
          break;
        }
      }
      if (value.length == 0) {
        return null; 
      }

      return {
        index,
        line,
        column,
        type: qx.tool.utils.json.Tokenizer.tokenTypes.WHITESPACE,
        value: value
      };
    },

    parseComment(input, index, line, column) {
      const str = input.substring(index, index + 2);
      const startIndex = index;
      
      if (str === "/*") {
        for (index += 2; index < input.length; index++) {
          var char = input[index];
          if (char === "*" && input[index + 1] === "/") {
            index += 2;
            column += 2;
            break;
          } else if (char === "\r") { // CR (Unix)
            index++;
            line++;
            column = 1;
            if (input.charAt(index) === "\n") { // CRLF (Windows)
              index++;
            }
          } else if (char === "\n") { // LF (MacOS)
            index++;
            line++;
            column = 1;
          } else {
            column++; 
          }
        }
        return {
          index,
          line,
          column,
          type: qx.tool.utils.json.Tokenizer.tokenTypes.COMMENT,
          value: input.substring(startIndex, index)
        };
      } else if (str === "//") {
        for (index += 2; index < input.length; index++) {
          var char = input[index];
          if (char === "\r") { // CR (Unix)
            index++;
            line++;
            column = 1;
            if (input.charAt(index) === "\n") { // CRLF (Windows)
              index++;
            }
            break;
          } else if (char === "\n") { // LF (MacOS)
            index++;
            line++;
            column = 1;
            break;
          }
        }
        
        return {
          index,
          line,
          column,
          type: qx.tool.utils.json.Tokenizer.tokenTypes.COMMENT,
          value: input.substring(startIndex, index)
        };
      }
      
      return null;
    },

    parseChar(input, index, line, column) {
      const char = input.charAt(index);
      const punctuatorTokensMap = qx.tool.utils.json.Tokenizer.punctuatorTokensMap;

      if (char in punctuatorTokensMap) {
        return {
          type: punctuatorTokensMap[char],
          line,
          column: column + 1,
          index: index + 1,
          value: char
        };
      }

      return null;
    },

    parseKeyword(input, index, line, column) {
      const keywordTokensMap = qx.tool.utils.json.Tokenizer.keywordTokensMap;
      
      for (const name in keywordTokensMap) {
        if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
          const {type, value} = keywordTokensMap[name];

          return {
            type,
            line,
            column: column + name.length,
            index: index + name.length,
            value
          };
        }
      }

      return null;
    },

    parseString(input, index, line, column, settings) {
      const { stringStates, tokenTypes, escapes } = qx.tool.utils.json.Tokenizer;
      
      const startIndex = index;
      let buffer = "";
      let state = stringStates._START_;

      while (index < input.length) {
        const char = input.charAt(index);

        switch (state) {
          case stringStates._START_: {
            if (char === "\"") {
              state = stringStates.START_QUOTE_OR_CHAR;
              index++;
            } else {
              return null;
            }
            break;
          }

          case stringStates.START_QUOTE_OR_CHAR: {
            if (char === "\\") {
              state = stringStates.ESCAPE;
              index++;
            } else if (char === "\"") {
              index++;
              var result = {
                type: tokenTypes.STRING,
                line,
                column: column + index - startIndex,
                index,
                value: buffer
              };
              if (settings.verbose) {
                result.rawValue = input.substring(startIndex, index); 
              }
              return result;
            } else {
              buffer += char;
              index++;
            }
            break;
          }

          case stringStates.ESCAPE: {
            if (char in escapes) {
              if (char === "u") {
                index++;
                for (let i = 0; i < 4; i++) {
                  const curChar = input.charAt(index);
                  if (curChar && qx.tool.utils.json.Tokenizer.isHex(curChar)) {
                    buffer += curChar;
                    index++;
                  } else {
                    return null;
                  }
                }
              } else {
                buffer += escapes[char];
                index++;
              }
              state = stringStates.START_QUOTE_OR_CHAR;
            } else {
              return null;
            }
            break;
          }
        }
      }
      
      return null;
    },

    parseNumber(input, index, line, column) {
      const numberStates = qx.tool.utils.json.Tokenizer.numberStates;
      
      const startIndex = index;
      let passedValueIndex = index;
      let state = numberStates._START_;

      iterator: while (index < input.length) {
        const char = input.charAt(index);

        switch (state) {
          case numberStates._START_: {
            if (char === "-") {
              state = numberStates.MINUS;
            } else if (char === "0") {
              passedValueIndex = index + 1;
              state = numberStates.ZERO;
            } else if (qx.tool.utils.json.Tokenizer.isDigit1to9(char)) {
              passedValueIndex = index + 1;
              state = numberStates.DIGIT;
            } else {
              return null;
            }
            break;
          }

          case numberStates.MINUS: {
            if (char === "0") {
              passedValueIndex = index + 1;
              state = numberStates.ZERO;
            } else if (qx.tool.utils.json.Tokenizer.isDigit1to9(char)) {
              passedValueIndex = index + 1;
              state = numberStates.DIGIT;
            } else {
              return null;
            }
            break;
          }

          case numberStates.ZERO: {
            if (char === ".") {
              state = numberStates.POINT;
            } else if (qx.tool.utils.json.Tokenizer.isExp(char)) {
              state = numberStates.EXP;
            } else {
              break iterator;
            }
            break;
          }

          case numberStates.DIGIT: {
            if (qx.tool.utils.json.Tokenizer.isDigit(char)) {
              passedValueIndex = index + 1;
            } else if (char === ".") {
              state = numberStates.POINT;
            } else if (qx.tool.utils.json.Tokenizer.isExp(char)) {
              state = numberStates.EXP;
            } else {
              break iterator;
            }
            break;
          }

          case numberStates.POINT: {
            if (qx.tool.utils.json.Tokenizer.isDigit(char)) {
              passedValueIndex = index + 1;
              state = numberStates.DIGIT_FRACTION;
            } else {
              break iterator;
            }
            break;
          }

          case numberStates.DIGIT_FRACTION: {
            if (qx.tool.utils.json.Tokenizer.isDigit(char)) {
              passedValueIndex = index + 1;
            } else if (qx.tool.utils.json.Tokenizer.isExp(char)) {
              state = numberStates.EXP;
            } else {
              break iterator;
            }
            break;
          }

          case numberStates.EXP: {
            if (char === "+" || char === "-") {
              state = numberStates.EXP_DIGIT_OR_SIGN;
            } else if (qx.tool.utils.json.Tokenizer.isDigit(char)) {
              passedValueIndex = index + 1;
              state = numberStates.EXP_DIGIT_OR_SIGN;
            } else {
              break iterator;
            }
            break;
          }

          case numberStates.EXP_DIGIT_OR_SIGN: {
            if (qx.tool.utils.json.Tokenizer.isDigit(char)) {
              passedValueIndex = index + 1;
            } else {
              break iterator;
            }
            break;
          }
        }

        index++;
      }

      if (passedValueIndex > 0) {
        return {
          type: qx.tool.utils.json.Tokenizer.tokenTypes.NUMBER,
          line,
          column: column + passedValueIndex - startIndex,
          index: passedValueIndex,
          value: parseFloat(input.substring(startIndex, passedValueIndex))
        };
      }

      return null;
    }
    
  }
});

