/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/data/finder.json)

************************************************************************ */

qx.Class.define("demobrowser.demo.data.Form", 
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      
      // create the UI ///////////////////
      
      // groupbox
      var groupBox = new qx.ui.groupbox.GroupBox("Registration");
      groupBox.setWidth(200);
      this.getRoot().add(groupBox, {left: 10, top: 10});
      var grid = new qx.ui.layout.Grid();
      grid.setSpacing(5);
      grid.setColumnAlign(0, "left", "middle")
      groupBox.setLayout(grid);

      // name
      var nameLabel = new qx.ui.basic.Label("Name:");
      groupBox.add(nameLabel, {row: 0, column: 0});

      var nameTextfield = new qx.ui.form.TextField();
      groupBox.add(nameTextfield, {row: 0, column: 1});
      
      // gender
      var genderLabel = new qx.ui.basic.Label("Gender:");
      groupBox.add(genderLabel, {row: 1, column: 0});
      
      var genderSelectBox = new qx.ui.form.SelectBox();
      var dummyItem = new qx.ui.form.ListItem("-please select-");
      genderSelectBox.add(dummyItem);
      var maleItem = new qx.ui.form.ListItem("male");
      genderSelectBox.add(maleItem);
      var femaleItem = new qx.ui.form.ListItem("female");
      genderSelectBox.add(femaleItem);
      groupBox.add(genderSelectBox, {row: 1, column: 1});
      
      // ok
      var okLabel = new qx.ui.basic.Label("Ok:");
      groupBox.add(okLabel, {row: 2, column: 0});
      
      var okCheckBox = new qx.ui.form.CheckBox();
      groupBox.add(okCheckBox, {row: 2, column: 1});
      
      // serialize button
      var sendButton = new qx.ui.form.Button("Send");
      groupBox.add(sendButton, {row: 3, column: 0});
      ////////////////////////////////////
      
      
      // binding /////////////////////////
      
      // create a model
      var modelSkeleton = {name: null, gender: null, ok: 0, hidden: "x"};
      var marshaler = new qx.data.marshal.Json();
      marshaler.jsonToClass(modelSkeleton);
      var model = marshaler.jsonToModel(modelSkeleton);
      
      // create the controller
      var controller = new qx.data.controller.Object(model);

      // connect the name
      controller.addTarget(nameTextfield, "value", "name", true);
      
      // connect the checkbox (boolean to int conversion)
      var okModel2CheckBox = {converter: function(data) {
        return data === 1;
      }}
      var okCheckBox2Model = {converter: function(data) {
        return data ? 1 : 0;
      }}
      controller.addTarget(
        okCheckBox, "value", "ok", true, okModel2CheckBox, okCheckBox2Model
      );

      // connect the selectbox (convert selection to string)
      var genderSelection2Model = {converter : function(data) {
        return data[0].getLabel();
      }}
      var genderModel2Selection = {converter : function(data) {
        var selectables = genderSelectBox.getSelectables();
        for (var i = 0; i < selectables.length; i++) {
          if (selectables[i].getLabel() == data) {
            return [selectables[i]];
          }
        }
        return [selectables[0]];
      }}
      controller.addTarget(
        genderSelectBox, "selection", "gender", true, 
        genderModel2Selection, genderSelection2Model
      );
      
      ////////////////////////////////////


      // validation //////////////////////
      
      // mark the fields as required
      nameTextfield.setRequired(true);
      okCheckBox.setRequired(true);
      
      // create the manager
      var manager = new qx.ui.form.validation.Manager();
      manager.add(nameTextfield, qx.util.Validate.required);
      manager.add(okCheckBox);     

      // validate the select box
      manager.setValidator(function(formItems) {
        var validGender = genderSelectBox.getSelection()[0] !== dummyItem;
        genderSelectBox.setValid(validGender);
        return validGender;
      });
      ////////////////////////////////////            



      // serialization ///////////////////
      
      // prototype serializer
      var serializer = function(object) {
        var result = "";
        var properties = object.constructor.$$properties;
        for (var name in properties) {
          result += name + "=" + object["get" + qx.lang.String.firstUp(name)]() + "&";
        }
        return result.substring(0, result.length - 1);
      }

      // invoke the serialization
      sendButton.addListener("execute", function() {
        if (manager.validate()) {
          alert("You are sending: " + serializer(model));
        }
      }, this);
      ////////////////////////////////////
      
  
    }
  }
});

