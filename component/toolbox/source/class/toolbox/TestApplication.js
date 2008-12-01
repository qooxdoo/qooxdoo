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
qx.Class.define("toolbox.TestApplication",
{
  extend : qx.core.Object,

    /*
      *****************************************************************************
         CONSTRUCTOR
      *****************************************************************************
    */
  construct : function(adminPath, fileName, filePath, logFrame) {
  		this.base(arguments, adminPath, fileName, filePath, logFrame);
  		this.__urlParms = new toolbox.UrlSearchParms();
  		this.__testApplication(adminPath, fileName, filePath, logFrame);
  },

    /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  members :
  {
    __testApplication : function(adminPath, fileName, filePath, logFrame) {
    	if (fileName != "" & filePath!=""){
      	var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=test_Application";
        var openSource = "action=open_In_Browser&location=test";
        var createParams = [fileName, filePath];
        req.setTimeout(100000);
        
        // check cygwin path
        if ('cygwin' in this.__urlParms.getParms())
        {
          var cygParm = 'cygwin'+"="+this.__urlParms.getParms()['cygwin'];
          dat += "&"+cygParm;
        }
        var params = ["myName", "myPath"];
        
        for(var i = 0; i < createParams.length; i++) {
        	if(createParams[i] != "") {
            dat +="&"+params[i]+"=" + createParams[i];
            openSource +="&"+params[i]+"=" + createParams[i];
        	}
        }
        
        alert("Parameter Test" + dat);
  
        req.setProhibitCaching(true);
        req.setData(dat);
        var progressLoader = new toolbox.ProgressLoader();
  
        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.testApp_state;
          if (receivedState == 1 || receivedState == 0) { 
            if(receivedState == 0){
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.testApp_output)
              this.setResult(result.testApp_output);
              req.setData(openSource)
              req.send();
            }
            if(receivedState == 1){
              frame.setHtml('<font color="red">'+result.testApp_output + '</font>');
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">'+result.testApp_output + '</font>');
              this.setResult(result.testApp_output);
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
    	} else {
    		alert("You don't created an application");
    	}
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