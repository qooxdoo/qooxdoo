/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This class shows the configuration file of a qooxdoo-Application
 */
qx.Class.define("toolbox.configuration.Configuration",
{
  extend : qx.core.Object,




  /*
      *****************************************************************************
         CONSTRUCTOR
      *****************************************************************************
    */

  construct : function(adminPath, fileName, filePath, logFrame, develWidgets)
  {
    this.base(arguments, adminPath, fileName, filePath, logFrame, develWidgets);
    this.__showConfiguration(adminPath, fileName, filePath, logFrame, develWidgets);
  },




  /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  statics : { JSON : null },

  members :
  {
    /**
     * shows the configuration of the current application
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the application
     * @param filePath {var} path of the application
     * @param logFrame {var} log output
     * @param develWidgets {var} TODOC
     * @return {void} 
     */
    __showConfiguration : function(adminPath, fileName, filePath, logFrame, develWidgets)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST");
      var dat = "action=show_Configuration";
      var createParams = [ fileName, filePath ];
      req.setTimeout(1000000);

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "") {
          dat += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      req.addListener("completed", function(evt)
      {
        develWidgets["development.configurationButton"].setEnabled(true);
        var result = evt.getContent();
        var restoreResult = result;
        this.showCon = new toolbox.configuration.ConfigurationDialog(adminPath, fileName, filePath, logFrame, restoreResult);
      },
      this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      req.send();
      develWidgets["development.configurationButton"].setEnabled(false);
      return;
    },


    /**
     * disposes all global objects
     *
     * @return {void} 
     */
    destruct : function() {
      this._disposeObjects("this.win", "this.__content", "this.__state");
    }
  }
});