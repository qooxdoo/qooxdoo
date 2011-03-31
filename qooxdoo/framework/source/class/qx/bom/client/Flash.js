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

   ======================================================================

   This class contains code based on the following work:

   * SWFFix
     http://www.swffix.org
     Version 0.3 (r17)

     Copyright:
       (c) 2007 SWFFix developers

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Geoff Stearns
       * Michael Williams
       * Bobby van der Sluis

************************************************************************ */

/* ************************************************************************

#require(qx.bom.client.OperatingSystem)

************************************************************************ */

/**
 * This class contains all Flash detection.
 *
 * It is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Flash",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {Boolean} If Flash support is available
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    AVAILABLE : false,

    /**
     * {String} Full version string with multiple dots (major.minor.revision) e.g. 1.8.1, 8.5.4, ...
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    FULLVERSION : "0.0.0",

    /**
     * {String} Revision string e.g. 0, 124, ...
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    REVISION : "0",

    /**
     * {Float} Version of the installed flash player e.g. 9.0, 6.0, ...
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    VERSION : 0.0,

    /**
     * {Boolean} Whether the system supports express installation
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    EXPRESSINSTALL : false,

    /**
     * {Boolean} Whether the flash version uses the new security model or
     * not (since 9.0.151.0 && 10.0.12.36)
     * @deprecated since 1.4: Please take a look at qx.core.Environment.get
     */
    STRICT_SECURITY_MODEL : false,


    /**
     * Checks if the flash plugin is available.
     * @return {Boolean} <code>true</code>, if flash is available.
     * @internal
     */
    isAvailable : function() {
      return parseFloat(qx.bom.client.Flash.getVersion()) > 0;
    },


    /**
     * Checks for the version of flash and returns it as a string. If the
     * version could not be detected, an empty string will be returnd.
     *
     * @return {String} The version number as string.
     * @internal
     */
    getVersion : function() {
      if (qx.bom.client.Engine.getName() == "mshtml") {
        if (!window.ActiveXObject) {
          return "";
        }

        var full = [0,0,0];
        var fp6Crash = false;

        try {
          var obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        }
        catch(ex)
        {
          try
          {
            var obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
            full = [ 6, 0, 21 ];
            obj.AllowScriptAccess = "always";
          }
          catch(ex)
          {
            if (full[0] == 6) {
              fp6Crash = true;
            }
          }

          if (!fp6Crash)
          {
            try {
              obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            } catch(ex) {}
          }
        }

        if (!fp6Crash && typeof obj == "object")
        {
          var info = obj.GetVariable("$version");

          if (typeof info != "undefined")
          {
            info = info.split(" ")[1].split(",");
            full[0] = parseInt(info[0], 10);
            full[1] = parseInt(info[1], 10);
            full[2] = parseInt(info[2], 10);
          }
        }

        return full.join(".");

      // all other browsers
      } else {
        if (!navigator.plugins || typeof navigator.plugins["Shockwave Flash"] !== "object") {
          return "";
        }

        var full = [0,0,0];
        var desc = navigator.plugins["Shockwave Flash"].description;

        if (typeof desc != "undefined")
        {
          desc = desc.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
          full[0] = parseInt(desc.replace(/^(.*)\..*$/, "$1"), 10);
          full[1] = parseInt(desc.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
          full[2] = /r/.test(desc) ? parseInt(desc.replace(/^.*r(.*)$/, "$1"), 10) : 0;
        }

        return full.join(".");
      }
    },


    /**
     * Checks if the flash installation is an expres installation.
     *
     * @return {Boolean} <code>true</code>, if its an express installation.
     * @internal
     */
    getExpressInstall : function() {
      var availableVersion = qx.bom.client.Flash.getVersion();
      if (availableVersion == "") {
        return false;
      }

      var os = qx.bom.client.OperatingSystem.getName();
      return (os == "win" || os == "osx") &&
        qx.bom.client.Flash.__supportsVersion("6.0.65", availableVersion);
    },


    /**
     * Checks if a strict security model is available.
     *
     * @return {Boolean} <code>true</code>, if its available.
     * @internal
     */
    getStrictSecurityModel : function() {
      var version = qx.bom.client.Flash.getVersion();
      if (version == "") {
        return false;
      }
      var full = version.split(".");

      if (full[0] < 10) {
        return qx.bom.client.Flash.__supportsVersion("9.0.151", version);
      } else {
        return qx.bom.client.Flash.__supportsVersion("10.0.12", version);
      }
    },


    /**
     * Storage for supported Flash versions.
     *
     * @internal
     */
    _cachedSupportsVersion : {},


    /**
     * If the system support the given version of Flash(TM) movie.
     *
     * @deprecated aince 1.4
     *
     * @param input {String} Version string e.g. 6.0.64
     * @return {Boolean} <code>true</code> when supported, otherwise <code>false</code>
     */
    supportsVersion : function(input)
    {
      if (typeof this._cachedSupportsVersion[input] === "boolean")
      {
        return this._cachedSupportsVersion[input];
      }
      else
      {
        var splitInput = input.split(".");
        var system = this.FULLVERSION.split(".");

        for (var i=0; i<splitInput.length; i++)
        {
          var diff = parseInt(system[i], 10) - parseInt(splitInput[i], 10);
          if (diff > 0) {
            return (this._cachedSupportsVersion[input] = true);
          } else if (diff < 0) {
            return (this._cachedSupportsVersion[input] = false);
          }
        }

        return (this._cachedSupportsVersion[input] = true);
      }
    },


    /**
     * Check if the first given version is supported by either the current
     * version available on the system or the optional given second parameter.
     *
     * @param input {String} The version to check.
     * @param availableVersion {String} The version available on the current
     *   system.
     * @return {Boolean} <code>true</code>, if the version is supported.
     */
    __supportsVersion : function(input, availableVersion) {
      var splitInput = input.split(".");
      var system = availableVersion || qx.bom.client.Flash.getVersion();
      system = system.split(".");

      for (var i=0; i<splitInput.length; i++)
      {
        var diff = parseInt(system[i], 10) - parseInt(splitInput[i], 10);
        if (diff > 0) {
          return true;
        } else if (diff < 0) {
          return false;
        }
      }
      return true;
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
    statics.FULLVERSION = statics.getVersion();
    statics.VERSION = parseFloat(statics.FULLVERSION);
    statics.AVAILABLE = statics.isAvailable();
    var full = statics.FULLVERSION.split(".");
    statics.REVISION = full[full.length-1];
    statics.STRICT_SECURITY_MODEL = statics.getStrictSecurityModel();
    statics.EXPRESSINSTALL = statics.getExpressInstall();

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // add @deprecation warnings
      var keys = ["FULLVERSION", "VERSION", "AVAILABLE",
        "REVISION", "STRICT_SECURITY_MODEL", "EXPRESSINSTALL"];
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
