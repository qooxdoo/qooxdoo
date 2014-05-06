/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Romeo Kenfack Tsakem (rkenfack)

************************************************************************ */

/**
 * This class is to test css media queries. It implements a polyfill for
 * window.matchMedia if not supported natively.
 *
 * @deprecated {3.5}
 */
qx.Bootstrap.define("qx.bom.MediaQueryListener", {

  extend : qx.bom.MediaQuery,

  /**
   * @param query {String} the media query to evaluate
   * @param ctxWindow {Object?window} the window object which should be operated on
   * @deprecated {3.5}
   */
  construct : function(query, ctxWindow) {
    this.base(arguments, query, ctxWindow);
    if (qx.core.Environment.get("qx.debug")) {
      qx.log.Logger.deprecatedClassWarning(this.constructor, "Please use 'qx.bom.MediaQuery' instead.'");
    }
  }
});
