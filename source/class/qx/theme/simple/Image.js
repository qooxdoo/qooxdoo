/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************


************************************************************************* */
/**
 * Mapping class for all images used in the simple theme.
 *
 * @asset(qx/decoration/Simple/*)
 * @asset(qx/static/blank.png)
 */
qx.Class.define("qx.theme.simple.Image",
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * Holds a map containing all the URL to the images.
     * @internal
     */
    URLS :
    {
      "blank" : "qx/static/blank.png",

      // checkbox
      "checkbox-checked" : "decoration/checkbox/checked.png",
      "checkbox-undetermined" : "decoration/checkbox/undetermined.png",

      // window
      "window-minimize" : "decoration/window/minimize.gif",
      "window-maximize" : "decoration/window/maximize.gif",
      "window-restore" : "decoration/window/restore.gif",
      "window-close" : "decoration/window/close.gif",

      // cursor
      "cursor-copy" : "decoration/cursors/copy.gif",
      "cursor-move" : "decoration/cursors/move.gif",
      "cursor-alias" : "decoration/cursors/alias.gif",
      "cursor-nodrop" : "decoration/cursors/nodrop.gif",

      // arrows
      "arrow-right" : "decoration/arrows/right.gif",
      "arrow-left" : "decoration/arrows/left.gif",
      "arrow-up" : "decoration/arrows/up.gif",
      "arrow-down" : "decoration/arrows/down.gif",
      "arrow-forward" : "decoration/arrows/forward.gif",
      "arrow-rewind" : "decoration/arrows/rewind.gif",
      "arrow-down-small" : "decoration/arrows/down-small.gif",
      "arrow-up-small" : "decoration/arrows/up-small.gif",
      "arrow-up-invert" : "decoration/arrows/up-invert.gif",
      "arrow-down-invert" : "decoration/arrows/down-invert.gif",
      "arrow-right-invert" : "decoration/arrows/right-invert.gif",

      // split pane
      "knob-horizontal" : "decoration/splitpane/knob-horizontal.png",
      "knob-vertical" : "decoration/splitpane/knob-vertical.png",

      // tree
      "tree-minus" : "decoration/tree/minus.gif",
      "tree-plus" : "decoration/tree/plus.gif",

      // table
      "select-column-order" : "decoration/table/select-column-order.png",
      "table-ascending" : "decoration/table/ascending.png",
      "table-descending" : "decoration/table/descending.png",

      // tree virtual
      "treevirtual-line" : "decoration/treevirtual/line.gif",
      "treevirtual-minus-only" : "decoration/treevirtual/only_minus.gif",
      "treevirtual-plus-only" : "decoration/treevirtual/only_plus.gif",
      "treevirtual-minus-start" : "decoration/treevirtual/start_minus.gif",
      "treevirtual-plus-start" : "decoration/treevirtual/start_plus.gif",
      "treevirtual-minus-end" : "decoration/treevirtual/end_minus.gif",
      "treevirtual-plus-end" : "decoration/treevirtual/end_plus.gif",
      "treevirtual-minus-cross" : "decoration/treevirtual/cross_minus.gif",
      "treevirtual-plus-cross" : "decoration/treevirtual/cross_plus.gif",
      "treevirtual-end" : "decoration/treevirtual/end.gif",
      "treevirtual-cross" : "decoration/treevirtual/cross.gif",

      // menu
      "menu-checkbox" : "decoration/menu/checkbox.gif",
      "menu-checkbox-invert" : "decoration/menu/checkbox-invert.gif",
      "menu-radiobutton-invert" : "decoration/menu/radiobutton-invert.gif",
      "menu-radiobutton" : "decoration/menu/radiobutton.gif",

      // tabview
      "tabview-close" : "decoration/tabview/close.gif"
    }
  }
});
