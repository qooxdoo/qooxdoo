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
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.ValidateCode",
{
  extend : qx.core.Object,




  /*
        *****************************************************************************
           CONSTRUCTOR
        *****************************************************************************
      */

  construct : function(adminPath, fileName, filePath, logFrame)
  {
    this.base(arguments, adminPath, fileName, filePath, logFrame);
    this.__urlParms = new toolbox.UrlSearchParms();
    this.__validateCode(adminPath, fileName, filePath, logFrame);
  },




  /*
        *****************************************************************************
           MEMBERS
        *****************************************************************************
      */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    __validateCode : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=validate_Code";
        var createParams = [ fileName, filePath ];
        req.setTimeout(600000);

        // check cygwin path
        if ('cygwin' in this.__urlParms.getParms())
        {
          var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
          dat += "&" + cygParm;
        }

        var params = [ "myName", "myPath" ];

        for (var i=0; i<createParams.length; i++)
        {
          if (createParams[i] != "") {
            dat += "&" + params[i] + "=" + createParams[i];
          }
        }

        alert("Parameter VALIDATE " + dat);

        req.setProhibitCaching(true);
        req.setData(dat);
        var progressLoader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.val_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              this.__valFrame = new qx.ui.embed.Html();
              this.__valFrame.setOverflow("scroll", "scroll");
              this.__valFrame.setHtml(result.val_output);

              var win = new qx.ui.window.Window("Validation result");
              win.setModal(true);
              win.setLayout(new qx.ui.layout.VBox);
              win.add(this.__valFrame, { flex : 1 });
              win.setHeight(500);
              win.setWidth(650);
              win.open();
              win.moveTo(200, 100);
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.val_error + '</font>');
            }
          }

          progressLoader.unblock();
          progressLoader.hideLoader();
        },
        this);

        req.addListener("failed", function(evt) {
          this.error("Failed to post to URL: " + url);
        }, this);

        req.send();
      }
      else
      {
        alert("You don't created an application");
      }

      return;
    }
  }
});