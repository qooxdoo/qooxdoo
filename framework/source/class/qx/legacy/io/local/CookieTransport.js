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

/**
 * @deprecated
 */
qx.Class.define("qx.legacy.io.local.CookieTransport",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    BASENAME : "qx",
    ITEMSEPARATOR : "&",
    KEYVALUESEPARATOR : "=",
    MAXCOOKIES : 20,
    MAXSIZE : 4096,




    /*
    ---------------------------------------------------------------------------
      USER APPLICATION METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @param vName {var} TODOC
     * @param vValue {var} TODOC
     * @return {var} TODOC
     */
    set : function(vName, vValue)
    {
      if (vValue === undefined) {
        return qx.legacy.io.local.CookieTransport.del(vName);
      }

      var vAll = qx.legacy.io.local.CookieTransport._getAll();
      vAll[vName] = vValue;
      this._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @param vName {var} TODOC
     * @return {var} TODOC
     */
    get : function(vName)
    {
      var vAll = qx.legacy.io.local.CookieTransport._getAll();

      return vAll[vName] || "";
    },


    /**
     * TODOC
     *
     * @param vName {var} TODOC
     * @return {void}
     */
    del : function(vName)
    {
      var vAll = qx.legacy.io.local.CookieTransport._getAll();
      delete vAll[vName];
      this._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @param vHash {var} TODOC
     * @return {void}
     */
    setAll : function(vHash)
    {
      var vAll = qx.legacy.io.local.CookieTransport._getAll();
      vAll = qx.lang.Object.mergeWith(vAll, vHash);
      qx.legacy.io.local.CookieTransport._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    getAll : function() {
      return qx.legacy.io.local.CookieTransport._getAll();
    },


    /**
     * TODOC
     *
     * @param vHash {var} TODOC
     * @return {void}
     */
    replaceAll : function(vHash) {
      qx.legacy.io.local.CookieTransport._setAll(vHash);
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    delAll : function() {
      qx.legacy.io.local.CookieTransport.replaceAll({});
    },




    /*
    ---------------------------------------------------------------------------
      LOW LEVEL INTERNAL METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @return {var} TODOC
     */
    _getAll : function()
    {
      var vHash = {};
      var vCookie, vItems, vItem;

      for (var i=0; i<qx.legacy.io.local.CookieTransport.MAXCOOKIES; i++)
      {
        vCookie = qx.legacy.io.local.CookieApi.get(qx.legacy.io.local.CookieTransport.BASENAME + i);

        if (vCookie)
        {
          vItems = vCookie.split(qx.legacy.io.local.CookieTransport.ITEMSEPARATOR);

          for (var j=0, l=vItems.length; j<l; j++)
          {
            vItem = vItems[j].split(qx.legacy.io.local.CookieTransport.KEYVALUESEPARATOR);
            vHash[vItem[0]] = vItem[1];
          }
        }
      }

      return vHash;
    },


    /**
     * TODOC
     *
     * @param vHash {var} TODOC
     */
    _setAll : function(vHash)
    {
      var vString = "";
      var vTemp;
      var vIndex = 0;

      for (var vName in vHash)
      {
        vTemp = vName + qx.legacy.io.local.CookieTransport.KEYVALUESEPARATOR + vHash[vName];

        if (vTemp.length > qx.legacy.io.local.CookieTransport.MAXSIZE)
        {
          qx.log.Logger.debug(this, "Could not store value of name '" + vName + "': Maximum size of " + qx.legacy.io.local.CookieTransport.MAXSIZE + "reached!");
          continue;
        }

        if ((qx.legacy.io.local.CookieTransport.ITEMSEPARATOR.length + vString.length + vTemp.length) > qx.legacy.io.local.CookieTransport.MAXSIZE)
        {
          qx.legacy.io.local.CookieTransport._setCookie(vIndex++, vString);

          if (vIndex == qx.legacy.io.local.CookieTransport.MAXCOOKIES)
          {
            qx.log.Logger.debug(this, "Failed to store cookie. Max cookie amount reached!", "error");
            return false;
          }

          vString = vTemp;
        }
        else
        {
          if (vString != "") {
            vString += qx.legacy.io.local.CookieTransport.ITEMSEPARATOR;
          }

          vString += vTemp;
        }
      }

      if (vString != "") {
        qx.legacy.io.local.CookieTransport._setCookie(vIndex++, vString);
      }

      while (vIndex < qx.legacy.io.local.CookieTransport.MAXCOOKIES) {
        qx.legacy.io.local.CookieTransport._delCookie(vIndex++);
      }
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @param vString {var} TODOC
     * @return {void}
     */
    _setCookie : function(vIndex, vString)
    {
      // qx.log.Logger.debug(this, "Store: " + vIndex + " = " + vString);
      qx.legacy.io.local.CookieApi.set(qx.legacy.io.local.CookieTransport.BASENAME + vIndex, vString);
    },


    /**
     * TODOC
     *
     * @param vIndex {var} TODOC
     * @return {void}
     */
    _delCookie : function(vIndex)
    {
      // qx.log.Logger.debug(this, "Delete: " + vIndex);
      qx.legacy.io.local.CookieApi.del(qx.legacy.io.local.CookieTransport.BASENAME + vIndex);
    }
  }
});
