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
qx.Class.define("toolbox.MakePretty",
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
  		this.__makePretty(adminPath, fileName, filePath, logFrame);
  },

    /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  members :
  {
    __makePretty : function(adminPath, fileName, filePath, logFrame) {
    	if (fileName != "" & filePath!=""){
      	var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=make_Pretty";
        var createParams = [fileName, filePath];
        req.setTimeout(600000);
        
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
        	}
        }
        
        alert("Parameter Pretty " + dat);
  
        req.setProhibitCaching(true);
        req.setData(dat);
        var progressPopup = new toolbox.ProgressLoader();
  
        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          var receivedState = result.pretty_state;
          if (receivedState == 1 || receivedState == 0) { 
            if(receivedState == 0){
            	logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.pretty_output)
              this.setResult(result.pretty_output);
            }
            if(receivedState == 1){
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">'+ result.pretty_output + '</font>')
              this.setResult(result.pretty_output);
            }
          }
          progressPopup.unblock();
          progressPopup.hidePopup();
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