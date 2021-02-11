/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.TextArea",
{
  extend : qx.test.ui.LayoutTestCase,

  include : qx.dev.unit.MRequirements,

  members :
  {
    __textArea: null,

    setUp : function()
    {
      var textArea = this.__textArea = new qx.ui.form.TextArea();
      this.getRoot().add(textArea);
    },

    hasNoBuggyIe : function()
    {
      return (qx.core.Environment.get("engine.name") != "mshtml" ||
        qx.core.Environment.get("browser.documentmode") > 10);
    },

    //
    // "Plain" textarea
    //

    "test: textarea set value": function() {
      var textArea = this.__textArea;
      textArea.setValue("Affe");
      this.flush();

      this.assertEquals("Affe", textArea.getValue());
    },

    "test: textarea set minimal line-height": function() {
      var textArea = this.__textArea;
      this.flush();
      var heightInitial = textArea.getSizeHint().height;

      textArea.setMinimalLineHeight(1);
      this.flush();
      var heightSmall = textArea.getSizeHint().height;

      var msg =  "Widget height must decrease (was: " + heightInitial +
                 " is: " + heightSmall + ")";
      this.assert(heightSmall < heightInitial, msg);
    },

    //
    // Auto-Size
    //

    "test: textarea with autoSize grows when input would trigger scrollbar": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      this.flush();
      var heightSmall = textArea.getSizeHint().height;

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();
      var heightTall = textArea.getSizeHint().height;

      var msg =  "Widget height must increase (was: " + heightSmall +
                 " is: " + heightTall + ")";
      this.assert(heightTall > heightSmall, msg);
    },

    "test: textarea with autoSize shrinks when removal would hide scrollbar": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      this.flush();

      textArea.setValue("Affe\nMaus\nElefant");
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();
      var heightTall = textArea.getSizeHint().height;

      // Shrink
      textArea.setValue("Affe\nMaus\nElefant");
      this.flush();
      var heightShrink = textArea.getSizeHint().height;

      var msg =  "Widget height must decrease (was: " + heightTall +
                 " is: " + heightShrink + ")";
      this.assert(heightShrink < heightTall, msg);
    },

    "test: textarea with autoSize does not shrink below original height": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      this.flush();

      var originalHeight = textArea.getBounds().height;

      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Shrink
      textArea.setValue("Affe\nMaus\nElefant");
      var heightShrink = textArea.getSizeHint().height;
      this.flush();

      var msg =  "Widget height must not shrink below original height (is: " + heightShrink +
                 " original: " + originalHeight + ")";
      this.assert(!(heightShrink < originalHeight), msg);
    },

    "test: textarea with autoSize shows scroll-bar when above maxHeight": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        maxHeight: 50,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("auto", overflow);
    },

    "test: textarea with autoSize shows scroll-bar when finally above maxHeight": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        value: "Affe\nMaus\nElefant"
      });
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Limit height
      textArea.setMaxHeight(50);
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("auto", overflow);
    },

    "test: textarea with autoSize hides scroll-bar when finally below maxHeight": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        maxHeight: 50
      });
      this.flush();

      // Grow
      textArea.setValue("Affe\nMaus\nElefant\nGiraffe\nTiger");
      this.flush();

      // Shrink
      textArea.setValue("Affe");
      this.flush();

      var overflow = textArea.getContentElement().getStyle("overflowY");
      this.assertEquals("hidden", overflow);
    },

    "test: textarea with autoSize respects initial value": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        value: this.__getLongValue()
      });

      var textAreaNoValue = new qx.ui.form.TextArea();
      textAreaNoValue.set({
        autoSize: true,
        value: ""
      });
      this.getRoot().add(textAreaNoValue, {left: 100});

      this.flush();
      var heightValue = textArea.getBounds().height;
      var heightNoValue = textAreaNoValue.getBounds().height;

      var msg = "Must be higher with long value than without value";
      this.assert(heightValue > heightNoValue, msg);

      textAreaNoValue.destroy();
    },

    "test: textarea with autoSize respects initial wrap": function() {
      this.require(["noBuggyIe"]);
      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        wrap: false,
        minimalLineHeight: 2,
        value: this.__getLongValue()
      });

      // No wrap
      this.flush();
      var heightInitial = textArea.getBounds().height;

      // Wrap
      textArea.setWrap(true);
      this.flush();

      // No wrap
      textArea.setWrap(false);
      this.flush();
      var heightFinal = textArea.getBounds().height;

      this.assertEquals(heightInitial, heightFinal);
    },

    "test: textarea with autoSize shrinks when long line is unwrapped": function() {
      this.require(["noBuggyIe"]);
      if (!this.__supportsLiveWrap()) {
        this.skip();
      }

      var textArea = this.__textArea;
      textArea.setAutoSize(true);
      this.flush();

      // Grow
      var longValue = this.__getLongValue();
      textArea.setValue(longValue);
      this.flush();
      var wrapHeight = textArea.getSizeHint().height;

      // Shrink
      textArea.setWrap(false);
      this.flush();
      var noWrapHeight = textArea.getSizeHint().height;

      var msg = "Must shrink when long line is unwrapped";
      this.assertNotEquals(wrapHeight, noWrapHeight, msg);
      this.assert(noWrapHeight < wrapHeight, msg);
    },

    "test: textarea with autoSize grows when long line is wrapped": function() {
      this.require(["noBuggyIe"]);
      if (!this.__supportsLiveWrap()) {
        this.skip();
      }

      var textArea = this.__textArea;
      textArea.set({
        autoSize: true,
        wrap: true
      });
      this.flush();

      // Does not work unfortunately
      //
      // var longValue = new qx.type.Array(50).map(function() {
      //   return "AffeMausElefantGiraffeTiger";
      // }).join("");

      var longValue = this.__getLongValue();

      // Wrap
      textArea.setValue(longValue);
      this.flush();
      var initialWrapHeight = textArea.getSizeHint().height;

      // Unwrap
      textArea.setWrap(false);
      this.flush();
      var noWrapHeight = textArea.getSizeHint().height;

      // Wrap
      textArea.setWrap(true);
      this.flush();
      var wrapHeight = textArea.getSizeHint().height;

      var msg = "Must grow when long line is unwrapped";
      this.assertNotEquals(wrapHeight, noWrapHeight, msg);
      this.assert(wrapHeight > noWrapHeight, msg);

      msg = "Must be same height when wrap is toggled";
      this.assertEquals(initialWrapHeight, wrapHeight, msg);
    },

    __getLongValue: function() {
      var val = new qx.type.Array(50);
      for(var i=0; i < val.length; i++) {
        val[i] = "AAAAA ";
      }
      return val.join("");
    },

    __supportsLiveWrap: function() {
      // Opera ignores changes to wrap settings
      // once the textarea is in the DOM
      return qx.core.Environment.get("engine.name") != "opera";
    },

    skip: function(msg) {
      throw new qx.dev.unit.RequirementError(null, msg);
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__textArea.destroy();
      qx.ui.core.queue.Dispose.flush();
    }
  }
});
