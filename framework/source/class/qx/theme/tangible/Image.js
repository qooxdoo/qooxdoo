/* ************************************************************************

  Tangible Theme for Qooxdoo

  Copyright:
     2018 IT'IS Foundation
     2020 Tobi Oetiker

  License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Tobias Oetiker (oetiker)

  Origin:
    This theme is based in large parts on the osparc.theme
************************************************************************ */

/* ************************************************************************


************************************************************************* */
/**
 * Mapping class for all images used in the tangible theme.
 *
 * @asset(qx/iconfont/MaterialIcons/materialicons-v50.ttf)
 * @asset(qx/iconfont/MaterialIcons/materialicons-v50.woff2)
 * @asset(qx/iconfont/MaterialIcons/materialicons-v50.woff)
 * @asset(qx/iconfont/MaterialIcons/materialicons-v50.eot)
 * @asset(qx/static/blank.png)
 */

qx.Class.define("qx.theme.tangible.Image",
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
      "checkbox-checked" : "@MaterialIcons/check_box/15",
      "checkbox-blank" : "@MaterialIcons/check_box_outline_blank/15",
      "checkbox-undetermined" : "@MaterialIcons/indeterminate_check_box/15",
      "radiobutton-checked" : "@MaterialIcons/radio_button_on/15",
      "radiobutton-unchecked" : "@MaterialIcons/radio_button_off/15",

      // window
      "window-minimize" : "@MaterialIcons/keyboard_arrow_down",
      "window-maximize" : "@MaterialIcons/fullscreen",
      "window-restore" : "@MaterialIcons/fullscreen_exit",
      "window-close" : "@MaterialIcons/close",

      // cursor
      "cursor-copy" : "decoration/cursors/copy.gif",
      "cursor-move" : "decoration/cursors/move.gif",
      "cursor-alias" : "decoration/cursors/alias.gif",
      "cursor-nodrop" : "decoration/cursors/nodrop.gif",


      // arrows
      "arrow-right" : "@MaterialIcons/keyboard_arrow_right/18",
      "arrow-left" : "@MaterialIcons/keyboard_arrow_left/18",
      "arrow-up" : "@MaterialIcons/keyboard_arrow_up/18",
      "arrow-down" : "@MaterialIcons/keyboard_arrow_down/18",
      "arrow-forward" : "@MaterialIcons/fast_forward/18",
      "arrow-rewind" : "@MaterialIcons/fast_rewind/18",
      "arrow-down-small" : "@MaterialIcons/keyboard_arrow_down/13",
      "arrow-up-small" : "@MaterialIcons/keyboard_arrow_up/13",
      "arrow-up-invert" : "@MaterialIcons/keyboard_arrow_up/18",
      "arrow-down-invert" : "@MaterialIcons/keyboard_arrow_down/18",
      "arrow-right-invert" : "@MaterialIcons/keyboard_arrow_right/18",

      // split pane
      "knob-horizontal" : "@MaterialIcons/drag_indicator/12",
      "knob-vertical" : "@MaterialIcons/drag_handle/12",

      // tree (someone is using this without fonticon support)
      "tree-minus" : "@MaterialIcons/arrow_drop_down/16",
      "tree-plus" : "@MaterialIcons/arrow_right/16",

      // table
      "select-column-order" : "@MaterialIcons/reorder/15",
      "table-ascending" : "@MaterialIcons/keyboard_arrow_up/14",
      "table-descending" : "@MaterialIcons/keyboard_arrow_down/14",

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
      "folder-open": "@MaterialIcons/folder_open/15",
      "folder": "@MaterialIcons/folder/15",
      "file": "@MaterialIcons/insert_drive_file/15",

      // menu
      "menu-checkbox" : "@MaterialIcons/check_box_outline_blank/15",
      "menu-checkbox-checked" : "@MaterialIcons/check_box/15",
      "menu-radiobutton-checked" : "@MaterialIcons/radio_button_checked/15",
      "menu-radiobutton" : "@MaterialIcons/radio_button_unchecked/15",

      // tabview
      "tabview-close" : "decoration/tabview/close.gif"
    }
  }
  });
