/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Sebastian Fastner (fastner)

************************************************************************ */
/**
 * This class is responsible for checking the operating systems name.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.OperatingSystem",
{
  statics :
  {
    /**
     * Checks for the name of the operating system.
     * @return {String} The name of the operating system.
     * @internal
     */
    getName : function() {
      if (!navigator) {
        return "";
      }
      var input = navigator.platform || "";
      var agent = navigator.userAgent || "";

      if (
        input.indexOf("Windows") != -1 ||
        input.indexOf("Win32") != -1 ||
        input.indexOf("Win64") != -1 ||
        agent.indexOf("Windows Phone") != -1
      ) {
        return "win";

      } else if (
        input.indexOf("Macintosh") != -1 ||
        input.indexOf("MacPPC") != -1 ||
        input.indexOf("MacIntel") != -1 ||
        input.indexOf("Mac OS X") != -1
      ) {
        return "osx";

      } else if (agent.indexOf("RIM Tablet OS") != -1) {
        return "rim_tabletos";

      } else if (agent.indexOf("webOS") != -1) {
        return "webos";

      } else if (
        input.indexOf("iPod") != -1 ||
        input.indexOf("iPhone") != -1 ||
        input.indexOf("iPad") != -1
      ) {
        return "ios";

      } else if (
        agent.indexOf("Android") != -1
      ) {
        return "android";

      } else if (
        input.indexOf("Linux") != -1
      ) {
        return "linux";

      } else if (
        input.indexOf("X11") != -1 ||
        input.indexOf("BSD") != -1 ||
        input.indexOf("Darwin") != -1
      ) {
        return "unix";

      } else if (
        input.indexOf("SymbianOS") != -1
      ) {
        return "symbian";
      }

      else if (
        input.indexOf("BlackBerry") != -1
      ) {
        return "blackberry";
      }

      // don't know
      return "";
    },



    /** Maps user agent names to system IDs */
    __ids : {
      // Windows
      "Windows NT 10.0" : "10",
      "Windows NT 6.3" : "8.1",
      "Windows NT 6.2" : "8",
      "Windows NT 6.1" : "7",
      "Windows NT 6.0" : "vista",
      "Windows NT 5.2" : "2003",
      "Windows NT 5.1" : "xp",
      "Windows NT 5.0" : "2000",
      "Windows 2000" : "2000",
      "Windows NT 4.0" : "nt4",

      "Win 9x 4.90" : "me",
      "Windows CE" : "ce",
      "Windows 98" : "98",
      "Win98" : "98",
      "Windows 95" : "95",
      "Win95" : "95",

      // OS X
      "Mac OS X 10_13" : "10.13",
      "Mac OS X 10.13" : "10.13",
      "Mac OS X 10_12" : "10.12",
      "Mac OS X 10.12" : "10.12",
      "Mac OS X 10_11" : "10.11",
      "Mac OS X 10.11" : "10.11",
      "Mac OS X 10_10" : "10.10",
      "Mac OS X 10.10" : "10.10",
      "Mac OS X 10_9" : "10.9",
      "Mac OS X 10.9" : "10.9",
      "Mac OS X 10_8" : "10.8",
      "Mac OS X 10.8" : "10.8",
      "Mac OS X 10_7" : "10.7",
      "Mac OS X 10.7" : "10.7",
      "Mac OS X 10_6" : "10.6",
      "Mac OS X 10.6" : "10.6",
      "Mac OS X 10_5" : "10.5",
      "Mac OS X 10.5" : "10.5",
      "Mac OS X 10_4" : "10.4",
      "Mac OS X 10.4" : "10.4",
      "Mac OS X 10_3" : "10.3",
      "Mac OS X 10.3" : "10.3",
      "Mac OS X 10_2" : "10.2",
      "Mac OS X 10.2" : "10.2",
      "Mac OS X 10_1" : "10.1",
      "Mac OS X 10.1" : "10.1",
      "Mac OS X 10_0" : "10.0",
      "Mac OS X 10.0" : "10.0"
    },


    /**
     * Checks for the version of the operating system using the internal map.
     *
     * @internal
     * @return {String} The version as strin or an empty string if the version
     *   could not be detected.
     */
    getVersion : function() {
      var version = qx.bom.client.OperatingSystem.__getVersionForDesktopOs(navigator.userAgent);

      if(version == null) {
        version = qx.bom.client.OperatingSystem.__getVersionForMobileOs(navigator.userAgent);
      }

      if(version != null) {
        return version;
      } else {
        return "";
      }
    },


    /**
     * Detect OS version for desktop devices
     * @param userAgent {String} userAgent parameter, needed for detection.
     * @return {String} version number as string or null.
     */
    __getVersionForDesktopOs : function(userAgent) {
      var str = [];
      for (var key in qx.bom.client.OperatingSystem.__ids) {
        str.push(key);
      }

      var reg = new RegExp("(" + str.join("|").replace(/\./g, "\.") + ")", "g");
      var match = reg.exec(userAgent);

      if (match && match[1]) {
        return qx.bom.client.OperatingSystem.__ids[match[1]];
      }

      return null;
    },


    /**
     * Detect OS version for mobile devices
     * @param userAgent {String} userAgent parameter, needed for detection.
     * @return {String} version number as string or null.
     */
    __getVersionForMobileOs : function(userAgent) {
      var windows = userAgent.indexOf("Windows Phone") != -1;
      var android = userAgent.indexOf("Android") != -1;
      var iOs = userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false ;

      if (windows) {
        var windowsVersionRegExp = new RegExp(/Windows Phone (\d+(?:\.\d+)+)/i);
        var windowsMatch = windowsVersionRegExp.exec(userAgent);

        if (windowsMatch && windowsMatch[1]) {
          return windowsMatch[1];
        }
      } else if (android) {
        var androidVersionRegExp = new RegExp(/ Android (\d+(?:\.\d+)+)/i);
        var androidMatch = androidVersionRegExp.exec(userAgent);

        if (androidMatch && androidMatch[1]) {
          return androidMatch[1];
        }
      } else if (iOs) {
        var iOsVersionRegExp = new RegExp(/(CPU|iPhone|iPod) OS (\d+)_(\d+)(?:_(\d+))*\s+/);
        var iOsMatch = iOsVersionRegExp.exec(userAgent);

        if (iOsMatch && iOsMatch[2] && iOsMatch[3]) {
          if(iOsMatch[4]) {
            return iOsMatch[2]+"."+ iOsMatch[3]+"."+ iOsMatch[4];
          } else {
            return iOsMatch[2]+"."+ iOsMatch[3];
          }
        }
      }

      return null;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("os.name", statics.getName);
    qx.core.Environment.add("os.version", statics.getVersion);
  }
});
