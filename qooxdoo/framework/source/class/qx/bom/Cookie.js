/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Class.define("qx.bom.Cookie",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    STR_EXPIRES : "expires",
    STR_PATH : "path",
    STR_DOMAIN : "domain",
    STR_SECURE : "secure",
    STR_DELDATA : "Thu, 01-Jan-1970 00:00:01 GMT",

    /*
    ---------------------------------------------------------------------------
      USER APPLICATION METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the string value of a cookie.
     *
     * @param key {String} The key for the saved string value.
     * @return {null | String} Returns the saved string value, if the cookie 
     *    contains a value for the key, <code>null</code> otherwise.
     */
    get : function(key)
    {
      var start = document.cookie.indexOf(key + "=");
      var len = start + key.length + 1;

      if ((!start) && (key != document.cookie.substring(0, key.length))) {
        return null;
      }

      if (start == -1) {
        return null;
      }

      var end = document.cookie.indexOf(";", len);

      if (end == -1) {
        end = document.cookie.length;
      }

      return unescape(document.cookie.substring(len, end));
    },


    /**
     * Sets the string value of a cookie.
     *
     * @param key {String} The key for the string value.
     * @param value {String} The string value.
     * @param expires {Number?null} The expires in days starting from now, 
     *    or <code>null</code> if the cookie should deleted after browser close.
     * @param path {String?null} Path value.
     * @param domain {String?null} Domain value.
     * @param secure {Boolean?null} Secure flag.
     * @return {void}
     */
    set : function(key, value, expires, path, domain, secure)
    {
      var today = new Date();
      today.setTime(today.getTime());

      // Generate cookie
      var vCookie = [ key, "=", escape(value) ];

      if (expires)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_EXPIRES);
        vCookie.push("=");
        vCookie.push(new Date(today.getTime() + (expires * 1000 * 60 * 60 * 24)).toGMTString());
      }

      if (path)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_PATH);
        vCookie.push("=");
        vCookie.push(path);
      }

      if (domain)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_DOMAIN);
        vCookie.push("=");
        vCookie.push(domain);
      }

      if (secure)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_SECURE);
      }

      // Store cookie
      document.cookie = vCookie.join("");
    },


    /**
     * Deletes the string value of a cookie.
     *
     * @param key {String} The key for the string value.
     * @param path {String?null} Path value.
     * @param domain {String?null} Domain value.
     * @return {void}
     */
    del : function(key, path, domain)
    {
      if (!qx.bom.Cookie.get(key)) {
        return;
      }

      // Generate cookie
      var vCookie = [ key, "=" ];

      if (path)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_PATH);
        vCookie.push("=");
        vCookie.push(path);
      }

      if (domain)
      {
        vCookie.push(";");
        vCookie.push(qx.bom.Cookie.STR_DOMAIN);
        vCookie.push("=");
        vCookie.push(domain);
      }

      vCookie.push(";");
      vCookie.push(qx.bom.Cookie.STR_EXPIRES);
      vCookie.push("=");
      vCookie.push(qx.bom.Cookie.STR_DELDATA);

      // Store cookie
      document.cookie = vCookie.join("");
    }
  }
});
