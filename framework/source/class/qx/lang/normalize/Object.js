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
 * This class is responsible for the normalization of the native Object.
 * It checks if these methods are available and, if not, appends them to
 * ensure compatibility in all browsers.
 * For usage samples, check out the attached links.
 *
 * @group (Polyfill)
 */
qx.Bootstrap.define("qx.lang.normalize.Object", {

  statics : {

    /**
     * Get the keys of a map as array as returned by a "for ... in" statement.
     *
     * <a href="https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys">MDN documentation</a> |
     * <a href="http://es5.github.com/#x15.2.3.14">Annotated ES5 Spec</a>
     *
     * @signature function(map)
     * @param map {Object} the map
     * @return {Array} array of the keys of the map
     */
    keys : qx.Bootstrap.keys
  },

  defer : function(statics) {
    // keys
    if (!qx.core.Environment.get("ecmascript.object.keys")) {
      Object.keys = statics.keys;
    }
  }
});
