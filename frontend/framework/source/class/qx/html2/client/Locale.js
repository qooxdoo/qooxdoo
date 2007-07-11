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
#require(qx.html2.client.Engine)

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

    /** {String} The name of the system locale e.g. "de" when the full locale is "de_AT" */
    LOCALE : "",

    /** {String} The name of the variant for the system locale e.g. "at" when the full locale is "de_AT" */
    VARIANT : "",


    /**
     * Internal initialize helper
     *
     * @type static
     * @return {void} 
     */
    __init : function()
    {
      var locale = (qx.html2.client.Engine.MSHTML ? navigator.userLanguage : navigator.language).toLowerCase();
      var variant = "";

      var index = locale.indexOf("-");

      if (index != -1)
      {
        variant = locale.substr(index + 1);
        locale = locale.substr(0, index);
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
