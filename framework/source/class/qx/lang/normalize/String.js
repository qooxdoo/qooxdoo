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
 * This class is responsible for the normalization of the native 'String' object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.String", {

  statics : {

    /**
     * Removes whitespace from both ends of the string.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/String/Trim">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.5.4.20">Annotated ES5 Spec</a>
     *
     * @return {String} The trimmed string
     */
    trim : function() {
      return this.replace(/^\s+|\s+$/g,'');
    }
  },

  defer : function(statics) {
    // trim
    if (!qx.core.Environment.get("ecmascript.string.trim")) {
      String.prototype.trim = statics.trim;
    }
  }
});
