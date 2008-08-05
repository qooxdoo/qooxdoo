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

************************************************************************ */

/* ************************************************************************

#require(qx.bom.client.Engine)

************************************************************************ */

/**
 * This class comes with all relevant informations regarding
 * the client's selected locale.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 */
qx.Bootstrap.define("qx.bom.client.Locale",
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
     * @return {void}
     */
    __init : function()
    {
      var locale = (qx.bom.client.Engine.MSHTML ? navigator.userLanguage : navigator.language).toLowerCase();
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
