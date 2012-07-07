/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * @tag test
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.test.Tokenizer",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var input = document.getElementById("input");
      var output = document.getElementById("output");

      document.getElementById("btn").onclick = function() {
        var tokens = qx.dev.Tokenizer.tokenizeJavaScript(input.value);
        output.innerHTML = qx.bom.String.escape(qx.lang.Json.stringify(tokens, true));
      }

      var toJavascript = function()
      {
        var tokens = qx.dev.Tokenizer.tokenizeJavaScript(input.value);
        var js = [];
        for (var i=0; i<tokens.length; i++) {
          js[i] = tokens[i].value;
        }
        output.innerHTML = "<pre>" + qx.bom.String.escape(js.join("")) + "</pre>";
      }
      document.getElementById("js").onclick = toJavascript;


      var toHtml = function()
      {
        output.innerHTML = "<pre>" + qx.dev.Tokenizer.javaScriptToHtml(input.value) + "</pre>";
      }
      document.getElementById("html").onclick = toHtml;

      toHtml();
    }
  }
});
