/* ************************************************************************

   Copyright:


   License:

   Authors:

 ************************************************************************ */

/**
 * This is the main application class of your custom application "dragndrop"
 * 
 * @asset(qx/icon/Tango/16/status/dialog-error.png)
 */
qx.Class.define("objectid.Application", {
  extend: qx.application.Standalone,

  members: {
    main: function() {
      this.base(arguments);

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.appender.Native;
        qx.log.appender.Console;
      }

      var root = this.getRoot();
      
      root.add(new qx.ui.basic.Label("Use the DOM Elements inspector to look at the widgets, " +
      		"check out the 'data-object-id' attributes.<br>\n" +
      		"<br>\n" +
      		"Click the 'Run Test' button and then try this code in console:")
        .set({ rich: true }), { left: 100, top: 20 });
      root.add(new qx.ui.form.TextArea().set({ 
        value: "var edtName = $(\"input[data-object-id='application/exampleEditor/edtName']\");\n" +
        		"console.log(edtName);\n" +
          "console.log(edtName.$$widgetObject);\n" +
          "console.log(edtName.$$widgetObject.classname);\n" +
          "console.log(edtName.$$widgetObject.getValue());\n",
        readOnly: true, width: 600, height: 85 }), 
        { left: 100, top: 80 });
      root.add(this.getObject("btnRunTest"), { left: 100, top: 200 });
      root.add(this.getObject("lblTestResult"), { left: 250, top: 200 });

      var model = qx.data.marshal.Json.createModel([
        { name: "Mr" },
        { name: "Miss" },
        { name: "Mrs" },
        { name: "Rev" }
      ]);
      this.getObject("exampleEditor/ctlrTitle").setModel(model);

      root.add(this.getObject("exampleEditor/container"), { left: 100, top: 250 });
    },
    
    _createObjectImpl: function(id) {
      switch(id) {
      case "exampleEditor":
        return new objectid.ExampleEditor();
        
      case "btnRunTest":
        var btn = new qx.ui.form.Button("Run Test");
        btn.addListener("execute", () => {
          var edt = qx.core.Id.getObject("application/exampleEditor/edtName");
          edt.setValue("John Smith");
          
          var A = qx.core.Assert;
          
          var id = edt.getContentElement().getAttribute("data-object-id");
          A.assertTrue(id === "application/exampleEditor/edtName");
          
          var dom = qx.bom.Selector.query("input[data-object-id='application/exampleEditor/edtName']")[0]
          A.assertTrue(!!dom);
          var widget = qx.ui.core.Widget.getWidgetByElement(dom);
          A.assertTrue(widget === edt);
          this.getObject("lblTestResult").setValue("Tests completed OK");
        });
        return btn;
        
      case "lblTestResult":
        return new qx.ui.basic.Label("Test not run").set({ allowGrowX: true, rich: true });
      }
      
      return this.base(arguments, id);
    }
  }
});
