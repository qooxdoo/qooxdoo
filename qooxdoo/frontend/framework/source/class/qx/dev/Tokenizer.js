/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

     Based on Public Domain code by Christopher Diggins
     http://www.cdiggins.com/tokenizer.html

   Authors:
     * Fabian Jakobs (fjakobs)
     * Christopher Diggins (original tokenizer code)

************************************************************************ */

/**
 * Simple JavaScript tokenizer used to print syntax highlighted
 * JavaScript code.
 *
 * Based on Public Domain code by Christopher Diggins
 * http://www.cdiggins.com/tokenizer.html
 */
qx.Class.define("qx.dev.Tokenizer",
{
  extend : qx.core.Object,

  statics :
  {

    /**
     * Tokenizes a string of JavaScript code.
     *
     * @param javaScriptText {String} String of JavaScript code to tokenize
     * @return {Map[]} Array of tokens. A token is a map with the fields
     *   <code>type</code> containing the token type and <code>value</code>,
     *   which contains the string value of the token from the input string.
     */
    tokenizeJavaScript : function(javaScriptText)
    {
      var keywords = {
        "break" : 1,
        "case" : 1,
        "catch" : 1,
        "continue" : 1,
        "default" : 1,
        "delete" : 1,
        "do" : 1,
        "else" : 1,
        "finally" : 1,
        "for" : 1,
        "function" : 1,
        "if" : 1,
        "in" : 1,
        "instanceof" : 1,
        "new" : 1,
        "return" : 1,
        "switch" : 1,
        "throw" : 1,
        "try" : 1,
        "typeof" : 1,
        "var" : 1,
        "while" : 1,
        "with" : 1
      };

      var atoms = {
        "void" : 1,
        "null" : 1,
        "true" : 1,
        "false" : 1,
        "NaN" : 1,
        "Infinity" : 1,
        "this" : 1
      };

      var qxkeys = {
        "statics" : 1,
        "members" : 1,
        "construct" : 1,
        "destruct" : 1,
        "events" : 1,
        "properties" : 1,
        "extend" : 1,
        "implement" : 1
      }

      var re_line_comment = /\/\/.*[\n\r$]/
      var re_full_comment = /\/\*(?:.|[\n\r])*?\*\//
      var re_ident = /[a-zA-Z_][a-zA-Z0-9_]*\b/
      var re_integer = /[+-]?\d+/
      var re_float = /[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?/
      var re_doublequote = /["][^"]*["]/
      var re_singlequote = /['][^']*[']/
      var re_tab = /\t/
      var re_nl = /\r\n|\r|\n/
      var re_space = /\s/
      var re_token = /\/\/.*?[\n\r$]|\/\*(?:.|\n|\r)*?\*\/|\w+\b|[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?|["][^"]*["]|['][^']*[']|\n|\r|./g

      var tokens = [];

      var a = javaScriptText.match(re_token);

      for (var i = 0; i < a.length; i++)
      {
        var token = a[i];
        if (token.match(re_line_comment)) {
          tokens.push({type: "linecomment", value: token});
        }
        else if (token.match(re_full_comment)) {
          tokens.push({type: "fullcomment", value: token});
        }
        else if (token.match(re_singlequote)) {
          tokens.push({type: "qstr", value: token});
        }
        else if (token.match(re_doublequote)) {
          tokens.push({type: "qqstr", value: token});
        }
        else if(keywords[token]) {
          tokens.push({type: "keyword", value: token});
        }
        else if(atoms[token]) {
          tokens.push({type: "atom", value: token});
        }
        else if(qxkeys[token]) {
          tokens.push({type: "qxkey", value: token});
        }
        else if (token.match(re_ident)) {
          tokens.push({type: "ident", value: token});
        }
        else if (token.match(re_float)) {
          tokens.push({type: "real", value: token});
        }
        else if (token.match(re_integer)) {
          tokens.push({type: "int", value: token});
        }
        else if (token.match(re_nl)) {
          tokens.push({type: "nl", value: token});
        }
        else if (token.match(re_space)) {
          tokens.push({type: "ws", value: token});
        }
        else if (token.match(re_tab)) {
          tokens.push({type: "tab", value: token});
        }
        else if (token == ">") {
          tokens.push({type: "sym", value: ">"});
        }
        else if (token == "<") {
          tokens.push({type: "sym", value: "<"});
        }
        else  if (token == "&") {
          tokens.push({type: "sym", value: "&"});
        }
        else {
          tokens.push({type: "sym", value: token});
        }
      }

      return tokens;
    },


    /**
     * Create a colored HTML string for a string of JavaScript code.
     * The colored elements are placed in <code>span</code> elements
     * with class names correponding to the token types. The returned code
     * should be placed into <code>pre</code> tags to preserve the
     * indentation.
     *
     * @param javaScriptText {String} String of JavaScript code to tokenize
     * @return {String} HTML fragment with the colored JavaScript code.
     */
    javaScriptToHtml : function(javaScriptText)
    {
      var tokens = qx.dev.Tokenizer.tokenizeJavaScript(javaScriptText);
      var js = new qx.util.StringBuilder();
      for (var i=0; i<tokens.length; i++) {
        var token = tokens[i];
        var htmlValue = qx.html.String.escape(token.value);
        switch(token.type) {
          case "ident":
            js.add("<span class='ident'>", htmlValue, "</span>");
            break;

          case "linecomment":
          case "fullcomment":
            js.add("<span class='comment'>", htmlValue, "</span>");
            break;

          case "qstr":
          case "qqstr":
            js.add("<span class='string'>", htmlValue, "</span>");
            break;

          case "keyword":
          case "atom":
          case "qxkey":
            js.add("<span class='", token.type, "'>", htmlValue, "</span>");
            break;

          case "nl":
            js.add("\n");
            break;

          default:
            js.add(htmlValue);
        }
      }
      return js.get();
    }
  }
});
