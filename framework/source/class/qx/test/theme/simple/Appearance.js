/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2016 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      var style = this.__obj["table-scroller/focus-indicator"].style();

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
        sortedAscending : true
      };

      var style = styleFunc(states);

      this.assertIdentical(13, style.minWidth);
      this.assertIdentical("bold", style.font);
      this.assertIdentical(3, style.paddingTop);
      this.assertIdentical(5, style.paddingLeft);

      this.assertIdentical("table-header-cell-first", style.decorator);
      this.assertUndefined(style.pointer);
      this.assertIdentical(qx.theme.simple.Image.URLS["table-ascending"], style.sortIcon);

      states.sortedAscending = false;
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
    },

    testTableHeaderCellIcon : function()
    {
      var style = this.__obj["table-header-cell/icon"].style();

      this.assertIdentical(5, style.paddingRight);
    },

    testTableHeaderCellSortIcon : function()
    {
      var style = this.__obj["table-header-cell/sort-icon"].style();

      this.assertIdentical("middle", style.alignY);
      this.assertIdentical("right", style.alignX);
      this.assertIdentical(5, style.paddingRight);
    },

    testTableEditorTextField : function()
    {
      var style = this.__obj["table-editor-textfield"].style();

      this.assertUndefined(style.decorator);
      this.assertArrayEquals([2, 2], style.padding);
    },

    testTableEditorSelectBox : function()
    {
      var style = this.__obj["table-editor-selectbox"].style();

      this.assertArrayEquals([0, 2], style.padding);
    },

    testTableEditorComboBox : function()
    {
      var style = this.__obj["table-editor-combobox"].style();

      this.assertUndefined(style.decorator);
    },

    testProgressiveTableHeader : function()
    {
      var style = this.__obj["progressive-table-header"].style();

      this.assertIdentical("progressive-table-header", style.decorator);
    },

    testProgressiveTableHeaderCell : function()
    {
      var style = this.__obj["progressive-table-header-cell"].style();

      this.assertIdentical("progressive-table-header-cell", style.decorator);
      this.assertArrayEquals([5, 6, 5, 6], style.padding);
    },

    testTreeVirtual : function()
    {
      var styleFunc = this.__obj["treevirtual"].style;

      var superStyles = {
        padding : [3, 4]
      };

      var style = styleFunc(null, superStyles);

      this.assertArrayEquals([5, 5], style.padding);
    },

    testTreeVirtualFolder : function()
    {
      var styleFunc = this.__obj["treevirtual-folder"].style;

      var states = {
        opened : true,
        drag : true
      };

      var style = styleFunc(states);

      this.assertIdentical("icon/16/places/folder-open.png", style.icon);
      this.assertIdentical(0.5, style.opacity);

      states.opened = false;
      states.drag = false;

      style = styleFunc(states);

      this.assertIdentical("icon/16/places/folder.png", style.icon);
      this.assertUndefined(style.opacity);
    },

    testTreeVirtualFile : function()
    {
      var styleFunc = this.__obj["treevirtual-file"].style;

      this.assertIdentical("icon/16/mimetypes/text-plain.png", styleFunc({drag: false}).icon);

      this.assertIdentical(0.5, styleFunc({drag: true}).opacity);
      this.assertUndefined(styleFunc({drag: false}).opacity);
    },

    testTreeVirtualLine : function()
    {
        var style = this.__obj["treevirtual-line"].style();

        this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-line"], style.icon);
    },

    testTreeVirtualContract : function()
    {
      var style = this.__obj["treevirtual-contract"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["tree-minus"], style.icon);
    },

    testTreeVirtualExpand : function()
    {
      var style = this.__obj["treevirtual-expand"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["tree-plus"], style.icon);
    },

    testTreeVirtualOnlyContract : function()
    {
      var style = this.__obj["treevirtual-only-contract"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-minus-only"], style.icon);
    },

    testTreeVirtualOnlyExpand : function()
    {
      var style = this.__obj["treevirtual-only-expand"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-plus-only"], style.icon);
    },

    testTreeVirtualStartContract : function()
    {
      var style = this.__obj["treevirtual-start-contract"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-minus-start"], style.icon);
    },

    testTreeVirtualStartExpand : function()
    {
      var style = this.__obj["treevirtual-start-expand"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-plus-start"], style.icon);
    },

    testTreeVirtualEndContract : function()
    {
      var style = this.__obj["treevirtual-end-contract"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-minus-end"], style.icon);
    },

    testTreeVirtualEndExpand : function()
    {
      var style = this.__obj["treevirtual-end-expand"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-plus-end"], style.icon);
    },

    testTreeVirtualCrossContract : function()
    {
      var style = this.__obj["treevirtual-cross-contract"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-minus-cross"], style.icon);
    },

    testTreeVirtualCrossExpand : function()
    {
      var style = this.__obj["treevirtual-cross-expand"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-plus-cross"], style.icon);
    },

    testTreeVirtualEnd : function()
    {
      var style = this.__obj["treevirtual-end"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-end"], style.icon);
    },

    testTreeVirtualCross : function()
    {
      var style = this.__obj["treevirtual-cross"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-cross"], style.icon);
    },

    testTreeVirtualCross : function()
    {
      var style = this.__obj["treevirtual-cross"].style();

      this.assertIdentical(qx.theme.simple.Image.URLS["treevirtual-cross"], style.icon);
    },

    testResizer : function()
    {
      var style = this.__obj["resizer"].style();

      this.assertIdentical("main-dark", style.decorator);
    },

    testSplitpaneSplitter : function()
    {
      var style = this.__obj["splitpane/splitter"].style();

      this.assertIdentical("light-background", style.backgroundColor);
    },

    testSplitpaneSplitterKnob : function()
    {
      var styleFunc = this.__obj["splitpane/splitter/knob"].style;

      var states = {
        horizontal : true
      };

      var style = styleFunc(states);

      this.assertIdentical(2, style.padding);
      this.assertIdentical(qx.theme.simple.Image.URLS["knob-horizontal"], style.source);

      style = styleFunc({horizontal: false});
      this.assertIdentical(qx.theme.simple.Image.URLS["knob-vertical"], style.source);
    },

    testSplitpaneSlider: function()
    {
      var style = this.__obj["splitpane/slider"].style();

      this.assertIdentical("border-light-shadow", style.backgroundColor);
      this.assertIdentical(0.3, style.opacity);
    },

    testMenu : function()
    {
      var styleFunc = this.__obj["menu"].style;

      var states = {
        submenu : true,
        contextmenu : true
      };

      var style = styleFunc(states);

      this.assertIdentical("background", style.backgroundColor);
      this.assertIdentical("main", style.decorator);
      this.assertIdentical(6, style.spacingX);
      this.assertIdentical(1, style.spacingY);
      this.assertIdentical(16, style.iconColumnWidth);
      this.assertIdentical(4, style.arrowColumnWidth);
      this.assertIdentical(1, style.padding);

      this.assertIdentical("best-fit", style.placementModeY);

      this.assertNotUndefined(style.position);
      this.assertIdentical("right-top", style.position);
      this.assertNotUndefined(style.offset);
      this.assertIdentical(4, style.offset);

      states.submenu = false;
      style = styleFunc(states);

      this.assertIdentical("best-fit", style.placementModeY);
      this.assertUndefined(style.position);
      this.assertIdentical(4, style.offset);

      states.contextmenu = false;
      style = styleFunc(states);

      this.assertIdentical("keep-align", style.placementModeY);
      this.assertUndefined(style.position);
      this.assertUndefined(style.offset);
    },

    testMenuSlideBarButton : function()
    {
      var styleFunc = this.__obj["menu-slidebar-button"].style;

      var style = styleFunc({hovered: true});

      this.assertIdentical(6, style.padding);
      this.assertIdentical(true, style.center);
      this.assertIdentical("background-selected", style.backgroundColor);

      style = styleFunc({hovered: false});

      this.assertUndefined(style.backgroundColor);
    },

    testMenuSlideBarButtonBackward : function()
    {
      var styleFunc = this.__obj["menu-slidebar/button-backward"].style;

      var style = styleFunc({hovered : true});

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-up-invert"], style.icon);

      style = styleFunc({hovered: false});

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-up"], style.icon);
    },

    testMenuSlideBarButtonForward : function()
    {
      var styleFunc = this.__obj["menu-slidebar/button-forward"].style;

      var style = styleFunc({hovered : true});

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-down-invert"], style.icon);

      style = styleFunc({hovered: false});

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-down"], style.icon);
    },

    testMenuSeparator : function()
    {
      var style = this.__obj["menu-separator"].style();

      this.assertIdentical(0, style.height);
      this.assertIdentical("menu-separator", style.decorator);
      this.assertIdentical(4, style.marginTop);
      this.assertIdentical(4, style.marginBottom);
      this.assertIdentical(2, style.marginLeft);
      this.assertIdentical(2, style.marginRight);
    },

    testMenuButton : function()
    {
      var styleFunc = this.__obj["menu-button"].style;

      this.assertIdentical("background-selected", styleFunc({selected: true}).backgroundColor);
      this.assertIdentical("text-selected", styleFunc({selected: true}).textColor);
      this.assertArrayEquals([2, 6], styleFunc({selected: true}).padding);

      this.assertUndefined(styleFunc({selected: false}).backgroundColor);
      this.assertUndefined(styleFunc({selected: false}).textColor);
    },

    testMenuButtonIcon : function()
    {
      var style = this.__obj["menu-button/icon"].style();

      this.assertIdentical("middle", style.alignY);
    },

    testMenuButtonLabel : function()
    {
      var style = this.__obj["menu-button/label"].style();

      this.assertIdentical("middle", style.alignY);
      this.assertIdentical(1, style.padding);
    },

    testMenuButtonShortcut : function()
    {
      var style = this.__obj["menu-button/shortcut"].style();

      this.assertIdentical("middle", style.alignY);
      this.assertIdentical(1, style.padding);
      this.assertIdentical(14, style.marginLeft);
    },

    testMenuButtonArrow : function()
    {
      var styleFunc = this.__obj["menu-button/arrow"].style;

      var states = {
        selected : true
      };

      var style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-right-invert"], style.source);
      this.assertIdentical("middle", style.alignY);

      states.selected = false;
      style = styleFunc(states);
      this.assertIdentical(qx.theme.simple.Image.URLS["arrow-right"], style.source);
    },

    testMenuCheckbox : function()
    {
      var styleFunc = this.__obj["menu-checkbox"].style;

      var states = {
        checked : true,
        selected : true
      };

      var style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["menu-checkbox-invert"], style.icon);

      states.selected = false;
      style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["menu-checkbox"], style.icon);

      states.checked = false;
      style = styleFunc(states);

      this.assertUndefined(style.icon);
    },

    testMenuRadioButton : function()
    {
      var styleFunc = this.__obj["menu-radiobutton"].style;

      var states = {
        checked : true,
        selected : true
      };

      var style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["menu-radiobutton-invert"], style.icon);

      states.selected = false;
      style = styleFunc(states);

      this.assertIdentical(qx.theme.simple.Image.URLS["menu-radiobutton"], style.icon);

      states.checked = false;
      style = styleFunc(states);

      this.assertUndefined(style.icon);
    },

    testMenuBar : function()
    {
      var style = this.__obj["menubar"].style();

      this.assertIdentical("light-background", style.backgroundColor);
      this.assertArrayEquals([4, 2], style.padding);
    },

    testMenuBarButton : function()
    {
      var styleFunc = this.__obj["menubar-button"].style;

      var states = {
        disabled : false,
        pressed : true,
        hovered : false
      };

      var style = styleFunc(states);

      this.assertIdentical("menubar-button-pressed", style.decorator);
      this.assertArrayEquals([1, 5, 2, 5], style.padding);
      this.assertIdentical("pointer", style.cursor);

      states.pressed = false;
      states.hovered = true;

      style = styleFunc(states);

      this.assertIdentical("menubar-button-hovered", style.decorator);
      this.assertArrayEquals([1, 5], style.padding);

      states.hovered = false;
      style = styleFunc(states);

      this.assertIdentical("link", style.textColor);
      this.assertUndefined(style.decorator);
      this.assertArrayEquals([2, 6], style.padding);

      states.disabled = true;
      style = styleFunc(states);

      this.assertUndefined(style.cursor);
    },

    testGroupItem : function()
    {
      var style = this.__obj["group-item"].style();

      this.assertIdentical(4, style.padding);
      this.assertIdentical("#BABABA", style.backgroundColor);
      this.assertIdentical("white", style.textColor);
      this.assertIdentical("bold", style.font);
    },

    testVirtualTree : function()
    {
      var style = this.__obj["virtual-tree"].style();

      this.assertIdentical(21, style.itemHeight);
    },

    testCell : function()
    {
      var styleFunc = this.__obj["cell"].style;

      var style = styleFunc({selected: true});

      this.assertIdentical("table-row-background-selected", style.backgroundColor);
      this.assertIdentical("text-selected", style.textColor);
      this.assertArrayEquals([3, 6], style.padding);

      style = styleFunc({selected: false});

      this.assertIdentical("table-row-background-even", style.backgroundColor);
      this.assertIdentical("text", style.textColor);
    },

    testCellNumber : function()
    {
      var style = this.__obj["cell-number"].style();

      this.assertIdentical("right", style.textAlign);
    }
  }
});
