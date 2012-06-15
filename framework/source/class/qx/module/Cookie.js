/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Cookie handling module
 */
qx.Bootstrap.define("qx.module.Cookie", {
  statics :
  {
    /**
     * Returns the string value of a cookie.
     *
     * @attachStatic {q, cookie.get}
     * @param key {String} The key for the saved string value.
     * @return {String|null} Returns the saved string value if the cookie
     *    contains a value for the key, otherwise <code>null</code>
     * @signature function(key)
     */
    get : qx.bom.Cookie.get,


    /**
     * Sets the string value of a cookie.
     *
     * @attachStatic {q, cookie.set}
     * @param key {String} The key for the string value.
     * @param value {String} The string value.
     * @param expires {Number?null} Expires directive value in days starting from now,
     *    or <code>null</code> if the cookie should be deleted when the browser
     *    is closed.
     * @param path {String?null} Path value.
     * @param domain {String?null} Domain value.
     * @param secure {Boolean?null} Secure flag.
     * @signature function(key, value, expires, path, domain, secure)
     */
    set : qx.bom.Cookie.set,


    /**
     * Deletes the string value of a cookie.
     *
     * @attachStatic {q, cookie.del}
     * @param key {String} The key for the string value.
     * @param path {String?null} Path value.
     * @param domain {String?null} Domain value.
     * @signature function(key, path, domain)
     */
    del : qx.bom.Cookie.del
  },


  defer : function(statics) {
    q.$attachStatic({
      "cookie" : {
        get: statics.get,
        set: statics.set,
        del: statics.del
      }
    });
  }
});