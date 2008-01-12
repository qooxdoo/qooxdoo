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

/* ************************************************************************


************************************************************************ */

qx.Class.define("qx.io.local.CookieApi",
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
     * TODOC
     *
     * @type static
     * @param vName {var} TODOC
     * @return {null | var} TODOC
     */
    get : function(vName)
    {
      var start = document.cookie.indexOf(vName + "=");
      var len = start + vName.length + 1;

      if ((!start) && (vName != document.cookie.substring(0, vName.length))) {
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
     * TODOC
     *
     * @type static
     * @param vName {var} TODOC
     * @param vValue {var} TODOC
     * @param vExpires {var} TODOC
     * @param vPath {var} TODOC
     * @param vDomain {var} TODOC
     * @param vSecure {var} TODOC
     * @return {void}
     */
    set : function(vName, vValue, vExpires, vPath, vDomain, vSecure)
    {
      var today = new Date();
      today.setTime(today.getTime());

      // Generate cookie
      var vCookie = [ vName, "=", escape(vValue) ];

      if (vExpires)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_EXPIRES);
        vCookie.push("=");
        vCookie.push(new Date(today.getTime() + (vExpires * 1000 * 60 * 60 * 24)).toGMTString());
      }

      if (vPath)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_PATH);
        vCookie.push("=");
        vCookie.push(vPath);
      }

      if (vDomain)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_DOMAIN);
        vCookie.push("=");
        vCookie.push(vDomain);
      }

      if (vSecure)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_SECURE);
      }

      // Store cookie
      document.cookie = vCookie.join("");
    },


    /**
     * TODOC
     *
     * @type static
     * @param vName {var} TODOC
     * @param vPath {var} TODOC
     * @param vDomain {var} TODOC
     * @return {void}
     */
    del : function(vName, vPath, vDomain)
    {
      if (!qx.io.local.CookieApi.get(vName)) {
        return;
      }

      // Generate cookie
      var vCookie = [ vName, "=" ];

      if (vPath)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_PATH);
        vCookie.push("=");
        vCookie.push(vPath);
      }

      if (vDomain)
      {
        vCookie.push(";");
        vCookie.push(qx.io.local.CookieApi.STR_DOMAIN);
        vCookie.push("=");
        vCookie.push(vDomain);
      }

      vCookie.push(";");
      vCookie.push(qx.io.local.CookieApi.STR_EXPIRES);
      vCookie.push("=");
      vCookie.push(qx.io.local.CookieApi.STR_DELDATA);

      // Store cookie
      document.cookie = vCookie.join("");
    }
  }
});
