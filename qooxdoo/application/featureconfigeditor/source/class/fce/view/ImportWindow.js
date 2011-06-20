/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/* ************************************************************************
#asset(qx/icon/Tango/16/actions/window-new.png)
************************************************************************ */

qx.Class.define("fce.view.ImportWindow", {

  extend : qx.ui.window.Window,
  
  properties :
  {
    featureMap :
    {
      event : "changeFeatureMap"
    }
  },
  
  construct : function()
  {
    this.base(arguments, "Import Feature Map", "icon/16/actions/window-new.png");
    this.setWidth(300);
    this.setHeight(400);
    
    this.setLayout(new qx.ui.layout.VBox(10));
    
    var nameLabel = new qx.ui.basic.Label("Feature Set Name");
    this.add(nameLabel);
    var nameField = this.__nameField =  new qx.ui.form.TextField();
    this.add(nameField);
    nameLabel.setBuddy(nameField);
    
    var featuresLabel = new qx.ui.basic.Label("Feature Set Definition (JSON)");
    this.add(featuresLabel);
    var featuresArea = this.__featuresArea = new qx.ui.form.TextArea();
    this.add(featuresArea, {flex: 1});
    featuresLabel.setBuddy(featuresArea);
    
    var importButton = new qx.ui.form.Button("Import");
    importButton.setAlignX("center");
    importButton.setAllowGrowX(false);
    this.add(importButton);
    
    importButton.addListener("execute", this._onImport, this);
  },
  
  members :
  {
    __nameField : null,
    __featuresArea : null,
    
    _onImport : function()
    {
      var name = this.__nameField.getValue();
      var json = this.__featuresArea.getValue();
      
      if (!name) {
        //TODO: Display error message
      }
      
      if (!json) {
        //TODO: Display error message
      }
      
      var data;
      try {
        data = qx.lang.Json.parse(json);
      }
      catch(ex) {
        //TODO: Display error message
        return;
      }
      
      var featureMap = {};
      featureMap[name] = data;
      this.setFeatureMap(featureMap);
      this.__nameField.setValue("");
      this.__featuresArea.setValue("");
      this.close();
    }
  }
});