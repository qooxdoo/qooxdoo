/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)

************************************************************************ */

/* *********************************************************************
************************************************************************ */

/**
 * Common requirement checks for unit tests. Example:
 *
 * <pre class="javascript">
 * testBackend : function()
 * {
 *   this.require(["http", "php"]); // test will be skipped unless all conditions are met
 *   // test code goes here
 * }
 * </pre>
 *
 * @use(feature-checks)
 * @ignore(qx.application.Standalone)
 * @ignore(qx.application.Inline)
 * @ignore(qx.application.Native)
 *
 * @asset(qx/test/xmlhttp/php_version.php)
 */
qx.Mixin.define("qx.dev.unit.MRequirements", {

  include : [qx.dev.unit.MRequirementsBasic],

  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  statics :
  {
    /** @type {Boolean} Result of {@link #hasPhp}. Stored as class member to avoid
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
     * Checks if the application has been loaded over HTTP.
     *
     * @return {Boolean} <code>true</code> if HTTP is currently used
     */
    hasHttp : function()
    {
      return document.location.protocol.indexOf("http") == 0;
    },


    /**
     * Checks if the server supports PHP.
     *
     * @return {Boolean} <code>true</code> if PHP is supported by the backend
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
     * @return {Boolean} <code>true</code> if the application is a standalone (GUI)
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
     * @return {Boolean} <code>true</code> if the application is an inline application
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
     * @return {Boolean} <code>true</code> if the application is a native application
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
     * @return {Boolean} <code>true</code> if the browser is Google Chrome
     */
    hasChrome : function()
    {
      return qx.core.Environment.get("browser.name") === "chrome";
    },


    /**
     * Checks if the application is running in Firefox
     *
     * @return {Boolean} <code>true</code> if the browser is Firefox
     */
    hasFirefox : function()
    {
      return qx.core.Environment.get("browser.name") === "firefox";
    },


    /**
     * Checks if the application is running in a browser using the Gecko engine
     *
     * @return {Boolean} <code>true</code> if the browser engine is Mozilla Gecko
     */
    hasGecko : function()
    {
      return qx.core.Environment.get("engine.name") == "gecko";
    },


    /**
     * Checks if the application is running in Internet Explorer
     *
     * @return {Boolean} <code>true</code> if the browser is Internet Explorer
     */
    hasIe : function()
    {
      return qx.core.Environment.get("browser.name") === "ie";
    },


    /**
     * Checks if the application is running in a browser using the MSHTML engine
     *
     * @return {Boolean} <code>true</code> if the browser engine is MSHTML
     */
    hasMshtml : function()
    {
      return qx.core.Environment.get("engine.name") == "mshtml";
    },


    /**
     * Checks if the application is running in a browser using the Opera engine
     *
     * @return {Boolean} <code>true</code> if the browser engine is Opera
     */
    hasOpera : function()
    {
      return qx.core.Environment.get("engine.name") == "opera";
    },


    /**
     * Checks if the application is running in a browser using the Webkit engine
     *
     * @return {Boolean} <code>true</code> if the browser engine is Webkit
     */
    hasWebkit : function()
    {
      return qx.core.Environment.get("engine.name") == "webkit";
    },


    /**
     * Checks if the application is NOT running on OS X
     *
     * @return {Boolean} <code>true</code> if the operating system is NOT OX X
     */
    hasNoOsx : function()
    {
      return (qx.core.Environment.get("os.name") === "osx"?false:true);
    },


    /**
     * Checks if the application is running on Windows 7
     *
     * @return {Boolean} <code>false</code> if operating system is Windows 7
     */
    hasNoWin7 : function()
    {
      var isWin7 = (qx.core.Environment.get("os.name") === "win" && qx.core.Environment.get("os.version") === "7");
      return (isWin7 ? false : true);
    }
  }

});
