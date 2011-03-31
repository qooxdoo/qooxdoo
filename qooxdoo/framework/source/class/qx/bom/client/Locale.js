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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's selected locale.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
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

    /**
     * {String} The name of the system locale e.g. "de" when the full
     * locale is "de_AT"
     * @deprecated since 1.4: See qx.core.Environment
     */
    LOCALE : "",

    /**
     * {String} The name of the variant for the system locale e.g.
     * "at" when the full locale is "de_AT"
     * @deprecated since 1.4: See qx.core.Environment
     */
    VARIANT : "",


    /**
     * The name of the system locale e.g. "de" when the full locale is "de_AT"
     * @return {String} The current locale
     * @internal
     */
    getLocale : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();

      var index = locale.indexOf("-");
      if (index != -1) {
        locale = locale.substr(0, index);
      }

      return locale;
    },


    /**
     * The name of the variant for the system locale e.g. "at" when the
     * full locale is "de_AT"
     *
     * @return {String} The locales variant.
     * @internal
     */
    getVariant : function() {
      var locale = qx.bom.client.Locale.__getNavigatorLocale();
      var variant = "";

      var index = locale.indexOf("-");

      if (index != -1) {
        variant = locale.substr(index + 1);
      }

      return variant;
    },


    /**
     * Internal helper for accessing the navigators language.
     *
     * @return {String} The language set by the navigator.
     */
    __getNavigatorLocale : function()
    {
      var locale = (navigator.userLanguage || navigator.language || "");

      // Android Bug: Android does not return the system language from the
      // navigator language. Try to parse the language from the userAgent.
      // See http://code.google.com/p/android/issues/detail?id=4641
      if (qx.bom.client.OperatingSystem.getName() == "android")
      {
        var match = /(\w{2})-(\w{2})/i.exec(navigator.userAgent);
        if (match) {
          locale = match[0];
        }
      }

      return locale.toLowerCase();
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  /**
   * @lint ignoreUndefined(qxvariants)
   */
  defer : function(statics) {
    // @deprecated since 1.4 (whole defer block)
    statics.LOCALE = statics.getLocale();
    statics.VARIANT = statics.getVariant();

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      var keys = ["LOCALE","VARIANT"];
      for (var i = 0; i < keys.length; i++) {
        // check if __defineGetter__ is available
        if (statics.__defineGetter__) {
          var constantValue = statics[keys[i]];
          statics.__defineGetter__(keys[i], qx.Bootstrap.bind(function(key, c) {
            var warning =
              "The constant '"+ key + "' of '" + statics.classname + "'is deprecated: " +
              "Please check the API documentation of qx.core.Environment."
            if (qx.dev && qx.dev.StackTrace) {
              warning += "\nTrace:" + qx.dev.StackTrace.getStackTrace().join("\n")
            }
            qx.Bootstrap.warn(warning);
            return c;
          }, statics, keys[i], constantValue));
        }
      }
    }
  }
});
