/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * JSON detection.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Json",
{
  statics:
  {
    /**
     * Checks if native JSON could be used and is full-featured.
     * @return {Boolean} <code>true</code>, if it could be used.
     * @internal
     */
    getJson: function() {
      return (

      // Exists
      qx.Bootstrap.getClass(window.JSON) == "JSON" &&

      // Can parse
      JSON.parse('{"x":1}').x === 1 &&

      // Supports replacer
      //
      // Catches browser bug found in Firefox >=3.5 && < 4, see
      // https://bugzilla.mozilla.org/show_bug.cgi?id=509184
      JSON.stringify({"prop":"val"}, function(k,v) {
        return k === "prop" ? "repl" : v;
      }).indexOf("repl") > 0);
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("json", statics.getJson);
  }
});
