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
qx.Class.define("toolbox.AbortProcess",
{
  extend : qx.core.Object,




  /*
          *****************************************************************************
             CONSTRUCTOR
          *****************************************************************************
        */

  construct : function(adminPath, fileName, filePath)
  {
    this.base(arguments, adminPath, fileName, filePath);
    this.__urlParms = new toolbox.UrlSearchParms();
    this.__abortProcess(adminPath, fileName, filePath);
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
     * @return {void} 
     */
    __abortProcess : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST");
        var dat = "action=abort_Process";
        var createParams = [ fileName, filePath ];
        req.setTimeout(1000000);

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

        alert("abort " + dat);

        req.setProhibitCaching(true);
        req.setData(dat);

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          alert("Abort-->" + result);
          req.resetTimeout();
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