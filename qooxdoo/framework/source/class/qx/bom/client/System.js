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
     * Alexander Back (aback)

************************************************************************ */

/* ************************************************************************

#require(qx.bom.client.Platform)
#require(qx.bom.client.Engine)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's operating system. This class is examining the userAgent of
 * the browser's build-in navigator object. Currently there are more than
 * <b>4000</b> (in words: four thousand) different userAgent strings, so this class
 * aims to target only the relevant ones. However this list is not meant to be
 * complete.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 *
 * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
 */
qx.Bootstrap.define("qx.bom.client.System",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /**
     * {String} The name of the operating system
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    NAME : "",


// WINDOWS

    /**
     * {Boolean} Flag to detect if the client system has an installed Service Pack 1
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    SP1 : false,

    /**
     * {Boolean} Flag to detect if the client system has an installed Service Pack 2 (only available in IE)
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    SP2 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows 95
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WIN95 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows 98
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WIN98 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows ME
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WINME : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows NT4
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WINNT4 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows 2000
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WIN2000 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows XP
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WINXP : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows 2003 (Server)
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WIN2003 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows Vista
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WINVISTA : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows 7
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WIN7 : false,

    /**
     * {Boolean} Flag to detect if the client system is Windows CE
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    WINCE : false,


// Linux

    /**
     * {Boolean} Flag to detect if the client system is Linux
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    LINUX : false,

    /**
     * {Boolean} Flag to detect if the client system is SunOS
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    SUNOS : false,

    /**
     * {Boolean} Flag to detect if the client system is FreeBSD
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    FREEBSD : false,

    /**
     * {Boolean} Flag to detect if the client system is NetBSD
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    NETBSD : false,

    /**
     * {Boolean} Flag to detect if the client system is OpenBSD
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    OPENBSD : false,

// osx

    /**
     * {Boolean} Flag to detect if the client system is Mac OS X
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    OSX : false,

    /**
     * {Boolean} Flag to detect if the client system is Mac OS 9
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    OS9 : false,

// mobile

    /**
     * {Boolean} Flag to detect if the client system is an iPhone or iPod touch
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    IPHONE : false,

    /**
     * {Boolean} Flag to detect if the client system is an iPad
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    IPAD : false,

    /**
     * {Boolean} Flag to detect if the client system is Symbian
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    SYMBIAN : false,

// Hardware

    /**
     * {Boolean} Flag to detect if the client system is Nintendo DS
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    NINTENDODS : false,

    /**
     * {Boolean} Flag to detect if the client system is Playstation Portable
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    PSP : false,

    /**
     * {Boolean} Flag to detect if the client system is assumed
     * @deprecated since 1.4: Please use qx.core.Environment.get() instead.
     */
    UNKNOWN_SYSTEM : false,

    /** Maps user agent names to system IDs */
    __ids :
    {
      "Windows NT 6.1" : "win7",
      "Windows NT 6.0" : "winvista",
      "Windows NT 5.2" : "win2003",
      "Windows NT 5.1" : "winxp",
      "Windows NT 5.0" : "win2000",
      "Windows 2000" : "win2000",
      "Windows NT 4.0" : "winnt4",

      "Win 9x 4.90" : "winme",
      "Windows CE" : "wince",
      "Windows 98" : "win98",
      "Win98" : "win98",
      "Windows 95" : "win95",
      "Win95" : "win95",

      "Linux" : "linux",
      "FreeBSD" : "freebsd",
      "NetBSD" : "netbsd",
      "OpenBSD" : "openbsd",
      "SunOS" : "sunos",

      "Symbian System" : "symbian",
      "Nitro" : "nintendods",
      "PSP" : "sonypsp",

      "Mac OS X 10_6" : "osx6",
      "Mac OS X 10.6" : "osx6",
      "Mac OS X 10_5" : "osx5",
      "Mac OS X 10.5" : "osx5",
      "Mac OS X 10_4" : "osx4",
      "Mac OS X 10.4" : "osx4",
      "Mac OS X 10_3" : "osx3",
      "Mac OS X 10.3" : "osx3",
      "Mac OS X 10_2" : "osx2",
      "Mac OS X 10.2" : "osx2",
      "Mac OS X 10_1" : "osx1",
      "Mac OS X 10.1" : "osx1",
      "Mac OS X 10_0" : "osx0",
      "Mac OS X 10.0" : "osx0",
      "Mac OS X" : "osx",
      "Mac OS 9" : "os9"
    },


    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      var agent = navigator.userAgent;

      var str = [];
      for (var key in this.__ids) {
        str.push(key);
      }

      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(agent);

      if (!match) {
        this.UNKNOWN_SYSTEM = true;

        if(!qx.bom.client.OperatingSystem.getName() == "")
        {
          if (qx.bom.client.OperatingSystem.getName() == "unix")
          {
            this.NAME = "linux";
            this.LINUX = true;
          }
          else if(qx.bom.client.OperatingSystem.getName() == "osx")
          {
            this.NAME = "osx5";
            this.OSX = true;
          }
          else
          {
            this.NAME = "winxp";
            this.WINXP = true;
          }
        }
        else
        {
          this.NAME = "winxp";
          this.WINXP = true;
        }

        return;
      }

      if (qx.bom.client.Engine.getName() == "webkit" &&
        RegExp(" Mobile/").test(agent))
      {
        if (RegExp("iPad").test(navigator.userAgent)) {
            this.IPAD = true;
            this.NAME = "ipad";
        } else {
            this.IPHONE = true;
            this.NAME = "iphone";
        }
      }
      else
      {
        this.NAME = this.__ids[match[1]];
        this[this.NAME.toUpperCase()] = true;

        if (qx.bom.client.OperatingSystem.getName() == "win")
        {
          if (agent.indexOf("Windows NT 5.01")!==-1) {
            this.SP1 = true;
          } else if (qx.bom.client.Engine.getName() == "mshtml" && agent.indexOf("SV1")!==-1) {
            this.SP2 = true;
          }
        }
      }
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
    statics.__init();

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // add @deprecation warnings
      var keys = ["NAME", "SP1", "SP2", "WIN95", "WIN98", "WINME", "WINNT4",
        "WIN2000", "WINXP", "WIN2003", "WINVISTA", "WIN7", "WINCE", "LINUX",
        "SUNOS", "FREEBSD", "NETBSD", "OPENBSD", "OSX", "OS9", "IPHONE", "IPAD",
        "SYMBIAN", "NINTENDODS", "PSP", "UNKNOWN_SYSTEM"];
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
