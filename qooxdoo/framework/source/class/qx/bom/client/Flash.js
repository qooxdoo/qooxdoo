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

#require(qx.bom.client.Platform)

************************************************************************ */

/**
 * Flash detection
 */
qx.Class.define("qx.bom.client.Flash",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Boolean} If Flash support is available */
    AVAILABLE : false,

    /** {String} Full version string with multiple dots (major.minor.revision) e.g. 1.8.1, 8.5.4, ... */
    FULLVERSION : "0.0.0",

    /** {String} Revision string e.g. 0, 124, ... */
    REVISION : "0",

    /** {Float} Version of the installed flash player e.g. 9.0, 6.0, ... */
    VERSION : 0.0,

    /** {Boolean} Whether the system supports express installation */
    EXPRESSINSTALL : false,

    /** {Boolean} Whether the flash version uses the new security model or not (since 9.0.151.0 && 10.0.12.36) */
    STRICT_SECURITY_MODEL : false,

    _cachedSupportsVersion : {},

    /**
     * If the system support the given version of Flash(TM) movie.
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
          var diff = parseInt(system[i]) - parseInt(splitInput[i]);
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
     * Internal initialize helper
     *
     * @return {void}
     * @signature function()
     */
    __init : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        if (!window.ActiveXObject) {
          return;
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

        this.__store(full);
      },

      "default" : function()
      {
        if (!navigator.plugins || typeof navigator.plugins["Shockwave Flash"] !== "object") {
          return;
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

        this.__store(full);
      }
    }),


    /**
     * Internal storage helper
     *
     * @param full {String} Full version string
     * @return {void}
     */
    __store : function(full)
    {
      this.FULLVERSION = full.join(".");
      this.VERSION = parseFloat(full);
      this.AVAILABLE = this.VERSION > 0;
      this.REVISION = full[full.length-1];

      if (full[0] < 10) {
        this.STRICT_SECURITY_MODEL = this.supportsVersion("9.0.151");
      } else {
        this.STRICT_SECURITY_MODEL = this.supportsVersion("10.0.12");
      }

      var platform = qx.bom.client.Platform;
      this.EXPRESSINSTALL = (platform.WIN || platform.MAC) && this.supportsVersion("6.0.65");
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
