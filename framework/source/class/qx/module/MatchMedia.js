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
 * Module for mediaqueries evaluation. The module is a wrapper for media.match.js,
 * that implements a polyfill for window.matchMedia when it's not supported natively.
 *
 * Usage:
 *
 * <pre class="javascript">
 * qxWeb.matchMedia("screen and (min-width: 480px)").matches; // true or false
 * </pre>
 *
 * or
 * <pre class="javascript">
 * var mql = qxWeb.matchMedia("screen and (min-width: 480px)");
 * mql.on("change",function(mql){
 *  //Do your stuff
 * });
 * </pre>
 *
 */
qx.Bootstrap.define("qx.module.MatchMedia", {

  statics : {
    /**
    * Evaluates the specified mediaquery list
    *
    * @param query {String} the media query to evaluate
    * @param ctxWindow {Object?window} the window object which should be operated on
    * @attachStatic {qxWeb, matchMedia}
    * @return {qx.bom.MediaQueryListener}  The mediaquery listener
    */
    match : function(query, ctxWindow){
      return new qx.bom.MediaQueryListener(query, ctxWindow);
    }
  },

  defer : function(statics){
    qxWeb.$attachStatic({
      matchMedia : statics.match
    });
  }
});
