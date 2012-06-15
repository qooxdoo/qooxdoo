/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(fce/lowlevel/*)
#use(feature-checks)
************************************************************************ */

/**
 * Tool used to create configuration maps for feature-based builds
 */
qx.Class.define("fce.ApplicationLowLevel",
{
  extend : qx.application.Native,

  properties :
  {
    /** Map of detected client features */
    featureSet :
    {
      init : null,
      nullable : true,
      apply : "_applyFeatureSet"
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }
      var env = new fce.Environment();
      env.addListenerOnce("changeFeatures", function(ev) {
        this.setFeatureSet(ev.getData());
      }, this);
      env.check();
    },

    _applyFeatureSet : function(value, old)
    {
      if (value) {
        var json = fce.Util.getFormattedJson(value);
        var htmlFormattedJson = json.replace(/ /g, "&nbsp;").replace(/\n/g, "<br/>");

        var headerText = "qooxdoo detected client features for "
          + value["browser.name"] + " " + value["browser.version"]
          + " on " + value["os.name"] + " " + value["os.version"];
        var header = document.createElement("h1");
        header.innerHTML = headerText;

        var out = document.createElement("div");
        out.id = "out";
        out.innerHTML = htmlFormattedJson;

        var riaLink = document.createElement("a");
        riaLink.href = "?ria";
        riaLink.innerHTML = "Launch Configuration Editor (may not work on mobile devices)";

        var mailTo = document.createElement("a");
        mailTo.innerHTML = "Send feature set data by email";
        var subject = encodeURIComponent(headerText);
        var body = encodeURIComponent(navigator.userAgent + "\n\n" + json);
        mailTo.href = "mailto:?subject=" + subject + "&body=" + body;

        document.body.appendChild(header);
        document.body.appendChild(mailTo);
        document.body.appendChild(riaLink);
        document.body.appendChild(out);
      }
    }
  }
});
