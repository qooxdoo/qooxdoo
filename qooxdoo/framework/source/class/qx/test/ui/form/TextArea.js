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
    // "Plain" textarea
    //

    "test: textarea<br/> set value": function() {
      var textArea = this.__textArea;
      textArea.setValue("Affe");
      this.flush();

      this.assertEquals("Affe", textArea.getValue());
    },

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

    "test: _getScrolledAreaHeight<br/> returns increased height when value gets longer": function() {
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

    "test: _getScrolledAreaHeight<br/> returns decreased height when value gets shorter": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(10);

      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      var heightFirstStep = textArea._getScrolledAreaHeight();
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      var heightSecondStep = textArea._getScrolledAreaHeight();
      this.flush();

      var msg =  "Scrolled area height must decrease";
      this.assertNotEquals(heightSecondStep, heightFirstStep, msg);
      this.assert(heightSecondStep < heightFirstStep, msg);
    },

    "test: _getScrolledAreaHeight<br/> creates clone of textarea": function() {
      var textArea = this.__textArea;
      textArea._getScrolledAreaHeight();
      this.flush();

      var textAreaCount = qx.bom.Collection.query("textarea").length;
      this.assertEquals(2, textAreaCount);
    },

    "test: destroy<br/> removes original and cloned textarea": function() {
      var textArea = this.__textArea;
      textArea._getScrolledAreaHeight();
      this.flush();
      textArea.destroy();
      this.flush();

      var textAreaCount = qx.bom.Collection.query("textarea").length;
      this.assertEquals(0, textAreaCount);
    },

    //
    // Auto-Size
    //

    "test: textarea with autoSize<br/> grows when input would trigger scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(20);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      var heightFirstStep = textArea.getHeight();
      this.flush();

      // Additional input
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      var heightSecondStep = textArea.getHeight();
      this.flush();

      var msg =  "Widget height must increase (was: " + heightFirstStep +
                 " is: " + heightSecondStep + ")";
      this.assert(heightSecondStep > heightFirstStep, msg);
    },

    "test: textarea with autoSize<br/> shrinks when removal would hide scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(20);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      var heightFirstStep = textArea.getHeight();
      this.flush();

      // Removal
      textArea.setValue("Affe\nMaus\nElefant");
      var heightSecondStep = textArea.getHeight();
      this.flush();

      var msg =  "Widget height must decrease (was: " + heightFirstStep +
                 " is: " + heightSecondStep + ")";
      this.assert(heightSecondStep < heightFirstStep, msg);
    },

    "test: textarea with autoSize<br/> does not shrink below original height": function() {
      var textArea = this.__textArea;
      var originalHeight = 100;
      textArea.setAutoSize(true);
      textArea.setHeight(originalHeight);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Removal
      textArea.setValue("Affe\nMaus\nElefant");
      var heightSecondStep = textArea.getHeight();
      this.flush();

      var msg =  "Widget height shrinks below original height (is: " + heightSecondStep +
                 " original: " + originalHeight + ")";
      this.assert(!(heightSecondStep < originalHeight), msg);
    },

    "test: textarea with autoSize<br/> does not grow above maxHeight": function() {
      var textArea = this.__textArea;
      var maxHeight = 20;
      textArea.set({
        autoSize: true,
        height: 20,
        autoSizeMaxHeight: maxHeight,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Additional input
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      var heightSecondStep = textArea.getHeight();
      this.flush();

      var msg =  "Widget height grows above maxHeight (is: " + heightSecondStep +
                 " maxHeight: " + maxHeight + ")";
      this.assert(!(heightSecondStep > maxHeight), msg);
    },

    "test: textarea with autoSize<br/> shows scroll-bar when above maxHeight": function() {
      var textArea = this.__textArea;
      var maxHeight = 20;
      textArea.set({
        autoSize: true,
        height: 20,
        autoSizeMaxHeight: maxHeight,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Additional input
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("auto", overflow);
    },

    "test: textarea with autoSize<br/> hides scroll-bar when finally below maxHeight": function() {
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        height: 20,
        autoSizeMaxHeight: 20,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Additional input
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Removal
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      textArea.setAutoSizeMaxHeight(300);
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("hidden", overflow);
    },

    "test: textarea with autoSize<br/> shrinks when long line is unwrapped": function() {
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        height: 20
      });
      this.flush();

      textArea.setValue("AffeMausElefantGiraffeTigerAffeMausElefantGiraffeTiger");
      var wrapHeight = textArea.getHeight();

      // Shrink
      textArea.setWrap(false);
      var noWrapHeight = textArea.getHeight();

      var msg = "Must shrink when long line is unwrapped";
      this.assertNotEquals(wrapHeight, noWrapHeight, msg);
      this.assert(wrapHeight > noWrapHeight, msg);
    },

    "test: textarea with autoSize<br/> grows when long line is wrapped": function() {
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        height: 20,
        wrap: false
      });
      this.flush();

      textArea.setValue("AffeMausElefantGiraffeTigerAffeMausElefantGiraffeTiger");
      this.flush();
      var noWrapHeight = textArea.getHeight();

      // Grow
      textArea.setWrap(true);
      var wrapHeight = textArea.getHeight();

      var msg = "Must grow when long line is unwrapped";
      this.assertNotEquals(wrapHeight, noWrapHeight, msg);
      this.assert(wrapHeight > noWrapHeight, msg);

      // TODO:
      // this.assertEquals(initialWrapHeight, wrapHeight)

    },

    // "test: textarea with autoSize<br/> does not grow when input fits": function() {
    //
    // },

    tearDown : function()
    {
      this.__textArea.destroy();
    }
  }
});
