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
qx.Class.define("toolbox.CreateNewApplication",
{
  extend : qx.core.Object,

    /*
      *****************************************************************************
         CONSTRUCTOR
      *****************************************************************************
    */
  construct : function(adminPath, fileName, filePath, nameSpace, logFileName, type, generate, loadImage, frame, windowContent, logFrame) {
  		this.base(arguments, adminPath, fileName, filePath, nameSpace, logFileName, type, generate, loadImage, frame, windowContent, logFrame);
  		this.__urlParms = new toolbox.UrlSearchParms();
  		this.__createNewApplication(adminPath, fileName, filePath, nameSpace, logFileName, type, generate, loadImage, frame, windowContent, logFrame);
  },

    /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  members :
  {
  	
  	__content : "",
  	__state : null,
  	
    __createNewApplication : function(adminPath, fileName, filePath, nameSpace, logFileName, type, generate, loadImage, frame, windowContent, logFrame) {
    	var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var req2 = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=create";
      var generateDat = "action=generate_Source";
      var openGen = "action=open_In_Browser&location=source";
      var createParams = [fileName, filePath, nameSpace, logFileName, type, generate];
      req.setTimeout(100000);
      req2.setTimeout(100000);
      
      //disables all functions during the progress
      for (var i = 0; i < windowContent.length; i++) {
      	windowContent[i].setEnabled(false);
      }
      
      
      
      var params = ["myName", "myPath", "myNamespace", "myLogfile", "myType", "generate_Source"];
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin'+"="+this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
        alert("CYGWIN-->" + dat);
      }
      
      for(var i = 0; i < createParams.length; i++) {
      	if(createParams[i] != "") {
          dat +="&"+params[i]+"=" + createParams[i];
          generateDat += "&"+params[i]+"=" + createParams[i];
          openGen += "&"+params[i]+"=" + createParams[i];
      	}
      }
      
      alert("Parameter " + dat);
      req.setProhibitCaching(true);
      req.setData(dat);

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        //alert("Create " + result);
        var receivedState = result.state;
        if (receivedState == 1 || receivedState == 0) {
        	if(receivedState == 0){
        		frame.setHtml(result.output);
        	  this.setResult(result.output);
        	  //disables all functions during the progress
            for (var i = 0; i < windowContent.length; i++) {
              windowContent[i].setEnabled(true);
            }
            loadImage.hide();
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.output)
        	  if(generate == "true") {
        	  	loadImage.show();
        	  	//disables all functions during the progress
              for (var i = 0; i < windowContent.length; i++) {
                windowContent[i].setEnabled(false);
              }
              req2.setData(generateDat)
              req2.send();
        	  }
        	}
        	if(receivedState == 1){
            frame.setHtml('<font color="red">'+result.output + '</font>');
            this.setResult(result.output);
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">'+ result.output + '</font>')
            //Enables all functions after receiving results
            for (var i = 0; i < windowContent.length; i++) {
              windowContent[i].setEnabled(true);
            }
            loadImage.hide();
          }
        }
      },
      this);

      req2.addListener("completed", function(evt)
      {
        var genResult = evt.getContent();
        frame.setHtml(frame.getHtml() + "</br>" + genResult.gen_output);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + genResult.gen_output)
        //Enables all functions after receiving results
        for (var i = 0; i < windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }
        loadImage.hide();
        req2.setData(openGen)
        req2.send();
      }, this);
      
      
      req2.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.output)
        //Enables all functions after receiving results
        for (var i = 0; i < windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }
      }, this);
      
      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.output)
        //Enables all functions after receiving results
        for (var i = 0; i < windowContent.length; i++) {
          windowContent[i].setEnabled(true);
        }
      }, this);

      req.send();

      return;
    }, 
    
    setState : function(state) {
    	this.__state = state;
    }, 

    getState : function() {
      return this.__state;
    },
    
    setResult : function(content) {
      this.__content = content;
    }, 

    getResult : function() {
      return this.__content;
    }
    
    

    
    
  }
});