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
    
    "test: _getAreaHeight<br/> gets actual height of textarea": function() {
      var textArea = this.__textArea;
      textArea.setHeight(100);
      this.flush();
      
      var insets = textArea.getInsets();
      var expectedHeight = -insets.top + 100 -insets.bottom;
      this.assertEquals(expectedHeight, textArea._getAreaHeight(), "Unexpected height of textarea element");
    },
    
    "test: _setAreaHeight<br/> sets height of textarea": function() {
      var textArea = this.__textArea;
      textArea._setAreaHeight(100);
      this.flush();
      
      var element = textArea.getContentElement().getDomElement();
      this.assertEquals("100px", element.style.height, "Unexpected height of textarea element");
    },

    "test: _setAreaHeight<br/> adjusts height of the textarea's container": function() {
      var textArea = this.__textArea;
      textArea._setAreaHeight(100);
      this.flush();
      
      var insets = textArea.getInsets();
      var expectedHeight = insets.top + 100 + insets.bottom;
      this.assertEquals(expectedHeight, textArea.getHeight(), "Unexpected height of textarea widget");
    },

    // "test: _getTotalHeight creates clone of textarea": function() {
    // },

    "test: _getTotalHeight<br/> returns scroll height of textarea when content triggers scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(10);
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();
      
      var cloneHeight = textArea._getScrolledAreaHeight();
      this.assert(cloneHeight > 10);
    },

    // "test: _getTotalHeight returns updated height when value changes": function() {
    //  
    // },
    
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
