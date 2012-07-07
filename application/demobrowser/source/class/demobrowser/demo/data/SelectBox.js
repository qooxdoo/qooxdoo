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
 * @tag databinding
 */
qx.Class.define("demobrowser.demo.data.SelectBox",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create a dummy model
      var model = new qx.data.Array(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]);

      // first example, binding a selectbox and sync the selection
      var selectBox1 = new qx.ui.form.SelectBox();
      this.getRoot().add(selectBox1, {left: 10, top: 110});
      // connect the selectbox
      var controller1 = new qx.data.controller.List(model, selectBox1);

      var selectBox2 = new qx.ui.form.SelectBox();
      this.getRoot().add(selectBox2, {left: 150, top: 110});
      // connect the selectbox
      var controller2 = new qx.data.controller.List(model, selectBox2);

      // sync the selection
      controller1.setSelection(controller2.getSelection());

      // show the selection in a label
      var selectionLabel = new qx.ui.basic.Label();
      this.getRoot().add(new qx.ui.basic.Label("The selection is: "), {left: 10, top: 140});
      this.getRoot().add(selectionLabel, {left: 110, top: 140});

      controller1.bind("selection[0]", selectionLabel, "value");


      // selection change via textField (read/write)
      var selectionText = new qx.ui.form.TextField("A");
      selectionText.setLiveUpdate(true);
      selectionText.setWidth(150);
      this.getRoot().add(selectionText, {left: 290, top: 110});

      // textfield --> selection binding
      selectionText.bind("value", controller1, "selection[0]");
      // selection --> textfield
      controller1.bind("selection[0]", selectionText, "value");


      // setting the selection without an event but a known value
      var setButton = new qx.ui.form.Button("Set Selection to 'C'");
      setButton.setWidth(150);
      this.getRoot().add(setButton, {left: 290, top: 140});
      setButton.addListener("execute", function() {
        controller1.getSelection().setItem(0, "C");
      }, this);



      /* ***********************************************
       * DESCRIPTIONS
       * ********************************************* */
      // SelectBox sync description
      var syncBoxDescription = new qx.ui.basic.Label();
      syncBoxDescription.setRich(true);
      syncBoxDescription.setWidth(240);
      syncBoxDescription.setValue(
        "<b>Synchronized Selection</b><br/>"
        + "Bound to the same data and share the selection. The label is also bound to the selection."
      );
      this.getRoot().add(syncBoxDescription, {left: 10, top: 10});

      // Controls description
      var controlDescription = new qx.ui.basic.Label();
      controlDescription.setRich(true);
      controlDescription.setWidth(130);
      controlDescription.setValue(
        "<b>Change Selection</b><br/>"
        + "Type in the textfield or set the selection with the button."
      );
      this.getRoot().add(controlDescription, {left: 300, top: 10});
    }
  }
});