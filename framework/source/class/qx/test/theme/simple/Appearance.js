/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2016 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * William Opandi (woprandi)

************************************************************************ */
qx.Class.define("qx.test.theme.simple.Appearance",
{
  extend : qx.test.unit.TestCase,

  members :
  {
    __obj : qx.theme.simple.Appearance.appearances,

    testLabel : function()
    {
      var obj = this.__obj.label;

      this.assertIdentical("text-disabled", obj.style({disabled: true}).textColor);
      this.assertUndefined(obj.style({disabled: false}).textColor);
    },

    testImage : function()
    {
      var obj = this.__obj.image;

      var states = {
        replacement : false,
        disabled : true
      };

      this.assertIdentical(0.3, obj.style(states).opacity);

      states.replacement = true;

      this.assertUndefined(obj.style(states).opacity);
    },

    testRoot : function()
    {
      var obj = this.__obj.root;

      var style = obj.style();

      this.assertIdentical("background", style.backgroundColor);
      this.assertIdentical("text", style.textColor);
      this.assertIdentical("default", style.font);
    },

    testPopup : function()
    {
      var obj = this.__obj.popup;

      var style = obj.style();

      this.assertIdentical("popup", style.decorator);
      this.assertIdentical("background-pane", style.backgroundColor);
    },

    testTooltip : function()
    {
      var obj = this.__obj.tooltip;

      var style = obj.style();

      this.assertIdentical("tooltip", style.backgroundColor);
      this.assertIdentical("tooltip-text", style.textColor);
      this.assertIdentical("tooltip", style.decorator);
      this.assertArrayEquals([1, 3, 2, 3], style.padding);
      this.assertArrayEquals([10, 5, 5, 5], style.offset);
    },

    testTooltipError : function()
    {
      var obj = this.__obj["tooltip-error"];

      var style = obj.style();

      this.assertIdentical("text-selected", style.textColor);
      this.assertIdentical(100, style.showTimeout);
      this.assertIdentical(10000, style.hideTimeout);
      this.assertIdentical("tooltip-error", style.decorator);
      this.assertIdentical("bold", font);
      this.assertUndefined(style.backgroundColor);
    },

    testIframe : function()
    {
      var obj = this.__obj.iframe;

      var style = obj.style();

      this.assertIdentical("white", style.backgroundColor);
      this.assertIdentical("main-dark", style.decorator);
    },

    testMoveFrame : function()
    {
      var obj = this.__obj["move-frame"];

      var style = obj.style();

      this.assertIdentical("main-dark", style.decorator);
    },

    testDragDropCursor : function()
    {
      var obj = this.__obj["dragdrop-cursor"];

      var states = {
        copy : true,
        move :true,
        alias : true
      };

      var style = obj.style(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["cursor-copy"], style.source);

      states.copy = false;
      style = obj.style(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["cursor-move"], style.source);

      states.move = false;
      style = obj.style(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["cursor-alias"], style.source);

      states.alias = false;
      style = obj.style(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["cursor-nodrop"], style.source);

      this.assertIdentical("right-top", style.position);
      this.assertArrayEquals([2, 16, 2, 6], style.offset);
    },

    testSlideBarButtonBackward : function()
    {
      var style = this.__obj["slidebar/button-backward"];

      this.assertIdentical(qx.test.simple.Image.URLS["arrow-up"], style({vertical: true}).icon);
      this.assertIdentical(qx.test.simple.Image.URLS["arrow-left"], style({vertical: false}).icon);
    }
  }
});
