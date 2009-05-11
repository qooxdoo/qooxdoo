/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/flash/fo_tester.swf)
#asset(demobrowser/demo/flash/TestFlash.swf)

************************************************************************ */
qx.Class.define("demobrowser.demo.widget.Flash",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tabView = new qx.ui.tabview.TabView();
      var doc = this.getRoot();
      doc.add(tabView, {edge: 0});
      
      var page1 = new qx.ui.tabview.Page("Flash Demo 1");
      page1.setLayout(new qx.ui.layout.Canvas());
      page1.add(this.createFlashDemo1(), {edge: 0});
      page1.add(new qx.ui.basic.Label("Flash Demo 1"));
      tabView.add(page1);
      
      var page2 = new qx.ui.tabview.Page("Flash Demo 2");
      page2.setLayout(new qx.ui.layout.Canvas());
      page2.add(this.createFlashDemo2(), {edge: 0});
      tabView.add(page2);
    },
    
    
    /*
    ***************************************************************************
      SOURCE FOR FLASH DEMO 1
    ***************************************************************************
    */
    
    
    createFlashDemo1 : function ()
    {
      var variables = {
        flashVarText: "this is passed in via FlashVars"
      };
      
      return new qx.ui.embed.Flash("demobrowser/demo/flash/fo_tester.swf").set({
        scale: "noscale",
        variables : variables,
        backgroundColor : "#FF6600"
      });
    },
    
    
    /*
    ***************************************************************************
      SOURCE FOR FLASH DEMO 2
    ***************************************************************************
    */
    
    
    __flash : null,
      
    __messageFromFlash : null,
    
    __messageToFlash : null,
    
    __sendButton : null,
    
    createFlashDemo2 : function()
    {
      //Set for call back
      this.self(arguments).setCallBackInstance(this);
      
      var container = new qx.ui.container.Composite(
        new qx.ui.layout.HBox(8)
      );
      
      /*
       * Qooxdoo
       */
      var qooxdooContainer = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(4)
      );
      container.add(qooxdooContainer);
      
      qooxdooContainer.add(new qx.ui.basic.Label("<b>Qooxdoo:</b>").set({
        rich: true
      }));
      qooxdooContainer.add(new qx.ui.basic.Label("Message from Flash:"));
      this.__messageFromFlash = new qx.ui.form.TextArea("No message.");
      this.__messageFromFlash.setEnabled(false);
      this.__messageFromFlash.setWidth(300);
      this.__messageFromFlash.setHeight(100);
      qooxdooContainer.add(this.__messageFromFlash);
      
      qooxdooContainer.add(new qx.ui.basic.Label("Message to Flash:"));
      this.__messageToFlash = new qx.ui.form.TextArea("Qooxdoo is the best!");
      this.__messageToFlash.setWidth(300);
      this.__messageToFlash.setHeight(100);
      qooxdooContainer.add(this.__messageToFlash);
      
      var buttonBar = new qx.ui.container.Composite(
        new qx.ui.layout.HBox(0, "right")
      );
      
      this.__sendButton = new qx.ui.form.Button("Send to Flash");
      this.__sendButton.setEnabled(false);
      this.__sendButton.addListener("execute", function(e) {
        this.__flash.getFlashElement().sendMessage(this.__messageToFlash.getValue());
      }, this);
      
      buttonBar.add(this.__sendButton); 
      qooxdooContainer.add(buttonBar);
      
      /*
       * Flash
       */
      var flashConteiner = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(4)
      );
      container.add(flashConteiner);
      
      flashConteiner.add(new qx.ui.basic.Label("Flash:").set({
        rich: true
      }));
      
      this.__flash = new qx.ui.embed.Flash("demobrowser/demo/flash/TestFlash.swf");
      this.__flash.addListener("appear", this.__onAppear, this);
      this.__flash.setWidth(400);
      this.__flash.setHeight(300);
      flashConteiner.add(this.__flash);
      
      return container;
    },
    
    sendMessage : function(message)
    { 
      this.__messageFromFlash.setValue(message);  
    },
      
    __onAppear : function(e)
    {
      var timer = new qx.event.Timer(100);
      var count = 0;
      
      timer.addListener("interval", function()
      {
        try
        {
          count++;
          if (count < 50) {
            this.__flash.getFlashElement().setup("demobrowser.demo.widget.Flash.getCallBackInstance().sendMessage");
            this.__sendButton.setEnabled(true);
          } else {
            alert("Couldn't connect to Flash Player! Please make sure that:\n" 
                + "1) no pop-up or advertising blocker is activated.\n"
                + "2) this html page is not loaded from the file system, but a webserver.");
          }
          timer.stop();
        } catch(e) {}
      }, this);
      
      timer.start();
    }
  },
  
  /*
  *****************************************************************************
      SOURCE FOR FLASH DEMO 2
  *****************************************************************************
  */
  statics :
  {
    __callBackInstance : null,
    
    setCallBackInstance : function (CallBackInstance)
    {
      demobrowser.demo.widget.Flash.__callBackInstance = CallBackInstance;
    },
    
    getCallBackInstance : function () 
    {
      return demobrowser.demo.widget.Flash.__callBackInstance;
    }
  }
});
