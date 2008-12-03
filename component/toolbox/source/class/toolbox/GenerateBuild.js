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
qx.Class.define("toolbox.GenerateBuild",
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
    this.__generateBuild(adminPath, fileName, filePath, logFrame);
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
    __generateBuild : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=generate_Build";
        var openBuild = "action=open_In_Browser&location=build";
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
          if (createParams[i] != "")
          {
            dat += "&" + params[i] + "=" + createParams[i];
            openBuild += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);
        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();

          if (result.build_state != undefined)
          {
            var receivedState = result.build_state;

            if (receivedState == 1 || receivedState == 0)
            {
              if (receivedState == 0)
              {
                alert("Build was created successfully");
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.build_output);
                req.setData(openBuild);
                req.send();
              }

              if (receivedState == 1)
              {
                alert("Build failed");
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.build_error + '</font>');
              }
            }
          }
          else
          {
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result + '</font>');
          }

          loader.unblock();
          loader.hideLoader();
        },
        this);

        req.addListener("failed", function(evt) {
          this.error("Failed to post to URL: " + url);
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
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