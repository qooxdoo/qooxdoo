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
qx.Class.define("toolbox.Configuration",
{
  extend : qx.core.Object,

    /*
      *****************************************************************************
         CONSTRUCTOR
      *****************************************************************************
    */
  construct : function(adminPath, fileName, filePath) {
  		this.base(arguments, adminPath, fileName, filePath);
  		this.__urlParms = new toolbox.UrlSearchParms();
  		this.__showConfiguration(adminPath, fileName, filePath);
  },

    /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  members :
  {
    __showConfiguration : function(adminPath, fileName, filePath) {
    	if (fileName != "" & filePath!=""){
      	var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST");
        var dat = "action=show_Configuration";
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
        
        alert("Parameter Configuration " + dat);
        req.setProhibitCaching(true);
        req.setData(dat);
        
  
        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          alert(result)

              this.__configFrame = new qx.ui.embed.Html();
              this.__configFrame.setOverflow("scroll", "scroll");
              this.__configFrame.setHtml("<pre>" + result + "</pre>");
              
              
              var win = new qx.ui.window.Window("Configuration");
              win.setLayout(new qx.ui.layout.VBox);
              win.add(this.__configFrame, { flex : 1 })
              win.setHeight(500);
              win.setWidth(650);
              win.open();              
              win.moveTo(200, 100);
              win.setModal(true);
              
              this.setResult(result); 
            
          req.resetTimeout();
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