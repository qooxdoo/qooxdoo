/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.TextArea",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __textArea: null,

    setUp : function()
    {
      var textArea = this.__textArea = new qx.ui.form.TextArea();
      this.getRoot().add(textArea);
      this.flush();
    },

    // Of course, <br/> in a function name is far from optimal
    
    //
    // _setAreaHeight
    //
    
    "test: _setAreaHeight<br/> sets height of textarea": function() {
      var textArea = this.__textArea;
      textArea._setAreaHeight(100);
      this.flush();

      var expectedHeight = textArea._getAreaHeight();
      this.assertEquals("100", expectedHeight, "Unexpected height of textarea element");
    },

    "test: _setAreaHeight<br/> adjusts height of the textarea's container": function() {
      var textArea = this.__textArea;
      textArea._setAreaHeight(100);
      this.flush();

      var insets = textArea.getInsets();
      var expectedHeight = insets.top + 100 + insets.bottom;
      this.assertEquals(expectedHeight, textArea.getHeight(), "Unexpected height of textarea widget");
    },
    
    
    //
    // _getAreaHeight
    //
    
    "test: _getAreaHeight<br/> gets actual height of textarea": function() {
      var textArea = this.__textArea;
      textArea.setHeight(100);
      this.flush();

      var insets = textArea.getInsets();
      var expectedHeight = -insets.top + 100 -insets.bottom;
      this.assertEquals(expectedHeight, textArea._getAreaHeight(), "Unexpected height of textarea element");
    },
    
    //
    // _getScrolledAreaHeight
    //

    "test: _getScrolledAreaHeight<br/> returns height larger than height of textarea when content triggers scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(10);
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      var cloneHeight = textArea._getScrolledAreaHeight();
      this.assert(cloneHeight > 10, "Scrolled area height must be larger than height of original textarea");
    },
    
    "test: _getTotalHeight<br/> returns increased height when value gets longer": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(10);
      
      textArea.setValue("Affe\nMaus\nElefant");
      var heightFirstStep = textArea._getScrolledAreaHeight();
      this.flush();
      
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      var heightSecondStep = textArea._getScrolledAreaHeight();
      this.flush();
      
      var msg =  "Scrolled area height must increase";
      this.assertNotEquals(heightSecondStep, heightFirstStep, msg);
      this.assert(heightSecondStep > heightFirstStep, msg);
    },

    "test: _getScrolledAreaHeight<br/> creates clone of textarea": function() {
      var textArea = this.__textArea;
      textArea._getScrolledAreaHeight();
      this.flush();
      
      var textAreaCount = qx.bom.Collection.query("textarea").length;
      this.assertEquals(2, textAreaCount);
    },
    
    "test: dispose<br/> removes original and cloned textarea": function() {
      var textArea = this.__textArea;
      textArea._getScrolledAreaHeight();
      this.flush();
      textArea.dispose();
      this.flush();
      
      var textAreaCount = qx.bom.Collection.query("textarea").length;
      this.assertEquals(0, textAreaCount);
    },

    // "test: textarea auto-grows when input would trigger scrollbar": function() {
    //
    // },

    // "test: textarea auto-shrinks when removal would hide scrollbar": function() {
    //
    // },

    // "test: textarea auto-grow shows scrollbar when above limit": function() {
    //
    // },

    tearDown : function()
    {
      this.__textArea.destroy();
    }
  }
});
