/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

/**
 * This class contains all Flash detection.
 *
 * It is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @require(qx.bom.client.OperatingSystem)
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
     * Checks if the flash plugin is available.
     * @return {Boolean} <code>true</code>, if flash is available.
     * @internal
     */
    isAvailable : function() {
      return parseFloat(qx.bom.client.Flash.getVersion()) > 0;
    },


    /**
     * Checks for the version of flash and returns it as a string. If the
     * version could not be detected, an empty string will be returned.
     *
     * @return {String} The version number as string.
     * @internal
     */
    getVersion : function()
    {
      if (navigator.plugins && typeof navigator.plugins["Shockwave Flash"] === "object") {
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
      else if (window.ActiveXObject) {
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
          catch(ex1)
          {
            if (full[0] == 6) {
              fp6Crash = true;
            }
          }

          if (!fp6Crash)
          {
            try {
              obj = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            } catch(ex1) {}
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
      }
      else {
        return "";
      }
    },


    /**
     * Checks if the flash installation is an express installation.
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

  defer : function(statics) {
    qx.core.Environment.add("plugin.flash", statics.isAvailable);
    qx.core.Environment.add("plugin.flash.version", statics.getVersion);
    qx.core.Environment.add("plugin.flash.express", statics.getExpressInstall);
    qx.core.Environment.add("plugin.flash.strictsecurity", statics.getStrictSecurityModel);
  }
});
