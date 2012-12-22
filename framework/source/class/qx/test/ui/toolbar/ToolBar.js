/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.toolbar.ToolBar",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
     setUp : function()
    {
      this.base(arguments);
      this.__toolbar = new qx.ui.toolbar.ToolBar();
      this.__b1 = new qx.ui.toolbar.Button("b1");
      this.__b2 = new qx.ui.toolbar.Button("b2");
      this.__b3 = new qx.ui.toolbar.Button("b3");
    },


    tearDown : function()
    {
      this.base(arguments);
      this.__b1.dispose();
      this.__b2.dispose();
      this.__b3.dispose();
      this.__toolbar.dispose();
    },


    testShowSyncing : function() {
      // setup toolbar with two buttons
      this.__toolbar.add(this.__b1);
      this.__toolbar.add(this.__b2);

      // set a value and check if the buttons get synced
      this.__toolbar.setShow("label");
      this.assertEquals("label", this.__b1.getShow());
      this.assertEquals("label", this.__b2.getShow());

      // add another button and check if the value has been applied
      this.__toolbar.add(this.__b3);
      this.assertEquals("label", this.__b3.getShow());
    },


    testShowUserValueShouldTakePrecedence : function() {
      // setup toolbar with two buttons
      this.__toolbar.add(this.__b1);
      this.__toolbar.add(this.__b2);

      // assert 'label' isn't default show val
      this.assertNotEquals("label", this.__b1.getShow());
      this.assertNotEquals("label", this.__b2.getShow());

      // initialize toolbar with 'label'
      this.__toolbar.setShow("label");
      this.assertEquals("label", this.__b1.getShow());
      this.assertEquals("label", this.__b2.getShow());

      // override it for button1
      this.__b1.setShow("icon");
      this.assertEquals("icon", this.__b1.getShow());
      this.assertEquals("label", this.__b2.getShow());

      // change it afterwards
      this.__toolbar.setShow("both");
      this.__toolbar.add(this.__b3);

      // assert all 'both'
      this.assertEquals("both", this.__b1.getShow());
      this.assertEquals("both", this.__b2.getShow());
      this.assertEquals("both", this.__b3.getShow());
    }
  }
});
