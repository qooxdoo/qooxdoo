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
 * This class sends the request to the webserver to call the wished function.
 */
qx.Class.define("toolbox.builder.Builder",
{
  /*
	  *****************************************************************************
	     STATICS
	  *****************************************************************************
  */

  statics :
  {
  	// Applicationlist
    BUILTINLIST : null,
    
  	generateTarget : function(adminPath, fileName, filePath, logFrame, develWidgets, generationType, isBuiltIn, typeBuilt)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var req2 = new qx.io.remote.Request(url, "POST");
      var dat = "action=generate";
      var saveAppList = "action=save_Application_List";
      var saveBuiltInList = "action=save_BuiltIn_List";
      var createParams = [ fileName, filePath, generationType, isBuiltIn, typeBuilt ];
      req.setTimeout(10000000);

      this.__urlParms = new toolbox.builder.UrlSearchParms();

      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath", "myType", "isBuiltIn", "myTypeBuilt"];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "") {
          dat += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      this.__loader = new toolbox.builder.ProgressLoader();
      this.__loader.setCaption("Generating " + generationType);

      
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
            	//Checks if this function is a built-in
            	if(isBuiltIn) 
            	{	
            		for (var i = 0; i < toolbox.content.BuiltInContent.BUILTINLIST.length; i++)
                {
                  if (toolbox.content.BuiltInContent.BUILTINLIST[i].name == fileName)
                  {
                    if (generationType == "source") {
                      toolbox.content.BuiltInContent.BUILTINLIST.source = true;
                    } else if (generationType == "build") {
                      toolbox.content.BuiltInContent.BUILTINLIST.build = true;
                    }
                    
                    var changedBuiltInList = qx.util.Json.stringify(toolbox.content.BuiltInContent.BUILTINLIST, true);
  
                    saveBuiltInList += "&changedBuiltInList=" + changedBuiltInList;
                    req2.setData(saveBuiltInList);
                    req2.send();
                  }
                }
            		
            	} else {
                for (var i = 0; i < toolbox.content.DevelopmentContent.APPLIST.length; i++)
                {
                  if (toolbox.content.DevelopmentContent.APPLIST[i].name == fileName & toolbox.content.DevelopmentContent.APPLIST[i].path == filePath.replace(/\\/g, "/"))
                  {
                    //var changedAppList = qx.util.Json.stringify(toolbox.content.DevelopmentContent.APPLIST, true);
  				  
                    // adds the path and the name of the current application in the applicationlist
                    if(generationType == "source" || generationType == "source-all") {	
                    	toolbox.content.DevelopmentContent.APPLIST[i].source = true;
                    } else if (generationType == "build") {
                    	toolbox.content.DevelopmentContent.APPLIST[i].build = true;
                    } else if (generationType == "api") {
                    	toolbox.content.DevelopmentContent.APPLIST[i].api = true;
                    } 
                    
                    var changedAppList = qx.util.Json.stringify(toolbox.content.DevelopmentContent.APPLIST, true);
  
                    saveAppList += "&changedAppList=" + changedAppList;
                    req2.setData(saveAppList);
                    req2.send();
                  }
                }
            	
                //Enables/ disables the open button
                if(develWidgets != null) {
                	if(generationType == "source" || generationType == "source-all") {
                		develWidgets["development.openSourceButton"].setEnabled(true);
                		develWidgets["development.openSourceAllButton"].setEnabled(true);
                	} else if (generationType == "build") {
                		develWidgets["development.openBuildButton"].setEnabled(true);              		
                	} else if (generationType == "api") {
                		develWidgets["development.openApiButton"].setEnabled(true);
                	}
                }
            	}
              logFrame.setHtml(logFrame.getHtml() + '<br/> <hr noshade size="4">GENERATE ' + (generationType).toUpperCase() + ' <hr noshade size="4">' + result.output);
              
              if(generationType == "test" || generationType == "test-source") {
              	toolbox.builder.Builder.openApplication(adminPath, fileName, filePath, logFrame, "test");
              }
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + result.error + '</font>');
            }
          }
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + result.error + '</font>');
        }

        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req2.addListener("failed", function(evt) {
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<br/> <hr noshade size="4">' + (generationType).toUpperCase() + '<hr noshade size="4">' + "Application list could not extends by the created application " + "</br>Failed to post to URL: " + url + '</font>');
      }, this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.send();

      return;
    },
  	
  	
    /**
     * creates a qooxdoo-skeleton
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the file
     * @param filePath {var} path of the file
     * @param nameSpace {var} namespace of the file
     * @param logFileName {var} lofgile of the file
     * @param type {var} type of the file
     * @param generate {var} if you also want to generate the source code
     * @param logFrame {var} the log output
     * @param develWidgets {var} widgets of the development pane
     * @return {void} 
     */
    createNewApplication : function(adminPath, fileName, filePath, nameSpace, logFileName, type, generate, logFrame, develWidgets)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var req3 = new qx.io.remote.Request(url, "POST");
      var dat = "action=create";
      var generateDat = "action=generate_Source";
      var saveAppList = "action=save_Application_List";
      this.__urlParms = new toolbox.builder.UrlSearchParms();

      // replaces all whitespaces with underscores
      fileName = fileName.replace(/ /g, "_");

      var createParams = [ fileName, filePath, nameSpace, logFileName, type, generate ];

      req.setTimeout(100000);

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
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      this.__loader = new toolbox.builder.ProgressLoader();
      this.__loader.setCaption("Creating skeleton");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if (result.state != undefined)
        {
          this.__loader.hide();
          this.__loader.setModal(false);

          var receivedState = result.state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + '<br/><hr noshade size="4">CREATE APPLICATION<hr noshade size="4"> <br/>' + result.output);

              // adds the path and the name of the current application in the applicationlist
              toolbox.content.DevelopmentContent.APPLIST.push(
              {
                name   : fileName,
                path   : filePath.replace(/\\/g, "/"),
                source : false,
                build  : false,
                api	   : false
              });

              var changedAppList = qx.util.Json.stringify(toolbox.content.DevelopmentContent.APPLIST, true);

              saveAppList += "&changedAppList=" + changedAppList;
              req3.setData(saveAppList);
              req3.send();

              // If the checkbox selected the source version will be generated
              if (generate == "true")
              {
              	toolbox.builder.Builder.generateTarget(adminPath, fileName, filePath, logFrame, develWidgets, "source", false, null);
              }
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + result.error + '</font>');
            }
          }

          develWidgets["development.selectAppMenuButton"].setEnabled(true);
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + result.error + '</font>');
        }
      },
      this);

      

      req3.addListener("failed", function(evt) {
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<br/> <hr noshade size="4">GENERATE SOURCE<hr noshade size="4">' + "</br>Failed to post to URL: " + url + '</font>');
      }, this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      req.send();

      return;
    },


    /**
     * removes the current application
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the application
     * @param filePath {var} path of the application
     * @param logFrame {var} log output
     * @param develWidgets {var} widgets of the development pane
     * @return {void} 
     */
    removeCurrentApplication : function(adminPath, fileName, filePath, logFrame, develWidgets)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST");
      var dat = "action=delete_Application";
      var createParams = [ fileName, filePath ];
      req.setTimeout(100000);

      for (var i=0; i<toolbox.content.DevelopmentContent.APPLIST.length; i++)
      {
        if (toolbox.content.DevelopmentContent.APPLIST[i].name == fileName & toolbox.content.DevelopmentContent.APPLIST[i].path == filePath.replace(/\\/g, "/"))
        {
          toolbox.content.DevelopmentContent.APPLIST.splice(i, 1);
          var changedAppList = qx.util.Json.stringify(toolbox.content.DevelopmentContent.APPLIST, true);

          var params = [ "myName", "myPath" ];

          for (var j=0; j<createParams.length; j++)
          {
            if (createParams[j] != "") {
              dat += "&" + params[j] + "=" + createParams[j];
            }
          }

          dat += "&changedAppList=" + changedAppList;
          req.setData(dat);
          req.send();
        }
      }

      req.setData(dat);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + fileName + " in " + filePath + " could not remove </br>Failed to post to URL: " + url + '</font>');
      },
      this);

      if (toolbox.content.DevelopmentContent.APPLIST.length == 0) {
        develWidgets["development.selectAppMenuButton"].setEnabled(false);
      } else {
        develWidgets["development.selectAppMenuButton"].setEnabled(true);
      }
    },


    /**
     * prepares the application list for using
     *
     * @param adminPath {var} path of the cgi-script
     * @param logFrame {var} log output
     * @param develWidgets {var} widgets of the development pane
     * @return {void} 
     */
    prepareApplicationList : function(adminPath, logFrame, develWidgets)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST");
      var dat = "action=show_Application_List";
      req.setTimeout(100000);

      req.setData(dat);

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        result = result.replace(/\n/g, "").replace(/{/g, "\{").replace(/}/g, "\}");
        this.jsonObject = qx.util.Json.parse(result);
        toolbox.content.DevelopmentContent.APPLIST = this.jsonObject;

        if (toolbox.content.DevelopmentContent.APPLIST.length == 0) {
          develWidgets["development.selectAppMenuButton"].setEnabled(false);
        } else {
          develWidgets["development.selectAppMenuButton"].setEnabled(true);
        }
      },
      this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      req.send();
    },


    /**
     * opens the application in the brwoser
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the application
     * @param filePath {var} path of the application
     * @param logFrame {var} log output
     * @param generationTyp {var} the kind of the generation
     * @return {void} 
     */
    openApplication : function(adminPath, fileName, filePath, logFrame, generationTyp, isBuiltIn, typeBuilt)
    {
      if (generationTyp == "source" || generationTyp == "build" || generationTyp == "test" || generationTyp == "api")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var openSource = 'action=open_In_Browser&location=' + generationTyp;
        var createParams = [ fileName, filePath, isBuiltIn, typeBuilt ];
        req.setTimeout(100000);

        var params = [ "myName", "myPath", "isBuiltIn", "myTypeBuilt" ];

        for (var i=0; i<createParams.length; i++)
        {
          if (createParams[i] != "") {
            openSource += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(openSource);

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();

          if (result.open_state != undefined)
          {
            var receivedState = result.open_state;

            if (receivedState == 1 || receivedState == 0)
            {
              if (receivedState == 0) {
                logFrame.setHtml(logFrame.getHtml() + '<br/><hr noshade size="4">OPEN APPLICATION<hr noshade size="4"> <br/>' + result.open_output + '<br/>');
              }

              if (receivedState == 1) {
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<hr noshade size="4">ERROR<hr noshade size="4"> <br/>' + result.open_error + '</font> <br/>');
              }
            }
          }
          else
          {
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + '<hr noshade size="4">ERROR<hr noshade size="4"> <br/>' + result.open_error + '</font><br/>');
          }
        },
        this);

        req.addListener("failed", function(evt)
        {
          this.error("Failed to post to URL: " + url);
          logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">ERROR<hr noshade size="4">' + "Failed to post to URL: " + url + '</font>');
        },
        this);
      }
      else
      {
        logFrame.setHtml(logFrame.getHtml() + '<font color="red">' + '<br/> <hr noshade size="4">APPLICATION CAN NOT OPENED<hr noshade size="4"> </font> The given path does not exist');
      }

      req.send();
      return;
    }
  }
});