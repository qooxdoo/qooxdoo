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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/* ************************************************************************

#asset(qx/decoration/Simple/*)

************************************************************************* */
/**
 * Mapping class for all images used in the simple theme.
 */
qx.Class.define("qx.theme.simple.Image", 
{
  extend : qx.core.Object,

  statics :
  {
    /**
     * Contains a map holding all images as base64 sings.
     * @internal
     */
    BASE64 : 
    {
      "blank" : "data:image/gif;base64,R0lGODlhAQABAJH/AP///wAAAMDAwAAAACH5BAEAAAIALAAAAAABAAEAAAICVAEAOw==",
      
      "checkbox-checked" : "data:image/png;base64,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",
      "checkbox-undetermined" : "data:image/png;base64,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",
      
      "arrow-down" : "data:image/png;base64,R0lGODlhBwAEAIABAAAAAP///yH5BAEAAAEALAAAAAAHAAQAAAIIhA+BGWoNWSgAOw==",
      
      "window-minimize" : "data:image/png;base64,R0lGODlhCQAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAJAAkAAAILjI+py+0NojxyhgIAOw==",
      "window-maximize" : "data:image/png;base64,R0lGODlhCQAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAJAAkAAAIPhI+JwR3mGowP0HpnVKgAADs=",
      "window-restore" : "data:image/png;base64,R0lGODlhCAAJAPABAAAAAAAAACH5BAUAAAEALAAAAAAIAAkAQAIQTICpaAvXTHuSTqeO1ayaAgA7",
      "window-close" : "data:image/png;base64,R0lGODlhCgAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAKAAkAAAIRjI8BgHuuWFsyQUuxuTemXwAAOw==",
      
      // TODO
      "cursor-copy" : "decoration/cursors/copy.gif",
      "cursor-move" : "decoration/cursors/move.gif",
      "cursor-alias" : "decoration/cursors/alias.gif",
      "cursor-nodrop" : "decoration/cursors/nodrop.gif",
      
      "arrow-right" : "decoration/arrows/right.gif",
      "arrow-left" : "decoration/arrows/left.gif",
      "arrow-up" : "decoration/arrows/up.gif",
      "arrow-forward" : "decoration/arrows/forward.gif",
      "arrow-rewind" : "decoration/arrows/rewind.gif",
      "arrow-down-small" : "decoration/arrows/down-small.gif",
      "arrow-up-small" : "decoration/arrows/up-small.gif",      
      
      "knob-horizontal" : "decoration/splitpane/knob-horizontal.png",
      "knob-vertical" : "decoration/splitpane/knob-vertical.png",
      
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
      
      "arrow-up-invert" : "decoration/arrows/up-invert.gif",
      "arrow-down-invert" : "decoration/arrows/down-invert.gif",
      "arrow-right-invert" : "decoration/arrows/right-invert.gif",
      
      "menu-checkbox" : "decoration/menu/checkbox.gif",
      "menu-checkbox-invert" : "decoration/menu/checkbox-invert.gif",
      "menu-radiobutton-invert" : "decoration/menu/radiobutton-invert.gif",
      "menu-radiobutton" : "decoration/menu/radiobutton.gif",
      
      // tabview
      "tabview-close" : "decoration/tabview/close.gif"      
    },


    /**
     * Holds a map containig all the URL to the images.
     * @internal
     */
    URLS : 
    {
      "blank" : "qx/static/blank.gif",
      
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
    },
    
    /**
     * Holds a map containings all the source of used images in the simple
     * theme. The value of the map will be assigned on startup depending
     * on the capabilities of the browser to use data urls for images.
     */
    ICONS : null
  },
  
  
  defer : function(statics) {
    // TODO check for this feature (async check)
    // var base64support = qx.bom.client.Feature.DATA_URL;
    // statics.ICONS = base64support ? statics.BASE64 : statics.URLS;
    statics.ICONS = statics.URLS;
  }
});
