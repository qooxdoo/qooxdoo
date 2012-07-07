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

/**
 * This is a cross browser storage implementation. The API is aligned with the
 * API of the HTML web storage (http://www.w3.org/TR/webstorage/) which is also
 * the preferred implementation used. As fallback for IE < 8, we use user data.
 * If both techniques are unsupported, we supply a in memory storage, which is
 * of course, not persistent.
 */
qx.Bootstrap.define("qx.bom.Storage", {
  statics : {
    __impl : null,

    /**
     * Get an instance of a local storage.
     * @return {qx.bom.storage.Web|qx.bom.storage.UserData|qx.bom.storage.Memory}
     *   An instance of a storage implementation.
     */
    getLocal : function() {
      return this.__impl.getLocal();
    },


    /**
     * Get an instance of a session storage.
     * @return {qx.bom.storage.Web|qx.bom.storage.UserData|qx.bom.storage.Memory}
     *   An instance of a storage implementation.
     */
    getSession : function() {
      return this.__impl.getSession();
    }
  },


  defer : function(statics) {
    // always use HTML5 web storage if available
    if (qx.core.Environment.get("html.storage.local")) {
      statics.__impl = qx.bom.storage.Web;
      // as fallback,use the userdata storage for IE5.5 - 8
    } else if (qx.core.Environment.get("html.storage.userdata")) { // IE <8 fallback
      statics.__impl = qx.bom.storage.UserData;
      // as last fallback, use a in memory storage (this one is not persistent)
    } else {
      statics.__impl = qx.bom.storage.Memory;
    }
  }
});