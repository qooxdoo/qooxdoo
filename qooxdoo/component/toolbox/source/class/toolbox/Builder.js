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
qx.Class.define("toolbox.Builder",
{
  /*
	  *****************************************************************************
	     STATICS
	  *****************************************************************************
  */

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param nameSpace {var} TODOC
     * @param logFileName {var} TODOC
     * @param type {var} TODOC
     * @param generate {var} TODOC
     * @param loadImage {var} TODOC
     * @param frame {var} TODOC
     * @param windowContent {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    createNewApplication : function(adminPath, fileName, filePath, nameSpace, logFileName, type, generate, loadImage, frame, windowContent, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var req2 = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=create";
      var generateDat = "action=generate_Source";
      var openGen = "action=open_In_Browser&location=source";

      this.__urlParms = new toolbox.UrlSearchParms();

      var createParams = [ fileName, filePath, nameSpace, logFileName, type, generate ];

      req.setTimeout(100000);
      req2.setTimeout(100000);

      // disables all functions during the progress
      for (var i=0; i<windowContent.length; i++) {
        windowContent[i].setEnabled(false);
      }

      var params = [ "myName", "myPath", "myNamespace", "myLogfile", "myType", "generate_Source" ];

      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          generateDat += "&" + params[i] + "=" + createParams[i];
          openGen += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if (result.state != undefined)
        {
          var receivedState = result.state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              frame.setHtml(result.output);

              // disables all functions during the progress
              for (var i=0; i<windowContent.length; i++) {
                windowContent[i].setEnabled(true);
              }

              loadImage.hide();
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.output);

              if (generate == "true")
              {
                loadImage.show();

                // disables all functions during the progress
                for (var i=0; i<windowContent.length; i++) {
                  windowContent[i].setEnabled(false);
                }

                req2.setData(generateDat);
                req2.send();
              }
            }

            if (receivedState == 1)
            {
              frame.setHtml('<font color="red">' + result.error + '</font>');
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.error + '</font>');

              // Enables all functions after receiving results
              for (var i=0; i<windowContent.length; i++) {
                windowContent[i].setEnabled(true);
              }

              loadImage.hide();
            }
          }
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result + '</font>');
        }
      },
      this);

      req2.addListener("completed", function(evt)
      {
        var genResult = evt.getContent();
        frame.setHtml(frame.getHtml() + "</br>" + genResult.gen_output);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + genResult.gen_output);

        // Enables all functions after receiving results
        for (var i=0; i<windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }

        loadImage.hide();
        req2.setData(openGen);
        req2.send();
      },
      this);

      req2.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');

        // Enables all functions after receiving results
        for (var i=0; i<windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }
      },
      this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');

        // Enables all functions after receiving results
        for (var i=0; i<windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }
      },
      this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param generate {var} TODOC
     * @param frame {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateSource : function(adminPath, fileName, filePath, generate, frame, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=generate_Source";
        var openSource = "action=open_In_Browser&location=source";
        var createParams = [ fileName, filePath, generate ];
        req.setTimeout(100000);

        // check cygwin path
        if ('cygwin' in this.__urlParms.getParms())
        {
          var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
          dat += "&" + cygParm;
        }

        var params = [ "myName", "myPath", "generate_Source" ];

        for (var i=0; i<createParams.length; i++)
        {
          if (createParams[i] != "")
          {
            dat += "&" + params[i] + "=" + createParams[i];
            openSource += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);

        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();

          if (result.gen_state != undefined)
          {
            var receivedState = result.gen_state;

            if (receivedState == 1 || receivedState == 0)
            {
              if (receivedState == 0)
              {
                frame.setHtml(result.gen_output);
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.gen_output);
                req.setData(openSource);
                req.send();
                
                //var openLink = ("/component/toolbox/tool/bin/nph-qxadmin_cgi.py?action=open_In_Browser&location=source").replace(/\\/g, "/");
                //alert(openLink);
                //window.open(openLink);
                
              }

              if (receivedState == 1)
              {
                frame.setHtml('<font color="red">' + result.gen_error + '</font>');
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.gen_error + '</font>');
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateBuild : function(adminPath, fileName, filePath, logFrame)
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
        var progressLoader = new toolbox.ProgressLoader();

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
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.build_output);
                req.setData(openBuild);
                req.send();
              }

              if (receivedState == 1) {
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.build_error + '</font>');
              }
            }
          }
          else
          {
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result + '</font>');
          }

          progressLoader.unblock();
          progressLoader.hideLoader();
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateApi : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=generate_Api";
        var openApi = "action=open_In_Browser&location=api";
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
            openApi += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);

        var progressLoader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();

          var receivedState = result.api_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + " <br> " + result.api_output);
              req.setData(openApi);
              req.send();
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + " <br> " + '<font color="red">' + result.api_output + '</font>');
            }
          }

          progressLoader.unblock();
          progressLoader.hideLoader();
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    makePretty : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=make_Pretty";
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

        req.setProhibitCaching(true);
        req.setData(dat);
        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.pretty_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.pretty_output);
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.pretty_output + '</font>');
            }
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    validateCode : function(adminPath, fileName, filePath, logFrame)
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

        req.setProhibitCaching(true);
        req.setData(dat);
        var loader = new toolbox.ProgressLoader();

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
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.val_output + '</font>');
            }
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    testApplication : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=test_Application";
        var openSource = "action=open_In_Browser&location=test";
        var createParams = [ fileName, filePath ];
        req.setTimeout(100000);

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
            openSource += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);
        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.testApp_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.testApp_output);
              req.setData(openSource);
              req.send();
            }

            if (receivedState == 1)
            {
              frame.setHtml('<font color="red">' + result.testApp_output + '</font>');
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.testApp_output + '</font>');
            }
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
    },


    /**
     * TODOC
     *
     * @type static
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    testSource : function(adminPath, fileName, filePath, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=test_Source";
        var openSource = "action=open_In_Browser&location=test";
        var createParams = [ fileName, filePath ];
        req.setTimeout(100000);

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
            openSource += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);
        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.test_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.test_output);
              req.setData(openSource);
              req.send();
            }

            if (receivedState == 1)
            {
              frame.setHtml('<font color="red">' + result.test_output + '</font>');
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.test_output + '</font>');
            }
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