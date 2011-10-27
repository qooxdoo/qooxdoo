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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.Focus",
{
  extend : qx.test.ui.LayoutTestCase,


  members :
  {
    getContainer : function()
    {
      if (!this._container)
      {
        var grid = new qx.ui.layout.Grid(10, 10);
        this._container = new qx.ui.container.Composite(grid).set({
          padding: 20
        });
        this.getRoot().add(this._container);
      }
      return this._container;
    },


    setUp : function()
    {
      this.flush();

      this.ref = new qx.ui.form.TextField();
      this.addReferenceInput();
      this.ref.focus();
      this.flush();

      this.ref.addListener("blur", this.onRefBlur, this);

      this.ref_blur_called = false;
      this.target_focus_called = false;
      this.target_blur_called = false;

      this.flush();

      this.input = new qx.ui.form.TextField();
      this.input.addListener("focus", this.onInputFocus, this);
      this.input.addListener("blur", this.onInputBlur, this);
    },


    tearDown : function()
    {
      this.base(arguments);
      if (this.input) {
        this.input.destroy();
      }

      if (this.ref) {
        this.ref.destroy();
      }

      if (this._container)
      {
        this._container.destroy();
        this._container = null;
      }
      this.flush();
    },


    addInput : function() {
      this.getContainer().add(this.input, {row: 2, column: 0})
    },


    addReferenceInput : function() {
      this.getContainer().add(this.ref, {row: 1, column: 0, colSpan: 2});
    },


    onRefBlur : function()
    {
      this.ref_blur_called = true;
    },


    onInputFocus : function()
    {
      this.target_focus_called = true;
    },


    onInputBlur : function()
    {
      this.target_blur_called = true;
    },


    testNotInsertedBeforeFlush : function()
    {
      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.addInput();
    },


    testExcludedBeforeFlush : function()
    {
      this.addInput();
      this.input.exclude();
      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.input.show();
    },


    testHiddenBeforeFlush : function()
    {
      this.addInput();
      this.input.hide();
      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.input.show();
    },


    testNotInsertedAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.getLayoutParent().remove(this.input);
      this.flush();

      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.addInput();
    },


    testExcludedAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.getLayoutParent().remove(this.input);
      this.flush();

      this.addInput();
      this.input.exclude();
      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.input.show();
    },


    testHiddenAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.getLayoutParent().remove(this.input);
      this.flush();

      this.addInput();
      this.input.hide();
      this.input.focus();
      this.flush();

      this.assertFalse(this.ref_blur_called);
      this.assertFalse(this.target_focus_called);
      this.assertFalse(this.target_blur_called);

      this.input.show();
    },


     testInsertedBeforeFlush : function()
     {
       this.addInput();
       this.input.focus();
       this.flush();

       this.assertTrue(this.ref_blur_called, "reference must be blured");
       this.assertTrue(this.target_focus_called, "target must be focued");
       this.assertFalse(this.target_blur_called, "target must not be blured");
     },


    testFocusRemoveBeforeFlush : function()
    {
      this.addInput();
      this.input.focus();
      this.flush();

      this.input.getLayoutParent().remove(this.input);
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertTrue(this.target_blur_called);

      this.addInput();
    },


    testFocusExcludeBeforeFlush : function()
    {
      this.addInput();
      this.input.focus();
      this.flush();

      this.input.exclude();
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertTrue(this.target_blur_called);

      this.input.show();
    },


    testFocusHideBeforeFlush : function()
    {
      this.addInput();
      this.input.focus();
      this.flush();

      this.input.hide();
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertTrue(this.target_blur_called);

      this.input.show();
    },


    testInsertedAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.focus();
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertFalse(this.target_blur_called);
    },


    testFocusRemoveAfterFlush : function()
    {
      this.addInput();
      this.input.focus();
      this.flush();

      this.input.getLayoutParent().remove(this.input);
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertTrue(this.target_blur_called);

      this.addInput();
    },


    testFocusExcludeAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.focus();
      this.flush();

      this.input.exclude();
      this.flush();

      this.assertTrue(this.ref_blur_called);
      this.assertTrue(this.target_focus_called);
      this.assertTrue(this.target_blur_called);

      this.input.show();
    },


    testFocusHideAfterFlush : function()
    {
      this.addInput();
      this.flush();
      this.input.focus();
      this.flush();

      this.input.hide();
      this.flush();

      this.assertTrue(this.ref_blur_called, "reference must be blured");
      this.assertTrue(this.target_focus_called, "target must be focused");
      this.assertTrue(this.target_blur_called, "target must be blured");

      this.input.show();
    },


    testFocusComboBox : function() {
      var comboBox = new qx.ui.form.ComboBox();
      this.getRoot().add(comboBox);
      comboBox.focus();
      this.flush();

      this.assertEquals(
        comboBox.getChildControl("textfield"),
        qx.ui.core.FocusHandler.getInstance().getActiveWidget()
      );

      comboBox.destroy();
    }

  },

  destruct : function() {
    this.ref = this.input = null;
  }
});
