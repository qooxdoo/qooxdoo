/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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


    testPositionStates : function() {
      var part = new qx.ui.toolbar.Part();
      part.add(this.__b1);
      part.add(this.__b2);
      part.add(this.__b3);
      this.__toolbar.add(part);

      this.getRoot().add(this.__toolbar);
      this.flush();

      this.assertTrue(this.__b1.hasState("left"));
      this.assertTrue(this.__b2.hasState("middle"));
      this.assertTrue(this.__b3.hasState("right"));

      part.dispose();
    },


    testPositionStatesAdd : function() {
      var part = new qx.ui.toolbar.Part();
      part.add(this.__b1);
      part.add(this.__b3);
      this.__toolbar.add(part);

      this.getRoot().add(this.__toolbar);
      this.flush();

      this.assertTrue(this.__b1.hasState("left"));
      this.assertTrue(this.__b3.hasState("right"));

      part.addAt(this.__b2, 1);
      this.flush();

      this.assertTrue(this.__b1.hasState("left"));
      this.assertTrue(this.__b2.hasState("middle"));
      this.assertTrue(this.__b3.hasState("right"));

      part.dispose();
    },


    testPositionStatesRemove : function() {
      var part = new qx.ui.toolbar.Part();
      part.add(this.__b1);
      part.add(this.__b2);
      part.add(this.__b3);
      this.__toolbar.add(part);

      this.getRoot().add(this.__toolbar);
      this.flush();

      this.assertTrue(this.__b1.hasState("left"));
      this.assertTrue(this.__b2.hasState("middle"));
      this.assertTrue(this.__b3.hasState("right"));

      part.remove(this.__b1);
      this.flush();

      this.assertTrue(this.__b2.hasState("left"));
      this.assertTrue(this.__b3.hasState("right"));

      part.dispose();
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
    },
    
    testRemoveChildByIndex : function() {
      this.__toolbar.removeAll();
      
      // setup toolbar with three buttons
      this.__toolbar.add(this.__b1);
      this.__toolbar.add(this.__b2);
      this.__toolbar.add(this.__b3);

      // assert finding child __b2 on index 1
      var indexB2 = this.__toolbar.indexOf(this.__b2);
      this.assertEquals(1, indexB2);

      // assert removing child at index 1
      var childB2 = this.__toolbar.removeAt(1);
      this.assertEquals(childB2, this.__b2);
      
      // assert length of remaining and removed children array being now 2
      var children = this.__toolbar.removeAll();
      this.assertEquals(2, children.length);
    },
    
    testRemoveAllChildren : function() {
      this.__toolbar.removeAll();
      
      // setup toolbar with two buttons
      this.__toolbar.add(this.__b1);
      this.__toolbar.add(this.__b2);

      // assert length of removed children array
      var children = this.__toolbar.removeAll();
      this.assertEquals(2, children.length);

      // assert empty children array
      children = this.__toolbar.removeAll();
      this.assertEquals(0, children.length);
    }
  }
});
