/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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

qx.Class.define("qx.io.local.CookieTransport",
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
     * @type static
     * @param vName {var} TODOC
     * @param vValue {var} TODOC
     * @return {var} TODOC
     */
    set : function(vName, vValue)
    {
      if (vValue === undefined) {
        return qx.io.local.CookieTransport.del(vName);
      }

      var vAll = qx.io.local.CookieTransport._getAll();
      vAll[vName] = vValue;
      this._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @type static
     * @param vName {var} TODOC
     * @return {var} TODOC
     */
    get : function(vName)
    {
      var vAll = qx.io.local.CookieTransport._getAll();

      return vAll[vName] || "";
    },


    /**
     * TODOC
     *
     * @type static
     * @param vName {var} TODOC
     * @return {void}
     */
    del : function(vName)
    {
      var vAll = qx.io.local.CookieTransport._getAll();
      delete vAll[vName];
      this._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @type static
     * @param vHash {var} TODOC
     * @return {void}
     */
    setAll : function(vHash)
    {
      var vAll = qx.io.local.CookieTransport._getAll();
      vAll = qx.lang.Object.mergeWith(vAll, vHash);
      qx.io.local.CookieTransport._setAll(vAll);
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    getAll : function() {
      return qx.io.local.CookieTransport._getAll();
    },


    /**
     * TODOC
     *
     * @type static
     * @param vHash {var} TODOC
     * @return {void}
     */
    replaceAll : function(vHash) {
      qx.io.local.CookieTransport._setAll(vHash);
    },


    /**
     * TODOC
     *
     * @type static
     * @return {void}
     */
    delAll : function() {
      qx.io.local.CookieTransport.replaceAll({});
    },




    /*
    ---------------------------------------------------------------------------
      LOW LEVEL INTERNAL METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    _getAll : function()
    {
      var vHash = {};
      var vCookie, vItems, vItem;

      for (var i=0; i<qx.io.local.CookieTransport.MAXCOOKIES; i++)
      {
        vCookie = qx.io.local.CookieApi.get(qx.io.local.CookieTransport.BASENAME + i);

        if (vCookie)
        {
          vItems = vCookie.split(qx.io.local.CookieTransport.ITEMSEPARATOR);

          for (var j=0, l=vItems.length; j<l; j++)
          {
            vItem = vItems[j].split(qx.io.local.CookieTransport.KEYVALUESEPARATOR);
            vHash[vItem[0]] = vItem[1];
          }
        }
      }

      return vHash;
    },


    /**
     * TODOC
     *
     * @type static
     * @param vHash {var} TODOC
     * @return {Boolean} TODOC
     */
    _setAll : function(vHash)
    {
      var vString = "";
      var vTemp;
      var vIndex = 0;

      for (var vName in vHash)
      {
        vTemp = vName + qx.io.local.CookieTransport.KEYVALUESEPARATOR + vHash[vName];

        if (vTemp.length > qx.io.local.CookieTransport.MAXSIZE)
        {
          qx.log.Logger.getClassLogger(qx.io.local.CookieTransport).debug("Could not store value of name '" + vName + "': Maximum size of " + qx.io.local.CookieTransport.MAXSIZE + "reached!");
          continue;
        }

        if ((qx.io.local.CookieTransport.ITEMSEPARATOR.length + vString.length + vTemp.length) > qx.io.local.CookieTransport.MAXSIZE)
        {
          qx.io.local.CookieTransport._setCookie(vIndex++, vString);

          if (vIndex == qx.io.local.CookieTransport.MAXCOOKIES)
          {
            qx.log.Logger.getClassLogger(qx.io.local.CookieTransport).debug("Failed to store cookie. Max cookie amount reached!", "error");
            return false;
          }

          vString = vTemp;
        }
        else
        {
          if (vString != "") {
            vString += qx.io.local.CookieTransport.ITEMSEPARATOR;
          }

          vString += vTemp;
        }
      }

      if (vString != "") {
        qx.io.local.CookieTransport._setCookie(vIndex++, vString);
      }

      while (vIndex < qx.io.local.CookieTransport.MAXCOOKIES) {
        qx.io.local.CookieTransport._delCookie(vIndex++);
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param vIndex {var} TODOC
     * @param vString {var} TODOC
     * @return {void}
     */
    _setCookie : function(vIndex, vString)
    {
      // qx.log.Logger.getClassLogger(qx.io.local.CookieTransport).debug("Store: " + vIndex + " = " + vString);
      qx.io.local.CookieApi.set(qx.io.local.CookieTransport.BASENAME + vIndex, vString);
    },


    /**
     * TODOC
     *
     * @type static
     * @param vIndex {var} TODOC
     * @return {void}
     */
    _delCookie : function(vIndex)
    {
      // qx.log.Logger.getClassLogger(qx.io.local.CookieTransport).debug("Delete: " + vIndex);
      qx.io.local.CookieApi.del(qx.io.local.CookieTransport.BASENAME + vIndex);
    }
  }
});
