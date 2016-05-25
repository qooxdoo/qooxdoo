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
  extend : qx.dev.unit.TestCase,

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
      this.assertIdentical("bold", style.font);
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

    testSlideBarButtonForward : function()
    {
      var style = this.__obj["slidebar/button-forward"].style;

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-down"], style({vertical: true}).icon);
      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-right"], style({vertical: false}).icon);

    },

    testSlideBarButtonBackward : function()
    {
      var style = this.__obj["slidebar/button-backward"].style;

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-up"], style({vertical: true}).icon);
      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-left"], style({vertical: false}).icon);
    },

    testTableStatusBar : function()
    {
      var style = this.__obj["table/statusbar"].style();

      this.assertIdentical("statusbar", style.decorator);
      this.assertArrayEquals([2, 5], style.padding);
    },

    testTableColumnButton : function()
    {
      var style = this.__obj["table/column-button"].style();

      this.assertIdentical("table-header-column-button", style.decorator);
      this.assertIdentical(3, style.padding);
      this.assertIdentical(qx.theme.simple.Image.URLS["select-column-order"], style.icon);
    },

    testTableColumnResetButton : function()
    {
      var style = this.__obj["table-column-reset-button"].style();

      this.assertIdentical("icon/16/actions/view-refresh.png", style.icon);
    },

    testTableScrollerHeader : function()
    {
      var style = this.__obj["table-scroller/header"].style();

      this.assertIdentical("table-header", style.decorator);
    },

    testTableScrollerFocusIndicator : function()
    {
      var style = this.__obj["table-scroller/header"].style();

      this.assertIdentical("main", style.decorator);
    },

    testTableScrollerResizeLine : function()
    {
      var style = this.__obj["table-scroller/resize-line"].style();

      this.assertIdentical("button-border", style.backgroundColor);
      this.assertIdentical(3, style.width);
    },

    testTableHeaderCell : function()
    {
      var styleFunc = this.__obj["table-header-cell"].style;

      var states = {
        first : true,
        disabled : true,
        sorted : true,
        sortedAccending : true
      };

      var style = styleFunc(states);

      this.assertIdentical(13, style.minWidth);
      this.assertIdentical("bold", style.font);
      this.assertIdentical(3, style.paddingTop);
      this.assertIdentical(5, style.paddingLeft);

      this.assertIdentical("table-header-cell-first", style.decorator);
      this.assertUndefined(style.pointer);
      this.assertIdentical(qx.theme.simple.Image.URLS["table-ascending"], style.sortIcon);

      states.sortedAccending = false;
      style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["table-descending"], style.sortIcon);

      states.sorted = false;
      style = styleFunc(states);

      this.assertUndefined(style.sortIcon);

      states.disabled = false;
      style = styleFunc(states);

      this.assertIdentical("pointer", style.cursor);

      states.first = false,
      style = styleFunc(states);

      this.assertIdentical("table-header-cell", style.decorator);
    }
  }
});
