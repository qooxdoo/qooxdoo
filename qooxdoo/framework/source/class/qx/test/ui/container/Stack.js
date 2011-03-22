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
     * Adrian Olaru (adrianolaru)

************************************************************************ */
qx.Class.define("qx.test.ui.container.Stack",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __stack : null,
    __c1 : null,
    __c2 : null,
    __c3 : null,


    setUp : function() {
      var stack = this.__stack = new qx.ui.container.Stack();

      var c1 = this.__c1 = new qx.ui.container.Composite();
      var c2 = this.__c2 = new qx.ui.container.Composite();
      var c3 = this.__c3 = new qx.ui.container.Composite();

      c1.set({ backgroundColor : "#F00", width : 200, height : 200 });
      c2.set({ backgroundColor : "#0F0", width : 200, height : 200 });
      c3.set({ backgroundColor : "#00F", width : 200, height : 200 });

    },


    tearDown : function() {
      this.__stack.destroy();
      this.__c1.destroy();
      this.__c2.destroy();
      this.__c3.destroy();
    },

   /**
    * if stack doesn't have a child selected,
    * the new added child should be selected
    */
    testAddAndSelectChild: function() {
      this.__stack.add(this.__c1);
      this.assertIdentical( this.__c1, this.__stack.getSelection()[0]);
    },


    /**
     * if stack has a selected child,
     * the new added one should be excluded/hide but not selected.
     */
    testAddAndDontSelectChildInADynamicStack: function() {
      this.__stack.setDynamic(false);
      this.__stack.add(this.__c1);
      this.__stack.add(this.__c2);
      this.assertIdentical(this.__c1, this.__stack.getSelection()[0]);
      this.assertTrue(this.__c2.isHidden());
    },


    /**
     * if stack has a selected child,
     * the new added one should be excluded/hide but not selected.
     */
    testAddAndDontSelectChildInANonDynamicStack: function() {
      this.__stack.setDynamic(true);
      this.__stack.add(this.__c1);
      this.__stack.add(this.__c2);
      this.assertIdentical(this.__c1, this.__stack.getSelection()[0]);
      this.assertTrue(this.__c2.isExcluded());
    },


    /**
     *if we remove child, selected the first one
     */
    testRemoveSelectedChildSelectFirstOne: function() {
      this.__stack.add(this.__c1);
      this.__stack.add(this.__c2);
      this.__stack.setSelection([this.__c2]);
      this.__stack.remove(this.__c2);

      this.assertIdentical(this.__c1, this.__stack.getSelection()[0]);
    },


    /**
     * if we remove child, and stack doesn't have any children left,
     * reset selection.
     */
    testRemoveSelectedChildResetSelection: function() {
      this.__stack.add(this.__c1);
      this.__stack.add(this.__c2);
      this.__stack.add(this.__c3);
      this.__stack.remove(this.__c1);
      this.__stack.remove(this.__c2);
      this.__stack.remove(this.__c3);

      this.assertArrayEquals([], this.__stack.getSelection());
    }
  }

});
