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
     * Christian Schmidt (chris_schmidt)

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
        if (qx.core.Variant.isSet("qx.client", "webkit|mshtml|gecko")) {
          if (qx.core.Variant.isSet("qx.client", "mshtml") ||
              qx.core.Variant.isSet("qx.client", "webkit")) {
            code = code.replace(/^(\s*var\s+)(.*)$/, "$2");
          }

          var returnCode = "";
          // Fix for webkit version > nightly
          if (qx.core.Variant.isSet("qx.client", "webkit") &&
              qx.bom.client.Engine.FULLVERSION >= 528) {
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
        } else if (qx.core.Variant.isSet("qx.client", "opera")) {
          result = (function(code) {
            return iFrameWindow.eval(code);
          }).call(qx.core.Init.getApplication().getSelectedObject(), code);
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