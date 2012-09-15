/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * This class takes care of the normalization of the native 'Error' object.
 * It contains a simple bugfix for toString which might not print out the proper
 * error message.
 *
 * *toString*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/toString">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.11.4.4">Annotated ES5 Spec</a>
 */
qx.Bootstrap.define("qx.lang.normalize.Error",
{
  defer : function() {
    // toString
    if (!qx.core.Environment.get("ecmascript.error.toString")) {
      Error.prototype.toString = function() {
        var name = this.name || "Error";
        var message = this.message || "";

        if (name === "" && message === "") {
          return "Error";
        }
        if (name === "") {
          return message;
        }
        if (message === "") {
          return name;
        }
        return name + ": " + message;
      };
    }
  }
});