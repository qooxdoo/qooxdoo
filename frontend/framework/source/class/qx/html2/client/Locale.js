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

************************************************************************ */

/* ************************************************************************

#module(client)

************************************************************************ */

qx.Class.define("qx.html2.client.Locale",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    LOCALE : "en",
    VARIANT : "",


    /**
     * Internal initialize helper
     */
    __init : function()
    {
      var locale = (qx.html2.client.Engine.MSHTML ? navigator.userLanguage : navigator.language).toLowerCase();
      var variant = "";

      var index = locale.indexOf("-");
      if (index != -1)
      {
        variant = vBrowserLocale.substr(index + 1);
        locale = vBrowserLocale.substr(0, index);
      }

      this.LOCALE = locale;
      this.VARIANT = variant;
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
