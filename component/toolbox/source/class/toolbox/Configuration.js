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
        var req2 = new qx.io.remote.Request(url, "POST");
        var dat = "action=show_Configuration";
        var saveDat = "action=save_Configuration";
        var createParams = [fileName, filePath];
        req.setTimeout(1000000);
        
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
            saveDat +="&"+params[i]+"=" + createParams[i];
        	}
        }
        
        req.setProhibitCaching(true);
        req.setData(dat);
        
  
        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          
          var vBoxLayout = new qx.ui.layout.VBox(5);
          vBoxLayout.setAlignX("right");
          
          var gridLayout = new qx.ui.layout.Grid(5, 5);
          gridLayout.setColumnFlex(1, 1);
          gridLayout.setColumnFlex(2, 1);
          //gridLayout.setRowAlign(10, "right", "middle");
          
          var mainContainer = new qx.ui.container.Composite(gridLayout);
          
          
          var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(5)).set({
            allowGrowX: false
          });
          
          
          this.win = new qx.ui.window.Window("Configuration");
          this.win.setModal(true);
          this.win.setLayout(vBoxLayout);
          this.win.setAllowGrowY(false);
          this.win.setAllowMaximize(false);
          
          try {
            var resultEval = eval("(" + result + ")");
            
            //--------Buttons-----------------------------------------------------
            var saveButton = new qx.ui.form.Button("Save", "toolbox/image/media-floppy.png");
            var closeButton = new qx.ui.form.Button("Close", "toolbox/image/dialog-close.png");
            //--------Buttons-----------------------------------------------------
  
            //--------Textarea----------------------------------------------------
            var configFrame = new qx.ui.form.TextArea("");
            configFrame.setMinWidth(400);
            //configFrame.setMinHeight(300);
            configFrame.setWrap(false);
            configFrame.setAllowGrowX(true);
            configFrame.setAllowGrowY(true);
            configFrame.setAllowStretchX(true);
            configFrame.setAllowStretchY(true);
            configFrame.setValue(result);
  
            //--------Textarea----------------------------------------------------
            
            //--------Checkbox----------------------------------------------------
            var showProfessionalView = new qx.ui.form.CheckBox("");
            configFrame.exclude();
            
            showProfessionalView.addListener("click", function() {
              if(showProfessionalView.getChecked()){
                 configFrame.show();
              } else {
                 configFrame.exclude();
              }
            }, this);
            
            //--------Checkbox----------------------------------------------------
  
            
            //--------Labels------------------------------------------------------
            var nameLabel = new qx.ui.basic.Label("Name: ");
            var includePathLabel = new qx.ui.basic.Label("Include path: ");
            var applicationNameLabel = new qx.ui.basic.Label("APPLICATION: ");
            var qooxdooPathLabel = new qx.ui.basic.Label("QOOXDOO_PATH: ");
            var qooxdooUriLabel = new qx.ui.basic.Label("QOOXDOO_URI: ");
            var qxThemeLabel = new qx.ui.basic.Label("QXTHEME: ");
            var apiExcludeLabel = new qx.ui.basic.Label("API_EXCLUDE: ");
            var localesLabel = new qx.ui.basic.Label("LOCALES: ");
            var rootLabel = new qx.ui.basic.Label("ROOT: ");
            var professionalViewLabel = new qx.ui.basic.Label("Professional view: ");
            //--------Labels------------------------------------------------------
            
            //--------Textfields------------------------------------------------------
            var nameText = new qx.ui.form.TextField(resultEval.name).set({
              minWidth : 300
            });
            var includePathText = new qx.ui.form.TextField(resultEval.include[0].path).set({
              minWidth : 300
            });
            var applicationNameText = new qx.ui.form.TextField(resultEval.let.APPLICATION).set({
              minWidth : 300
            });
            var qooxdooPathText = new qx.ui.form.TextField(resultEval.let.QOOXDOO_PATH).set({
              minWidth : 300
            });
            var qooxdooUriText = new qx.ui.form.TextField(resultEval.let.QOOXDOO_URI).set({
              minWidth : 300
            });
            var qxThemeText = new qx.ui.form.TextField(resultEval.let.QXTHEME).set({
              minWidth : 300
            });
            var apiExcludeText = new qx.ui.form.TextField("[" + resultEval.let.API_EXCLUDE.toString() + "]").set({
              minWidth : 300
            });
            var localesText = new qx.ui.form.TextField("[" + resultEval.let.LOCALES.toString() + "]").set({
              minWidth : 300
            });
            var rootText = new qx.ui.form.TextField(resultEval.let.ROOT).set({
              minWidth : 300
            });
            //--------Textfields--------------------------------------------------
            
            //--------TextListener------------------------------------------------
            nameText.addListener("input", function(e) {
              resultEval.name = nameText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            includePathText.addListener("input", function(e) {
              resultEval.include[0].path = includePathText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            applicationNameText.addListener("input", function(e) {
              resultEval.let.APPLICATION = applicationNameText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            qooxdooPathText.addListener("input", function(e) {
              resultEval.let.QOOXDOO_PATH = qooxdooPathText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            qooxdooUriText.addListener("input", function(e) {
              resultEval.let.QOOXDOO_URI = qooxdooUriText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            qxThemeText.addListener("input", function(e) {
              resultEval.let.QXTHEME = qxThemeText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            apiExcludeText.addListener("input", function(e) {
              resultEval.let.API_EXCLUDE = apiExcludeText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            localesText.addListener("input", function(e) {
              resultEval.let.LOCALES = localesText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            rootText.addListener("input", function(e) {
              resultEval.let.ROOT = rootText.getValue();
              configFrame.setValue(qx.util.Json.stringify(resultEval, true).toString());
            }, this);
            
            //--------TextListener------------------------------------------------
            
            
            
            
            
            container.add(closeButton);
            container.add(saveButton);
            
            
            
            
            
            mainContainer.add(nameLabel, {
              row     : 0,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(nameText, {
              row     : 0,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(includePathLabel, {
              row     : 1,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(includePathText, {
              row     : 1,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(applicationNameLabel, {
              row     : 2,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(applicationNameText, {
              row     : 2,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
             mainContainer.add(qooxdooPathLabel, {
              row     : 3,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(qooxdooPathText, {
              row     : 3,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(qooxdooUriLabel, {
              row     : 4,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(qooxdooUriText, {
              row     : 4,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(qxThemeLabel, {
              row     : 5,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(qxThemeText, {
              row     : 5,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(apiExcludeLabel, {
              row     : 6,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(apiExcludeText, {
              row     : 6,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(localesLabel, {
              row     : 7,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(localesText, {
              row     : 7,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
  
            mainContainer.add(rootLabel, {
              row     : 8,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(rootText, {
              row     : 8,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
  
            mainContainer.add(professionalViewLabel, {
              row     : 9,
              column  : 0,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(showProfessionalView, {
              row     : 9,
              column  : 1,
              rowSpan : 0,
              colSpan : 1
            });
            
            mainContainer.add(configFrame, {
              row     : 0,
              column  : 2,
              rowSpan : 9,
              colSpan : 0
            });
            
            this.win.add(mainContainer);
            this.win.add(container);
            
            
            closeButton.addListener("execute", function() {
              this.win.close();
            }, this);
            
            saveButton.addListener("execute", function() {
              try{
                changedConfig = configFrame.getValue();
                qx.util.Json.parse(changedConfig);
                saveDat += "&changedConfig=" + changedConfig 
                req2.setData(saveDat);
                req2.send();
              } catch (err) {
                alert(err);
              }
              this.win.close();
            }, this);
            
            this.win.open(); 
            this.win.moveTo(200, 100);
          } catch(err) {
            alert(err);
            this.win.close();
          }

          
          this.setResult(result);   
          req.resetTimeout();
        },
        this);
        
        req2.addListener("completed", function(evt)
        {
        	 saveResult = evt.getContent();
        }, this);
      

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
    },
    
    
    destruct : function()
    {
      //this._disposeFields("widgets");
      this._disposeObjects("this.win", "this.__content", "this.__state");
    }
    
    

    
    
  }
});