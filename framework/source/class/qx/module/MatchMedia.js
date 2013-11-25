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
 */
qx.Bootstrap.define("qx.module.MatchMedia", {

  statics : {
    /**
    * Evaluates the specified mediaquery list
    *
    * @param query {String} the media query to evaluate
    * @param ctxWindow {Object?window} the window object which should be operated on
    * @attachStatic {qxWeb, matchMedia}
    * @return {qx.bom.MediaQuery}  The media query
    */
    matchMedia : function(query, ctxWindow){
      return new qx.bom.MediaQuery(query, ctxWindow);
    }
  },

  defer : function(statics){
    qxWeb.$attachStatic({
      matchMedia : statics.matchMedia
    });
  }
});
