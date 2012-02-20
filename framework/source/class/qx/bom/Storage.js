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
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Bootstrap.define("qx.bom.Storage", {
  statics : {
    __impl : null,

    getLocal : function() {
      return this.__impl.getLocal();
    },


    getSession : function() {
      return this.__impl.getSession();
    }
  },


  defer : function(statics) {
    if (qx.core.Environment.get("html.storage.local")) {
      statics.__impl = qx.bom.storage.Web;
    } else if (qx.core.Environment.get("html.storage.userdata")) { // IE <8 fallback
      statics.__impl = qx.bom.storage.UserData;
    } else {
      statics.__impl = qx.bom.storage.Memory;
    }
  }
});