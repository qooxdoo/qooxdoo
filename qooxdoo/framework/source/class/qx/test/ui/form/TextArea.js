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
    // Auto-Size
    //

    "test: textarea with autoSize<br/> grows when input would trigger scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(50);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      this.flush();
      var heightSmall = textArea.getHeight();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();
      var heightTall = textArea.getHeight();

      var msg =  "Widget height must increase (was: " + heightSmall +
                 " is: " + heightTall + ")";
      this.assert(heightTall > heightSmall, msg);
    },

    "test: textarea with autoSize<br/> shrinks when removal would hide scrollbar": function() {
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      textArea.setHeight(50);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      this.flush();
      var heightSmall = textArea.getHeight();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();
      var heightTall = textArea.getHeight();

      // Shrink
      textArea.setValue("Affe\nMaus\nElefant");
      var heightShrink = textArea.getHeight();
      this.flush();

      var msg =  "Widget height must decrease (was: " + heightTall +
                 " is: " + heightShrink + ")";
      this.assert(heightShrink < heightTall, msg);
    },

    "test: textarea with autoSize<br/> does not shrink below original height": function() {
      var textArea = this.__textArea;
      var originalHeight = 100;
      textArea.setAutoSize(true);
      textArea.setHeight(originalHeight);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Shrink
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
        height: 50,
        autoSizeMaxHeight: maxHeight,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Grow
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
        height: 50,
        autoSizeMaxHeight: maxHeight,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("auto", overflow);
    },

    "test: textarea with autoSize<br/> hides scroll-bar when finally below maxHeight": function() {
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        height: 50,
        autoSizeMaxHeight: 20,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Shrink
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
        height: 60
      });
      this.flush();

      // Grow
      textArea.setValue("AffeMausElefantGiraffeTigerAffeMausElefantGiraffeTigerAffeMausElefantGiraffeTigerAffeMausElefantGiraffeTiger");
      this.flush();
      var wrapHeight = textArea.getHeight();

      // Shrink
      textArea.setWrap(false);
      this.flush();
      var noWrapHeight = textArea.getHeight();

      var msg = "Must shrink when long line is unwrapped";
      this.assertNotEquals(wrapHeight, noWrapHeight, msg);
      this.assert(noWrapHeight < wrapHeight, msg);
    },

    "test: textarea with autoSize<br/> grows when long line is wrapped": function() {
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        height: 50,
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
