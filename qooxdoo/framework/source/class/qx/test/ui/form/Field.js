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
qx.Class.define("qx.test.ui.form.Field",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    tearDown : function() {

    },

    testSelectTextAllBeforeFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      textfield.selectAllText();

      this.flush();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(1000, function() {
        self.assertEquals("affe", textfield.getTextSelection());
        textfield.destroy();
      });
    },


    testSelectAllTextAfterFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      this.flush();

      textfield.selectAllText();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(1000, function() {
        self.assertEquals("affe", textfield.getTextSelection());
        textfield.destroy();
      });
    },


    testClearTextSelectionBeforeFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      textfield.selectAllText();
      textfield.clearTextSelection()

      this.flush();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(100, function() {
        self.assertEquals("", textfield.getTextSelection());
        textfield.destroy();
      });
    },


    testClearTextSelectionAfterFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      this.flush();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(1000, function() {
        textfield.selectAllText();
        textfield.clearTextSelection()
        self.assertEquals("", textfield.getTextSelection());
        textfield.destroy();
      });
    },


    testGetTextSelectionStartEndAfterFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      this.flush();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(1000, function() {
        textfield.setTextSelection(1, 2);
        self.assertEquals(1, textfield.getTextSelectionStart());
        self.assertEquals(2, textfield.getTextSelectionEnd());
        textfield.destroy();
      });
    },


    testGetTextSelectionStartEndBeforeFlush : function()
    {
      var textfield = new qx.ui.form.TextField("affe");
      this.getRoot().add(textfield);

      textfield.focus();
      textfield.setTextSelection(2, 3);

      this.flush();

      // test this asynchron because opera 9.x seems to cache the creation of DOM elements
      var self = this;
      this.wait(100, function() {
        self.assertEquals(2, textfield.getTextSelectionStart());
        self.assertEquals(3, textfield.getTextSelectionEnd());
        textfield.destroy();
      });
    }
  }
});