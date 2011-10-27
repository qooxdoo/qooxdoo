/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/*
#ignore(inspector.$$inspector)
*/

/**
 * Util class for console.
 */
qx.Class.define("inspector.console.Util",
{
  statics :
  {
    /**
     * Runs the code on the Iframe window.
     *
     * @param code {String} Code to eval
     * @return {Object|null} Evaluated code, if any.
     * @throws an Exception if an error occurs by evaluation.
     */
    evalOnIframe : function(code) {
      var iFrameWindow = qx.core.Init.getApplication().getIframeWindowObject();
      var result = null;

      try {
        if (qx.core.Environment.get("engine.name") == "opera" && qx.core.Environment.get("engine.version") < 9.8) {
          result = (function(code) {
            return iFrameWindow.eval(code);
          }).call(qx.core.Init.getApplication().getSelectedObject(), code);
        } else {
          if (qx.core.Environment.get("engine.name") == "mshtml" ||
              qx.core.Environment.get("engine.name") == "webkit") {
            code = code.replace(/^(\s*var\s+)(.*)$/, "$2");
          }

          var returnCode = "";
          if (
            qx.core.Environment.get("engine.name") == "webkit" ||
            qx.core.Environment.get("engine.name") == "opera" ||
            (qx.core.Environment.get("engine.name") == "mshtml" && parseFloat(qx.core.Environment.get("browser.version")) >= 9) ||
            (qx.core.Environment.get("engine.name") == "gecko" && parseFloat(qx.core.Environment.get("browser.version")) >= 4)
          ) {
            returnCode = "return eval('" + code + "');"
          } else {
            returnCode = "return eval.call(window, '" + code + "');"
          }

          iFrameWindow.qx.lang.Function.globalEval([
            "window.top.inspector.$$inspector = function()",
            "{",
            "  try {",
            returnCode,
            "  } catch (ex) {",
            "    return ex;",
            "  }",
            "};"].join("")
          );
          result = inspector.$$inspector.call(qx.core.Init.getApplication().getSelectedObject());
        }

        // If the result on eval was an exeption -> throw it
        if (result instanceof iFrameWindow.Error) {
          throw result;
        }
      } catch (ex) {
        throw ex;
      }

      return result;
    }
   }
});