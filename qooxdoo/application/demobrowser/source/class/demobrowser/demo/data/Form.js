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

/**
 * @lint ignoreDeprecated(alert)
 * @tag databinding
 * @tag validation
 * @tag serialization
 */
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
      var dummyItem = new qx.ui.form.ListItem("-please select-", null, "X");
      genderSelectBox.add(dummyItem);
      var maleItem = new qx.ui.form.ListItem("male", null, "M");
      genderSelectBox.add(maleItem);
      var femaleItem = new qx.ui.form.ListItem("female", null, "F");
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
      var model = qx.data.marshal.Json.createModel(modelSkeleton);

      // create the controller
      var controller = new qx.data.controller.Object(model);

      // connect the name
      controller.addTarget(nameTextfield, "value", "name", true);

      // connect the select box
      controller.addTarget(
        genderSelectBox, "modelSelection[0]", "gender", true //, genderModel2Selection, genderSelection2Model
      );

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
      ////////////////////////////////////


      // validation //////////////////////

      // mark the fields as required
      nameTextfield.setRequired(true);
      okCheckBox.setRequired(true);

      // create the manager
      var manager = new qx.ui.form.validation.Manager();
      nameTextfield.setRequired(true);
      manager.add(nameTextfield);
      manager.add(okCheckBox);

      // validate the select box
      manager.setValidator(function(formItems) {
        var validGender = genderSelectBox.getSelection()[0] !== dummyItem;
        genderSelectBox.setValid(validGender);
        return validGender;
      });
      ////////////////////////////////////



      // serialization ///////////////////

      // serializer for qooxdoo objects
      var qxSerializer = function(object) {
        if (object instanceof qx.ui.form.ListItem) {
          return object.getLabel();
        }
      }

      // invoke the serialization
      sendButton.addListener("execute", function() {
        if (manager.validate()) {
          alert("You are sending: " + qx.util.Serializer.toUriParameter(model, qxSerializer));
        }
      }, this);
      ////////////////////////////////////


    }
  }
});

