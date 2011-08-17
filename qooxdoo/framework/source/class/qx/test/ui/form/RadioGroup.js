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
     * Alexander Steitz (aback)

************************************************************************ */
qx.Class.define("qx.test.ui.form.RadioGroup",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__radioGroup = new qx.ui.form.RadioGroup;
      this.__radioGroup.setAllowEmptySelection(true);

      this.__radioButtons = [];
      var radioButton;
      for (var i=0, j=3; i<j; i++)
      {
        radioButton = new qx.ui.form.RadioButton("option " + i);
        radioButton.setModel("option" + i);

        this.__radioButtons.push(radioButton);
        this.__radioGroup.add(radioButton);
      }
    },

    tearDown : function()
    {
      this.base(arguments);
      var radioButton;
      for (var i=0, j=this.__radioButtons.length; i<j; i++)
      {
        this.__radioGroup.remove(this.__radioButtons[i]);
        radioButton = this.__radioButtons.shift();
        radioButton.dispose();
      }
      this.__radioGroup.dispose();

      this.__radioButtons = null;
    },

    testHiddenRadioButtons : function()
    {
      var composite = new qx.ui.container.Composite;
      for (var i=0, j=this.__radioButtons.length; i<j; i++) {
        composite.add(this.__radioButtons[i]);
      }

      this.getRoot().add(composite, { left : 100, top  : 50 });

      // check the 'modelSelection' with all radio buttons visible
      this.__radioGroup.setModelSelection( [this.__radioButtons[1].getModel()] );

      this.assertEquals(this.__radioButtons[1].getModel(), this.__radioGroup.getModelSelection().getItem(0), "Model selection does not work correctly!");
      this.assertTrue(this.__radioGroup.isSelected(this.__radioButtons[1]), "Wrong radio button selected!");

      // now hide the radio group and check if the selection change still works
      for (var i=0, j=this.__radioButtons.length; i<j; i++) {
        this.__radioButtons[i].exclude();
      }

      this.__radioGroup.setModelSelection( [this.__radioButtons[0].getModel()] );
      this.assertEquals(this.__radioButtons[0].getModel(), this.__radioGroup.getModelSelection().getItem(0), "Model selection does not work correctly!");
      this.assertTrue(this.__radioGroup.isSelected(this.__radioButtons[0]), "Hidden radio button not selected!");
      composite.destroy();
    }
  }
});