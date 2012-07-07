/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* *********************************************************************
#asset(qx/test/xmlhttp/php_version.php)
#use(feature-checks)
#optional(qx.application.Standalone)
#optional(qx.application.Inline)
#optional(qx.application.Native)
************************************************************************ */

/**
 * Adds support for verification of infrastructure requirements to unit test
 * classes.
 */
qx.Mixin.define("qx.dev.unit.MRequirements", {


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics :
  {
    /** {Boolean} Result of {@link #hasPhp}. Stored as class member to avoid
     * repeating the check. */
    __hasPhp : null
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {

    /**
     * Verifies a list of infrastructure requirements by checking for
     * corresponding "has" methods. If no such method was found,
     * {@link qx.core.Environment} will be checked for a key matching the given
     * feature name. Note that asynchronous environment checks are not supported!
     *
     * See the manual for further details:
     * {@link http://manual.qooxdoo.org/${qxversion}/pages/development/frame_apps_testrunner.html#defining-test-requirements}
     *
     * @throws RequirementError if any requirement check returned
     * <code>false</code>
     * @throws if no valid check was found for a feature.
     *
     * @param featureList {String[]} List of infrastructure requirements
     */
    require : function(featureList) {

      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertArray(featureList);
      }

      for (var i=0,l=featureList.length; i<l; i++) {
        var feature = featureList[i];
        var hasMethodName = "has" + qx.lang.String.capitalize(feature);

        if (this[hasMethodName]) {
          if (this[hasMethodName]() === true) {
            continue;
          }
          else {
            throw new qx.dev.unit.RequirementError(feature);
          }
        }

        if (qx.core.Environment.getChecks()[feature]) {
          var envValue = qx.core.Environment.get(feature);
          if (envValue === true) {
            continue;
          }
          if (envValue === false) {
            throw new qx.dev.unit.RequirementError(feature);
          }
          else {
            throw new Error("The Environment key " + feature + " cannot be used"
             + " as a Test Requirement since its value is not boolean!");
          }
        }

        if (qx.core.Environment.getAsyncChecks()[feature]) {
          throw new Error('Unable to verify requirement ' + feature + ': '
          + 'Asynchronous environment checks are not supported!');
        }

        throw new Error('Unable to verify requirement: No method "'
          + hasMethodName + '" or valid Environment key "' + feature + '" found');
      }
    },



    /**
     * Checks if the application has been loaded over HTTP.
     *
     * @return {Boolean} Whether HTTP is currently used
     */
    hasHttp : function()
    {
      return document.location.protocol.indexOf("http") == 0;
    },


    /**
     * Checks if the server supports PHP.
     *
     * @return {Boolean} Whether PHP is supported by the backend
     */
    hasPhp : function()
    {
      if (qx.dev.unit.MRequirements.__hasPhp != null) {
        return qx.dev.unit.MRequirements.__hasPhp;
      }

      var url = qx.util.ResourceManager.getInstance().toUri("qx/test/xmlhttp/php_version.php");
      var req = new qx.bom.request.Xhr();

      req.onload = qx.lang.Function.bind(function() {
        try {
          qx.lang.Json.parse(req.responseText);
          qx.dev.unit.MRequirements.__hasPhp = true;
        } catch(ex) {
          qx.dev.unit.MRequirements.__hasPhp = false;
        }
      }, this);

      req.onerror = req.abort = qx.lang.Function.bind(function() {
        qx.dev.unit.MRequirements.__hasPhp = false;
      }, this);

      req.open("POST", url, false);
      try {
        req.send();
      } catch(ex) {
        qx.dev.unit.MRequirements.__hasPhp = false;
      }

      return qx.dev.unit.MRequirements.__hasPhp;
    },


    /**
     * Checks if the application extends qx.application.Standalone
     *
     * @return {Boolean} Whether the application is a standalone (GUI)
     * application
     */
    hasGuiApp : function()
    {
      try {
        return qx.core.Init.getApplication() instanceof qx.application.Standalone;
      } catch(ex) {
        return false;
      }
    },


    /**
     * Checks if the application extends qx.application.Inline
     *
     * @return {Boolean} Whether the application is an inline application
     */
    hasInlineApp : function()
    {
      try {
        return qx.core.Init.getApplication() instanceof qx.application.Inline;
      } catch(ex) {
        return false;
      }
    },


    /**
     * Checks if the application extends qx.application.Native
     *
     * @return {Boolean} Whether the application is a native application
     */
    hasNativeApp : function()
    {
      try {
        return qx.core.Init.getApplication() instanceof qx.application.Native;
      } catch(ex) {
        return false;
      }
    },


    /**
     * Checks if the application is running in Google Chrome
     *
     * @return {Boolean} Whether the browser is Google Chrome
     */
    hasChrome : function()
    {
      return qx.core.Environment.get("browser.name") === "chrome";
    },


    /**
     * Checks if the application is running in Firefox
     *
     * @return {Boolean} Whether the browser is Firefox
     */
    hasFirefox : function()
    {
      return qx.core.Environment.get("browser.name") === "firefox";
    },


    /**
     * Checks if the application is running in a browser using the Gecko engine
     *
     * @return {Boolean} Whether the browser engine is Mozilla Gecko
     */
    hasGecko : function()
    {
      return qx.core.Environment.get("engine.name") == "gecko";
    },


    /**
     * Checks if the application is running in Internet Explorer
     *
     * @return {Boolean} Whether the browser is Internet Explorer
     */
    hasIe : function()
    {
      return qx.core.Environment.get("browser.name") === "ie";
    },


    /**
     * Checks if the application is running in a browser using the MSHTML engine
     *
     * @return {Boolean} Whether the browser engine is MSHTML
     */
    hasMshtml : function()
    {
      return qx.core.Environment.get("engine.name") == "mshtml";
    },


    /**
     * Checks if the application is running in a browser using the Opera engine
     *
     * @return {Boolean} Whether the browser engine is Opera
     */
    hasOpera : function()
    {
      return qx.core.Environment.get("engine.name") == "opera";
    },


    /**
     * Checks if the application is running in a browser using the Webkit engine
     *
     * @return {Boolean} Whether the browser engine is Webkit
     */
    hasWebkit : function()
    {
      return qx.core.Environment.get("engine.name") == "webkit";
    },


    /**
     * Checks if the application is controlled by Selenium
     *
     * @return {Boolean} Whether the application is controlled by Selenium
     */
    hasNoSelenium : function()
    {
      var win = window.top || window;
      var opener = win.opener || win;
      try {
        // Firefox denies permission here
        return typeof opener.selenium == "undefined";
      }
      catch(ex) {
        return win.name.indexOf("selenium") < 0;
      }
    }
  }

});
