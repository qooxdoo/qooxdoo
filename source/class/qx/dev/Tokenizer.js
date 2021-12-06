/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      };

      var reg = function(str) {
        return new RegExp("^" + str + "$");
      };

      var str_re_line_comment = "\\/\\/.*?[\\n\\r$]";
      var str_re_full_comment = "\\/\\*(?:.|[\\n\\r])*?\\*\\/";
      var str_re_ident = "[a-zA-Z_][a-zA-Z0-9_]*\\b";
      var str_re_integer = "[+-]?\\d+";
      var str_re_float = "[+-]?\\d+(([.]\\d+)*([eE][+-]?\\d+))?";
      var str_re_doublequote = '["][^"]*["]';
      var str_re_singlequote = "['][^']*[']";
      var str_re_tab = "\\t";
      var str_re_nl = "\\r\\n|\\r|\\n";
      var str_re_space = "\\s";

      var re_regexp_part = "(?:\\/(?!\\*)[^\\t\\n\\r\\f\\v\\/]+?\\/[mgi]*)";
      var str_re_regexp_all = [
        "\\.(?:match|search|split)\\s*\\(\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*\\s*\\)",
        "\\.(?:replace)\\s*\\(\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*\\s*?,?",
        "\\s*\\(*\\s*" + re_regexp_part + "\\)*\\.(?:test|exec)\\s*\\(\\s*",
        "(?::|=|\\?)\\s*\\(*\\s*" + re_regexp_part + "\\s*\\)*",
        "[\\(,]\\s*" + re_regexp_part + "\\s*[,\\)]"
      ].join("|");

      var re_line_comment = reg(str_re_line_comment);
      var re_full_comment = reg(str_re_full_comment);
      var re_ident = reg(str_re_ident);
      var re_integer = reg(str_re_integer);
      var re_float = reg(str_re_float);
      var re_doublequote = reg(str_re_doublequote);
      var re_singlequote = reg(str_re_singlequote);
      var re_tab = reg(str_re_tab);
      var re_nl = reg(str_re_nl);
      var re_space = reg(str_re_space);
      var re_regexp_all = reg(str_re_regexp_all);

      var re_token = new RegExp([
        str_re_line_comment,
        str_re_full_comment,
        str_re_ident,
        str_re_integer,
        str_re_float,
        str_re_doublequote,
        str_re_singlequote,
        str_re_singlequote,
        str_re_tab,
        str_re_nl,
        str_re_space,
        str_re_regexp_all,
        "."
      ].join("|"), "g");

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
        else if (token.match(re_regexp_all)) {
          tokens.push({type: "regexp", value: token});
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
        else if (token.match(reg(re_space))) {
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
     * with class names corresponding to the token types. The returned code
     * should be placed into <code>pre</code> tags to preserve the
     * indentation.
     *
     * @param javaScriptText {String} String of JavaScript code to tokenize
     * @param forPreTag {Boolean ? false} Whatever the HTML should be generated
     *   for a pre tag or not
     * @return {String} HTML fragment with the colored JavaScript code.
     */
    javaScriptToHtml : function(javaScriptText, forPreTag)
    {
      var tokens = qx.dev.Tokenizer.tokenizeJavaScript(javaScriptText);
      var js = new qx.util.StringBuilder();
      for (var i=0; i<tokens.length; i++) {
        var token = tokens[i];
        var htmlValue = qx.bom.String.escape(token.value);
        switch(token.type) {
          case "regexp":
            js.add("<span class='regexp'>", htmlValue, "</span>");
            break;

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
            var nl = qx.core.Environment.get("engine.name") == "mshtml" && !forPreTag ? "<br>" : "\n";
            js.add(nl);
            break;

          case "ws":
            var ws = qx.core.Environment.get("engine.name") == "mshtml" &&
               !forPreTag ? "&nbsp;" : " ";
            js.add(ws);
            break;

          default:
            js.add(htmlValue);
        }
      }
      return js.get();
    }
  }
});
