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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @tag noPlayground
 * @tag single value binding
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.SingleValueBinding",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      /* Event binding */

      // create the headline label
      this.getRoot().add(new qx.ui.basic.Label("Event binding"), {top: 10, left: 10});
      // source textfield
      var textFieldSimple = new qx.ui.form.TextField("Change me...");
      textFieldSimple.setLiveUpdate(true);
      this.getRoot().add(textFieldSimple, {top: 30, left: 10});
      // target label
      var labelSimple = new qx.ui.basic.Label("Change me...");
      this.getRoot().add(labelSimple, {top: 32, left: 120});
      // bind the input event of the textfield to the label content
      textFieldSimple.bind("changeValue", labelSimple, "value");




      /* With default conversion */

      // create the headline label
      this.getRoot().add(new qx.ui.basic.Label("With default conversion"), {top: 80, left: 10});
      // create the source slider
      var sliderConvert = new qx.ui.form.Slider();
      sliderConvert.setWidth(100);
      this.getRoot().add(sliderConvert, {top: 100, left: 10});
      // create the target label
      var labelConvert = new qx.ui.basic.Label("");
      this.getRoot().add(labelConvert, {top: 100, left: 120});
      // bind the slider value to the label content
      sliderConvert.bind("value", labelConvert, "value");





      /* With self defined conversion */

      // create the headline label
      this.getRoot().add(new qx.ui.basic.Label("With own conversion"), {top: 150, left: 10});
      // create the source slider
      var sliderSelfConvert = new qx.ui.form.Slider();
      sliderSelfConvert.setWidth(100);
      this.getRoot().add(sliderSelfConvert, {top: 180, left: 10});
      // create the target label
      var labelSelfConvert = new qx.ui.basic.Label("");
      this.getRoot().add(labelSelfConvert, {top: 180, left: 120});
      // create the options with the converter
      var options = {converter: function(value) {
        if (value < 50) {
          return "Lower than 50!";
        } else {
          return "Bigger than 50!";
        }
      }};
      // bind the slider value to the label content
      sliderSelfConvert.bind("value", labelSelfConvert, "value", options);





      /* Array and deep binding */

      // create the headlinelabel
      this.getRoot().add(new qx.ui.basic.Label("Array binding"), {top: 240, left: 10});

      // build the object structure
      var rootNode = new demobrowser.demo.data.model.Node();
      var node1 = new demobrowser.demo.data.model.Node();
      var node2 = new demobrowser.demo.data.model.Node();
      node2.setNames(new qx.data.Array("Bart", "Lisa"));
      rootNode.setChild(node1);

      // reverse the array button and handler
      var reverseButton = new qx.ui.form.Button("Reverse");
      this.getRoot().add(reverseButton, {top: 260, left: 10});
      reverseButton.addListener("execute", function() {
        rootNode.getChild().getNames().reverse();
      }, this);

      // swap child between node1 and node2 button and handler
      var changeChildButton = new qx.ui.form.Button("Toggle child");
      this.getRoot().add(changeChildButton, {top: 260, left: 80});
      changeChildButton.addListener("execute", function() {
        if (rootNode.getChild () == node1) {
          rootNode.setChild(node2);
        } else {
          rootNode.setChild(node1);
        }
      }, this);

      // target labels
      this.getRoot().add(new qx.ui.basic.Label("First:"), {left: 10, top: 295});
      this.getRoot().add(new qx.ui.basic.Label("Last:"), {left: 60, top: 295});
      var labelArrayFirst = new qx.ui.basic.Label();
      this.getRoot().add(labelArrayFirst, {top: 310, left: 10});
      var labelArrayLast = new qx.ui.basic.Label();
      this.getRoot().add(labelArrayLast, {top: 310, left: 60});

      // bind the target lables
      rootNode.bind("child.names[0]", labelArrayFirst, "value");  // first
      rootNode.bind("child.names[last]", labelArrayLast, "value");




      /* Validation binding */

      // create the headline label
      this.getRoot().add(new qx.ui.basic.Label("With validation"), {top: 390, left: 10});
      // create the source slider
      var validationTextField = new qx.ui.form.TextField("10");
      validationTextField.setLiveUpdate(true);
      this.getRoot().add(validationTextField, {top: 410, left: 10});
      // create the validation label
      var labelValidation = new qx.ui.basic.Label("");
      this.getRoot().add(labelValidation, {top: 412, left: 120});

      // create the options with the converter
      var options = {
        onUpdate : function() {
          labelValidation.setValue("");
          validationTextField.setValid(true);
        },
        onSetFail : function(e) {
          labelValidation.setValue("No number!");
          validationTextField.setValid(false);
        }
      };
      // bind the slider value to the label content
      validationTextField.bind("changeValue", rootNode, "number", options);









      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // Event binding description
      var eventDescription = new qx.ui.basic.Label();
      eventDescription.setRich(true);
      eventDescription.setWidth(450);
      eventDescription.setValue(
        "<b>Description</b><br/>"
        + "Binding an data event, containing the change of the textfield to"
        + " the label."
      );
      this.getRoot().add(eventDescription, {left: 250, top: 10});

      // Default conversion binding description
      var defaultDescription = new qx.ui.basic.Label();
      defaultDescription.setRich(true);
      defaultDescription.setWidth(450);
      defaultDescription.setValue(
        "<b>Description</b><br/>"
        + "Binding a number value (slider value) to a labels string (content)."
        + " The default conversion will handle the type conversion."
      );
      this.getRoot().add(defaultDescription, {left: 250, top: 80});

      // Own conversion binding description
      var ownDescription = new qx.ui.basic.Label();
      ownDescription.setRich(true);
      ownDescription.setWidth(450);
      ownDescription.setValue(
        "<b>Description</b><br/>"
        + "Binding a slider value to a labels text but conversion the number "
        + "with a self written converter to a string only saying it its "
        + " above or below 50."
      );
      this.getRoot().add(ownDescription, {left: 250, top: 150});

      // Description for the array and deep binding
      var deepDescription = new qx.ui.basic.Label();
      deepDescription.setRich(true);
      deepDescription.setWidth(450);
      deepDescription.setValue(
        "<b>Description</b><br/>"
        + "Binding of node elements containing a node as child and an array "
        + "of names.<br/>The reverse button reverses the current selected child "
        + "names array.<br/>Toggle child will change the child of the root node "
        + "from a node containing ['Homer', 'Marge'] as names to a node "
        + "containing ['Bart', 'Lisa'] as names."
      );
      this.getRoot().add(deepDescription, {left: 250, top: 240});

      // Description for the validation binding
      var validationDescription = new qx.ui.basic.Label();
      validationDescription.setRich(true);
      validationDescription.setWidth(450);
      validationDescription.setValue(
        "<b>Description</b><br/>"
        + "Binding the textfield to a property with a validation. The validator"
        + " in the object only accepts numbers. On a validation fail, a red "
        + " border will surround the textfield."
      );
      this.getRoot().add(validationDescription, {left: 250, top: 390});


    }
  }
});

