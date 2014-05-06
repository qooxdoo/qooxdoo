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
 * This class is responsible for the normalization of the native 'Date' object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Date", {

  statics : {

    /**
     * Returns the time elapsed since January 1, 1970 in milliseconds.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/now">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.9.4.4">Annotated ES5 Spec</a>
     *
     * @return {Integer} Milliseconds since the Unix Epoch
     */
    now : function() {
      return +new Date();
    }
  },

  defer : function(statics) {
    // Date.now
    if (!qx.core.Environment.get("ecmascript.date.now")) {
      Date.now = statics.now;
    }
  }
});
