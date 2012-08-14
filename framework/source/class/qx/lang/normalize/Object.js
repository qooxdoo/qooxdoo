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
 * This class takes care of the normalization of the native 'Object' object.
 * Therefore it checks the availability of the following methods and appends
 * it, if not available. This means you can use the methods during
 * development in every browser. For usage samples, check out the attached links.
 *
 * *keys*:
 * <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys">MDN documentation</a> |
 * <a href="http://es5.github.com/#x15.2.3.14">Annotated ES5 Spec</a>
 */
qx.Bootstrap.define("qx.lang.normalize.Object", {
  defer : function() {

    // keys
    if (!qx.core.Environment.get("ecmascript.object.keys")) {
      Object.keys = qx.Bootstrap.keys;
    }
  }
});
