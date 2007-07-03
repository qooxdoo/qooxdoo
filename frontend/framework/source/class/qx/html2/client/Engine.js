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

************************************************************************ */

qx.Class.define("qx.html2.client.Engine",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Name of the client's HTML/JS engine e.g. mshtml, gecko, webkit, opera, khtml */
    ENGINE : "unknown",

    /** Version of the client's HTML/JS engine e.g. 1.0, 1.7, 1.9 */
    VERSION : 0.0,

    /** Flag to detect if the client is based on the Opera HTML/JS engine */
    OPERA : false,

    /** Flag to detect if the client is based on the KHTML HTML/JS engine */
    KHTML : false,

    /** Flag to detect if the client is based on the Webkit HTML/JS engine */
    WEBKIT : false,

    /** Flag to detect if the client is based on the Gecko HTML/JS engine */
    GECKO : false,

    /** Flag to detect if the client is based on the Internet Explorer HTML/JS engine */
    MSHTML : false,


    /**
     * Internal initialize helper
     */
    __init : function()
    {
      var engine = "unknown";
      var version = 0.0;
      var agent = navigator.userAgent;

      if (window.opera)
      {
        engine = "opera";
        this.OPERA = true;

        if (/Opera[\s\/]([0-9\.]*)/.test(agent)) {
          version = RegExp.$1.substring(0, 3) + "." + RegExp.$1.substring(3);
        }
      }
      else if (navigator.vendor === "KDE")
      {
        engine = "khtml";
        this.KHTML = true;

        if (/KHTML\/([0-9-\.]*)/.test(agent)) {
          version = RegExp.$1;
        }
      }
      else if (agent.indexOf("AppleWebKit") != -1)
      {
        engine = "webkit";
        this.WEBKIT = true;

        if (/AppleWebKit\/([^ ]+)/.test(agent))
        {
          version = RegExp.$1;

          var nightly = vEngineVersion.indexOf("+") != -1;
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);
          if (invalidCharacter) {
            version = version.slice(0, invalidCharacter.index);
          }
        }
      }
      else if (window.controllers && navigator.product === "Gecko")
      {
        engine = "gecko";
        this.GECKO = true;

        if (/rv\:([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;
        }
      }
      else if (/MSIE\s+([^\);]+)(\)|;)/.test(agent))
      {
        engine = "mshtml";
        version = RegExp.$1;

        this.MSHTML = true;
      }
      else
      {
        throw new Error("Unsupported client!");
      }

      this.VERSION = version;
      this.ENGINE = engine;
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics){
    statics.__init();
  }
});
