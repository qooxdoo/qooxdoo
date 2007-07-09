/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Alexander Back (aback)
   * Fabian Jakobs (fjakobs)

************************************************************************* */

/* ************************************************************************

#ignore(auto-use)
#embed(qx.static/image/dotted_white.gif)
#embed(qx.static/image/blank.gif)

# Window
#embed(qx.widgettheme/window/*)

# ComboBox, ComboBoxEx
#embed(qx.widgettheme/arrows/down.gif)

# Spinner
#embed(qx.widgettheme/arrows/up_small.gif)
#embed(qx.widgettheme/arrows/down_small.gif)

# ListView (HeaderCell)
#embed(qx.widgettheme/arrows/up.gif)
#embed(qx.widgettheme/arrows/down.gif)

# Menu
#embed(qx.widgettheme/menu/radiobutton.gif)
#embed(qx.widgettheme/menu/checkbox.gif)
#embed(qx.widgettheme/arrows/next.gif)

#embed(qx.widgettheme/gradient/*)

************************************************************************* */

/**
 * Ext-Clone appearance theme.
 */
qx.Theme.define("qx.theme.ext.Appearance",
{
  title : "Ext",

  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "empty" : {
    },

    "widget" : {
    },

    "image" : {
    },

    "atom" : {
    },

    "popup" : {
    },


    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

    // TODO [rh] copyied cursor-*" entries from qx source to eliminate
    //      warnings. No idea what they are useful for as they aren't referenced
    "cursor-dnd-move" :
    {
      style : function(states)
      {
        return {
          source : "widget/cursors/move.gif"
        };
      }
    },

    "cursor-dnd-copy" :
    {
      style : function(states)
      {
        return {
          source : "widget/cursors/copy.gif"
        };
      }
    },

    "cursor-dnd-alias" :
    {
      style : function(states)
      {
        return {
          source : "widget/cursors/alias.gif"
        };
      }
    },

    "cursor-dnd-nodrop" :
    {
      style : function(states)
      {
        return {
          source : "widget/cursors/nodrop.gif"
        };
      }
    },

    "label" : {
      style : function(states) {
        return {
          textColor : states.disabled ? "text-disabled" : "undefined"
        }
      }
    },

    "client-document" : {
      style : function(states) {
        return {
          backgroundColor    : "document-background",
          textColor          : "text",
          font               : "default"
        }
      }
    },

    "client-document-blocker" :
    {
      style : function(states)
      {
        // You could also use: "static/image/dotted_white.gif" for example as backgroundImage here
        // (Visible) background tiles could be dramatically slow down mshtml!
        // A background image or color is always needed for mshtml to block the events successfully.
        return {
          cursor : "default",
          backgroundImage : "static/image/blank.gif"
        };
      }
    },

    "tool-tip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "tooltip",
          textColor       : "tooltip-text",
          border          : "tooltip",
          padding         : [ 1, 3, 2, 3 ]
        };
      }
    },

    "iframe" :
    {
      style : function(states)
      {
        return {
          border : "general"
        };
      }
    },

    "check-box" :
    {
      style : function(states)
      {
        return {
          padding : [ 2, 3 ]
        };
      }
    },

    "radio-button" : {
      include : "check-box"
    },

    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      style : function(states)
      {
        if (states.over) {
          var border = "inset-button";
        } else {
          var border = "outset-thin-button";
        }

        if (states.over) {
          var padding = [ 2, 3, 2, 3 ];
        }
        else if (states.pressed)
        {
          var padding = [ 3, 2, 1, 4 ];
        }
        else {
          var padding = [ 3, 4, 3, 4 ];
        }

        return {
          backgroundImage : "widget/gradient/button_gradient.png",

          backgroundColor : states.over ? "button-hover" : "button",
          border          : border,
          padding         : padding
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        return {
          border          : "toolbar",
          backgroundColor : "toolbar-background",
          backgroundImage : "widget/gradient/toolbar_gradient.png"
        }
      }
    },

    "toolbar-part" : {
    },

    "toolbar-part-handle" :
    {
      style : function(states)
      {
        return {
          width : 10
        };
      }
    },

    "toolbar-part-handle-line" :
    {
      style : function(states)
      {
        return {
          top    : 2,
          left   : 3,
          bottom : 2,
          width  : 4,
          border : "general"
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          width : 8
        };
      }
    },

    "toolbar-separator-line" :
    {
      style : function(states)
      {
        var border = new qx.ui.core.Border.fromConfig({
           left : [ 1, "solid", "general-border"]
        });

        return {
          top    : 2,
          left   : 3,
          width  : 2,
          bottom : 2,
          border : border
        };
      }
    },

    "toolbar-button" :
    {
      style : function(states)
      {
        if (states.pressed || states.checked || states.abandoned || states.over)
        {
          var border  = "general";
        }
        else
        {
          var border  = "undefined";
        }

        if (states.pressed || states.checked || states.abandoned)
        {
          var padding = [ 3, 2, 1, 4 ];
        }
        else if (states.over)
        {
          var padding = [ 2, 3, 2, 3 ];
        }
        else
        {
          var padding = [ 3, 4, 3, 4 ];
        }

        return {
          border          : border,
          padding         : padding,
          backgroundColor : states.checked || states.pressed || states.over ? "effect" : "transparent"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON VIEW
    ---------------------------------------------------------------------------
    */

    "button-view" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          border          : "general"
        };
      }
    },

    "button-view-pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "button-view-pane",
          padding         : 10
        };
      }
    },

    "button-view-page" : {
    },

    "button-view-bar" :
    {
      style : function(states)
      {
        var padding = "undefined";
        var border  = "undefined";
        var clazz   = qx.ui.core.Border;

        if (states.barTop)
        {
          padding = [ 1, 0 ];
          border  = clazz.fromConfig({ bottom : [ 1, "solid", "general-border" ] });
        }
        else if (states.barBottom)
        {
          padding = [ 1, 0 ];
          border  = clazz.fromConfig({ top : [ 1, "solid", "general-border" ] });
        }
        else if (states.barLeft)
        {
          padding = [ 0, 1 ];
          border  = clazz.fromConfig({ right : [ 1, "solid", "general-border" ] });
        }
        else if (states.barRight)
        {
          padding = [ 0, 1 ];
          border  = clazz.fromConfig({ left : [ 1, "solid", "general-border" ] });
        }

        return {
          backgroundColor : "button-view-bar",
          padding         : padding || "undefined",
          border          : border || "undefined"
        };
      }
    },

    "button-view-button" :
    {
      style : function(states)
      {
        var margin, width, height, padding, border;
        var clazz = qx.ui.core.Border;

        if (states.checked || states.over)
        {
          border  = "button-view-button";
          padding = [ 3, 6, 3, 6 ];
        }
        else
        {
          border  = "undefined";
          padding = [ 4, 7 ];
        }

        if (states.barTop || states.barBottom)
        {
          margin = [ 0, 1 ];
          width  = "auto";
          height = null;
        }
        else
        {
          margin = [ 1, 0 ];
          height = "auto";
          width  = null;
        }

        return {
          backgroundColor : states.checked ? "button-view-button" : "undefined",
          backgroundImage : states.checked ? "widget/gradient/barbutton_gradient.png" : null,
          iconPosition    : "top",
          margin          : margin,
          width           : width ,
          height          : height,
          border          : border,
          padding         : padding || "undefined"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tab-view" :
    {
      style : function(states)
      {
        return {
          spacing : -1
        };
      }
    },

    "tab-view-bar" : {
    },

    "tab-view-pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "tab-view-pane",
          border          : "tab-view-pane",
          padding         : 10
        };
      }
    },

    "tab-view-page" : {
       textColor  : "tab-view-text",
       top        : 0,
       right      : 0,
       bottom     : 0,
       left       : 0
    },

    "tab-view-button" :
    {
      style : function(states)
      {
        var paddingTop, paddingBottom, paddingLeft, paddingRight;
        var marginTop, marginBottom, marginRight, marginLeft;
        var backgroundColor, zIndex, border;

        marginTop    = 0;
        marginBottom = 0;

        if (states.barTop) {
          var border_top_default = qx.ui.core.Border.fromConfig({
             left  : [ 1, "solid", "tab-view-border"],
             top   : [ 1, "solid", "tab-view-border"],
             right : [ 1, "solid", "tab-view-border"]
          });
        };

        if (!states.barTop) {
          var border_bottom_default  = qx.ui.core.Border.fromConfig({
             right  : [ 1, "solid", "tab-view-border"],
             bottom : [ 1, "solid", "tab-view-border"],
             left   : [ 1, "solid", "tab-view-border"]
          });
        };


        if (states.checked) {
          vReturn = {
            textColor       : "tab-view-text",
            backgroundImage : states.barTop ? "widget/gradient/tabbutton_gradient.png" : "widget/gradient/tabbutton_reverse_gradient.png",
            backgroundColor : "tab-view-button-checked",
            zIndex          : 1,
            paddingTop      : 3,
            paddingBottom   : 3,
            paddingLeft     : 6,
            paddingRight    : 7,
            marginTop       : states.barTop ? 3 : 0,
            marginBottom    : 0,
            marginRight     : 4,
            marginLeft      : (states.alignLeft && states.firstChild) ? 4 : 0
          }
        }
        else {
          vReturn = {
            textColor       : "tab-view-text-disabled",
            backgroundImage : states.barTop ? "widget/gradient/tabbutton_gradient.png" : "widget/gradient/tabbutton_reverse_gradient.png",
            backgroundColor : "tab-view-button",
            zIndex          : 0,
            paddingLeft     : 6,
            paddingRight    : 7,
            marginRight     : 4,
            marginLeft      : (states.alignLeft && states.firstChild) ? 4 : 0
          }

          if (states.barTop) {
            vReturn.marginTop     = 3;
            vReturn.marginBottom  = 1;
            vReturn.paddingTop    = 2;
            vReturn.paddingBottom = 3;
          }
          else {
            vReturn.marginTop     = 1;
            vReturn.marginBottom  = 3;
            vReturn.paddingTop    = 3;
            vReturn.paddingBottom = 2;
          }
        };
        vReturn.border            = states.barTop ? border_top_default : border_bottom_default;

        return vReturn;
      }
    },


    /*
    ---------------------------------------------------------------------------
      RADIO VIEW
    ---------------------------------------------------------------------------
    */

    "radio-view-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "radio-view-bar",
          padding         : 4,
          border          : states.barTop ?
            qx.ui.core.Border.fromConfig({ bottom : [ 1, "solid", "radio-view-border" ] }) :
            qx.ui.core.Border.fromConfig({ top : [ 1, "solid", "radio-view-border" ] })
        };
      }
    },

    "radio-view-button" :
    {
      style : function(states)
      {
        var border, padding;

        if (states.checked || states.over)
        {
          border = new qx.ui.core.Border(1, "solid", "radio-view-border");
          border.setWidthLeft(3);
          padding = [ 2, 6, 2, 4 ];
        }
        else
        {
          border = "undefined";
          padding = [ 3, 7 ];
        }

        return {
          textColor       : "tab-view-text",
          backgroundColor : states.checked ? "radio-view-button-checked" : "undefined",
          backgroundImage : states.checked ? "widget/gradient/tabbutton_gradient.png" : "undefined",
          iconPosition    : "left",
          margin          : [ 0, 1 ],
          width           : "auto",
          opacity         : states.checked ? 1.0 : 0.3,
          border          : border,
          padding         : padding
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          padding         : 0,
          border          : states.maximized ? "undefined" : "general"
        };
      }
    },

    "window-captionbar" :
    {
      style : function(states)
      {
        return {
          padding               : [ 4, 2, 5, 2 ],
          verticalChildrenAlign : "middle",
          height                : 24,

          backgroundColor       : states.active ? "window-active-caption" : "window-inactive-caption",
          textColor             : states.active ? "window-active-caption-text" : "window-inactive-caption-text"
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states)
      {
        return {
          border : "general"
        };
      }
    },

    "window-captionbar-icon" :
    {
      style : function(states)
      {
        return {
          marginRight : 2
        };
      }
    },

    "window-captionbar-title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "bold",
          marginRight : 2
        };
      }
    },

    "window-captionbar-button" :
    {
      include : "button",

      style : function(states)
      {
        return {
          padding         : [ 0, 1 ],
          border          : "undefined",
          backgroundColor : "transparent",
          backgroundImage : null
        };
      }
    },

    "window-captionbar-minimize-button" : {
      include : "window-captionbar-button",

      style : function(states) {
        return { icon : states.active ? "widget/window/minimize.gif" : "widget/window/minimize_inactive.gif" }
      }
    },

    "window-captionbar-restore-button" : {
      include : "window-captionbar-button",

      style : function(states) {
        return {
          marginLeft : 2,
          icon : states.active ? "widget/window/restore.gif" : "widget/window/restore_inactive.gif"
        }
      }
    },

    "window-captionbar-maximize-button" : {
      include : "window-captionbar-button",

      style : function(states) {
        return {
          marginLeft : 2,
          icon : states.active ? "widget/window/maximize.gif" : "widget/window/maximize_inactive.gif"
        }
      }
    },

    "window-captionbar-close-button" : {
      include : "window-captionbar-button",

      style : function(states) {
        return {
          marginLeft : 2,
          icon       : states.active ? "widget/window/close.gif" : "widget/window/close_inactive.gif"
        }
      }
    },

    "window-statusbar" :
    {
      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           top : [ 1, "solid", "general-border" ]
        });

        return {
          border : border
        };
      }
    },

    "window-statusbar-text" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 4 ]
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */

    "color-popup" :
    {
      style : function(states)
      {
        return {
          padding         : 4,
          border          : "general",
          backgroundColor : "document-background"
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states)
      {
        return {
          border : "outset-thin"
        };
      }
    },

    "resizer-frame" :
    {
      style : function(states)
      {
        return {
          border : "general"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "menu",
          border          : "general",
          padding         : 1
        };
      }
    },

    "menu-layout" : {
       top    : 0,
       right  : 0,
       bottom : 0,
       left   : 0
    },

    "menu-button" :
    {
      style : function(states)
      {
        return {
          minWidth              : "auto",
          height                : "auto",
          spacing               : 2,
          padding               : [ 2, 4 ],
          verticalChildrenAlign : "middle",
          backgroundColor       : states.over ? "selected" : "undefined",
          textColor             : states.over ? "text-selected" : "undefined"
        };
      }
    },

    "menu-button-arrow" :
    {
      style : function(states)
      {
        return {
          source : "widget/arrows/next.gif"
        };
      }
    },

    "menu-check-box" :
    {
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : states.checked ? "widget/menu/checkbox.gif" : "static/image/blank.gif"
        };
      }
    },

    "menu-radio-button" :
    {
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : states.checked ? "widget/menu/radiobutton.gif" : "static/image/blank.gif"
        };
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          marginTop    : 3,
          marginBottom : 2,
          paddingLeft  : 3,
          paddingRight : 3
        };
      }
    },

    "menu-separator-line" :
    {
      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           top : [ 1, "solid", "general-border" ]
        });

        return {
          right  : 0,
          left   : 0,
          height : "auto",
          border : border
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      style : function(states)
      {
        return {
          border          : "general",
          backgroundColor : "list"
        };
      }
    },

    "list-item" :
    {
      style : function(states)
      {
        return {
          height                  : "auto",
          minWidth                : "auto",
          horizontalChildrenAlign : "left",
          verticalChildrenAlign   : "middle",
          spacing                 : 4,
          padding                 : [ 3, 5 ],
          backgroundColor         : states.selected ? "selected" : "undefined",
          textColor               : states.selected ? "text-selected" : "undefined"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

    "text-field" :
    {
      style : function(states)
      {
        return {
          border          : "general",
          padding         : [ 1, 3 ],
          textColor       : states.disabled ? "text-disabled" : "text",
          backgroundColor : states.focused ? "field" : "white"
        };
      }
    },

    "text-area" : {
      include : "text-field"
    },

    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combo-box" :
    {
      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           top    : [ 1, "solid", "general-border"],
           left   : [ 1, "solid", "general-border"],
           bottom : [ 1, "solid", "general-border"]
        });

        return {
          border          : border,
          backgroundColor : states.focused ? "field" : "white"
        };
      }
    },

    "combo-box-list" :
    {
      include : "list",

      style : function(states)
      {
        return {
          backgroundColor : "white",
          textColor       : "text",
          edge            : 0,
          border          : "undefined",
          overflow        : "scrollY"
        };
      }
    },

    "combo-box-popup" :
    {
      include : "list",

      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           left   : [ 1, "solid", "general-border" ],
           bottom : [ 1, "solid", "general-border" ],
           right  : [ 1, "solid", "general-border" ]
        });

        return {
          maxHeight    : 150,
          border       : border,
          paddingLeft  : 0,
          paddingRight : 0,
          marginLeft   : 0,
          marginRight  : 0
        };
      }
    },

    "combo-box-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          border          : "undefined",
          backgroundColor : "transparent",
          textColor       : "text"
        };
      }
    },

    "combo-box-button" :
    {
      include : "button",

      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           right : [ 1, "solid", "general-border" ]
        });

        return {
          backgroundImage : null,
          backgroundColor : "transparent",
          border          : border,
          padding         : [ 0, 3, 0, 2 ],
          icon            : "widget/arrows/down.gif"
        }

      }
    },




    /*
    ---------------------------------------------------------------------------
      COMBOBOX EX
    ---------------------------------------------------------------------------
    */


    "combo-box-ex" :
    {
      include : "combo-box"
    },

    "combo-box-ex-list" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          textColor       : "text",
          border          : "undefined",
          edge            : 0,
          overflow        : "hidden"
        };
      }
    },

    "combo-box-ex-text-field" :
    {
      include : "combo-box-text-field",

      style : function(states)
      {
        return {
          minWidth : 30,
          width    : 100
        };
      }
    },

    "combo-box-ex-popup" :
    {
      style : function(states)
      {
        return {
          border          : "resizer",
          overflow        : "hidden",
          backgroundColor : "list"
        };
      }
    },

    "combo-box-ex-button" : {
      include : "combo-box-button"
    },




    /*
    ---------------------------------------------------------------------------
      TREE VIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual-focus-indicator" : {
      include : "empty"
    },





    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-element" :
    {
      style : function(states)
      {
        return {
          height                : 16,
          verticalChildrenAlign : "middle"
        };
      }
    },

    "tree-element-icon" :
    {
      style : function(states)
      {
        return {
          width  : 16,
          height : 16
        };
      }
    },

    "tree-element-label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          marginLeft      : 3,
          height          : 15,
          padding         : 2,
          backgroundColor : states.selected ? "selected" : "undefined",
          textColor       : states.selected ? "text-selected" : "undefined"
        };
      }
    },

    "tree-folder" : {
      include : "tree-element"
    },

    "tree-folder-icon" : {
      include : "tree-element-icon"
    },

    "tree-folder-label" : {
      include : "tree-element-label"
    },

    "tree" : {
      include : "tree-folder"
    },

    "tree-icon" : {
      include : "tree-folder-icon"
    },

    "tree-label" : {
      include : "tree-folder-label"
    },




    /*
    ---------------------------------------------------------------------------
      LISTVIEW
    ---------------------------------------------------------------------------
    */

    "list-view" :
    {
      style : function(states)
      {
        return {
          border          : "list-view",
          backgroundColor : "list-view"
        }
      }
    },

    "list-view-pane" :
    {
      style : function(states)
      {
        return {
          horizontalSpacing : 1
        };
      }
    },

    "list-view-header" :
    {
      style : function(states)
      {
        return {
          border          : qx.ui.core.Border.fromConfig({ bottom : [ 1, "solid", "list-view-header-border" ] }),
          backgroundColor : "list-view-header"
        };
      }
    },

    "list-view-header-cell" :
    {
      style : function(states)
      {
        return {
          padding         : [ 2, 6 ],
          spacing         : 4,
          backgroundColor : states.over ? "list-view-header-cell-hover" : "undefined",
          backgroundImage : "widget/gradient/button_gradient.png",
          paddingBottom   : states.over ? 0 : 2,
          border          : states.over ? qx.ui.core.Border.fromConfig({ bottom : [ 2, "solid", "list-view-header-border-hover" ] }) : "undefined"
        };
      }
    },

    "list-view-header-cell-arrow-up" :
    {
      style : function(states)
      {
        return {
          source : "widget/arrows/up.gif"
        };
      }
    },

    "list-view-header-cell-arrow-down" :
    {
      style : function(states)
      {
        return {
          source : "widget/arrows/down.gif"
        };
      }
    },

    "list-view-header-separator" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "list-view-header-separator-border",
          width           : 1,
          marginTop       : 1,
          marginBottom    : 1
        };
      }
    },

    "list-view-content-cell" :
    {
      style : function(states)
      {
        return {
          cursor          : "default",
          backgroundColor : states.selected ? "list-view-content-cell" : "undefined",
          textColor       : states.selected ? "white" : "undefined",
          border          : states.lead && !states.selected ?
            new qx.ui.core.Border.fromConfig({top : [ 1, "solid", "effect" ], bottom : [ 1, "solid", "effect" ]  }) :
            "undefined",
          marginTop      : states.lead && !states.selected ? 0 : 1,
          marginBottom   : states.lead && !states.selected ? 0 : 1
        };
      }
    },

    "list-view-content-cell-image" :
    {
      include : "list-view-content-cell",

      style : function(states)
      {
        return {
          paddingLeft  : 6,
          paddingRight : 6
        };
      }
    },

    "list-view-content-cell-text" :
    {
      include : "list-view-content-cell",

      style : function(states)
      {
        return {
          overflow     : "hidden",
          paddingLeft  : 6,
          paddingRight : 6
        };
      }
    },

    "list-view-content-cell-html" : {
      include : "list-view-content-cell-text"
    },

    "list-view-content-cell-icon-html" : {
      include : "list-view-content-cell-text"
    },

    "list-view-content-cell-link" : {
      include : "list-view-content-cell-text"
    },



    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "group-box" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "transparent"
        };
      }
    },

    "group-box-legend" :
    {
      style : function(states)
      {
        return {
          location        : [ 10, 1 ],
          backgroundColor : "group-box-legend",
          textColor       : "white",
          padding         : [ 1, 3, 2, 4 ],
          marginRight     : 10
        };
      }
    },

    "group-box-frame" :
    {
      style : function(states)
      {
        return {
          edge            : [ 8, 0, 0 ],
          padding         : [ 20, 12, 9 ],
          border          : "general",
          backgroundColor : "white"
        };
      }
    },

    "check-box-group-box-legend" :
    {
      style : function(states)
      {
        return {
          location        : [ 10, 1 ],
          backgroundColor : "document-background",
          paddingRight    : 3
        };
      }
    },

    "radio-button-group-box-legend" : {
      include : "check-box-group-box-legend"
    },



    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           top    : [ 1, "solid", "general-border" ],
           left   : [ 1, "solid", "general-border" ],
           bottom : [ 1, "solid", "general-border" ]
        });

        return {
          border          : border,
          backgroundColor : "white"
        };
      }
    },

    "spinner-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          padding : [ 2, 3 ]
        };
      }
    },

    "spinner-button":
    {
      style : function(states)
      {
        return {
          height          : "1*",
          width           : "auto"
        };
      }
    },

    "spinner-button-up" : {
      include : "spinner-button",

      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           left   : [ 1, "solid", "general-border" ],
           bottom : [ 1, "solid", "general-border" ],
           right  : [ 1, "solid", "general-border" ]
        });

        return {
          padding : [ 3, 4, 2 ],
          border  : border,
          source : "widget/arrows/up_small.gif"
        }
      }
    },

    "spinner-button-down" :
    {
      include : "spinner-button",

      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
           left  : [ 1, "solid", "general-border" ],
           right : [ 1, "solid", "general-border" ]
        });

        return {
          padding : [ 4, 4, 1 ],
          border  : border,
          source  : "widget/arrows/down_small.gif"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COLORSELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" :
    {
      style : function(states)
      {
        return {
          border : "general"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      DATECHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-toolbar-button" :
    {
      style : function(states)
      {
        return {
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle",
          padding               : 2
        };
      }
    },

    "datechooser-monthyear" :
    {
      style : function(states)
      {
        return {
          font          : "bold",
          verticalAlign : "middle",
          textAlign     : "center",
          textColor     : "date-chooser-title"
        };
      }
    },

    "datechooser-datepane" :
    {
      style : function(states)
      {
        return {
          border          : "general",
          backgroundColor : "date-chooser"
        };
      }
    },

    "datechooser-weekday" :
    {
      style : function(states)
      {
        var border  = new qx.ui.core.Border.fromConfig({
           bottom : [ 1, "solid", "general-border" ]
        });

        return {
          border          : border,
          font            : "bold",
          textAlign       : "center",
          textColor       : states.weekend ? "date-chooser" : "date-chooser-title",
          backgroundColor : states.weekend ? "date-chooser-title" : "date-chooser"
        };
      }
    },

    "datechooser-day" :
    {
      style : function(states)
      {
        var border_transparent = new qx.ui.core.Border(1, "solid", "transparent");

        return {
          textAlign       : "center",
          verticalAlign   : "middle",
          border          : states.today ? "general" : border_transparent,
          textColor       : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : "date-chooser-day",
          backgroundColor : states.selected ? "selected" : "undefined"
        };
      }
    },

    "datechooser-week" :
    {
      style : function(states)
      {
        if (states.header)
        {
          var border = qx.ui.core.Border.fromConfig({
            right  : [ 1, "solid", "general-border" ],
            bottom : [ 1, "solid", "general-border" ]
          });
        }
        else
        {
          var border = qx.ui.core.Border.fromConfig({
            right : [ 1, "solid", "general-border" ]
          });
        }

        return {
          textAlign : "center",
          textColor : "date-chooser-title",
          padding   : [ 2, 4 ],
          border    : border
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table-focus-statusbar" :
    {
      style : function(states)
      {
        return {
          border       : qx.ui.core.Border.fromConfig({ top : [ 1, "solid", "general-border" ] }),
          paddingLeft  : 2,
          paddingRight : 2
        };
      }
    },

    "table-focus-indicator" :
    {
      style : function(states)
      {
        var border;

        if (states.editing) {
          border = new qx.ui.core.Border(2, "solid", "table-focus-indicator-active");
        } else if (states.tableHasFocus) {
          border = new qx.ui.core.Border(3, "solid", "table-focus-indicator-active");
        } else {
          border = new qx.ui.core.Border(3, "solid", "table-focus-indicator");
        }

        return {
          border : border
        };
      }
    },

    "table-pane":
    {
      style : function(states)
      {
        return {
          backgroundColor : "table-pane"
        };
      }
    },

    "table-header":
    {
      style : function(states)
      {
        return {
          border : qx.ui.core.Border.fromConfig({ bottom : [ 1, "solid", "table-header-border" ] }),
          backgroundColor : "table-header"
        };
      }
    },

    "table-menubar-button" :
    {
      style : function(states)
      {
        if (states.pressed || states.checked || states.abandoned)
        {
          var border  = "general";
          var padding = [ 3, 2, 1, 4 ];
        }
        else if (states.over)
        {
          var border  = "general";
          var padding = [ 2, 3 ];
        }
        else
        {
          var border  = "undefined";
          var padding = [ 3, 4 ];
        }

        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          border                : border,
          padding               : padding,
          verticalChildrenAlign : "middle",
          backgroundColor       : states.abandoned ? "button" : "table-header-cell",
          backgroundImage       : "widget/gradient/button_gradient.png",
          icon                  : "widget/table/selectColumnOrder.png"
        };
      }
    },

    "table-header-cell" :
    {
      style : function(states)
      {
        var border, backgroundColor, paddingBottom;

        if (states.mouseover)
        {
          border = qx.ui.core.Border.fromConfig(
          {
            right  : [ 1, "solid", "table-header-border" ],
            bottom : [ 1, "solid", "table-header-border-hover" ]
          });

          backgroundColor = "table-header-cell-hover";
        }
        else
        {
          border = qx.ui.core.Border.fromConfig({
            right  : [ 1, "solid", "table-header-border" ],
            bottom : [ 1, "solid", "table-header-border" ]
          });

          backgroundColor = "table-header-cell";
        }

        return {
          paddingLeft           : 2,
          paddingRight          : 2,
          spacing               : 2,
          overflow              : "hidden",
          iconPosition          : "right",
          verticalChildrenAlign : "middle",
          border                : border,
          backgroundColor       : backgroundColor,
          backgroundImage       : "widget/gradient/button_gradient.png",
          icon                  : states.sorted ?
            (states.sortedAscending ? "widget/table/ascending.png" : "widget/table/descending.png")
            : null
        };
      }
    },

    "table-row" :
    {
      style : function(states)
      {
        return {
          font                     : "default",
          bgcolFocusedSelected     : "table-row-background-focused-selected",
          bgcolFocusedSelectedBlur : "table-row-background-focused-selected-blur",
          bgcolFocused             : "table-row-background-focused",
          bgcolFocusedBlur         : "table-row-background-focused-blur",
          bgcolSelected            : "table-row-background-selected",
          bgcolSelectedBlur        : "table-row-background-selected-blur",
          bgcolEven                : "table-row-background-even",
          bgcolOdd                 : "table-row-background-odd",
          colSelected              : "table-row-selected",
          colNormal                : "table-row"
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      style : function(states)
      {
        return {
          splitterSize : 6
        };
      }
    },

    "splitpane-splitter" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "general-border",
          cursor          : states.horizontal ? "col-resize" : "row-resize",
          backgroundImage : states.horizontal ? "widget/gradient/splitter_horizontal_gradient.png" : "widget/gradient/splitter_vertical_gradient.png"
        };
      }
    },

    "splitpane-slider" :
    {
      style : function(states)
      {
        return {
          opacity         : 0.5,
          backgroundColor : states.dragging ? "splitpane-slider-dragging" : "document-background"
        };
      }
    },

    "splitpane-knob" :
    {
      style : function(states)
      {
        var result = {
          opacity : states.dragging ? 0.5 : 1.0
        };

        if (states.horizontal)
        {
          result.top        = "50%";
          result.left       = "50%";

          // center knob image (63x3 Pixel)
          result.marginLeft = -1;
          result.marginTop  = -31;
          result.cursor     = "col-resize";
          result.source = "widget/splitpane/knob-horizontal.png";
        }
        else if (states.vertical)
        {
          result.top        = "50%";
          result.left       = "50%";

          // center knob image (4x15 Pixel)
          result.marginTop  = -2;
          result.marginLeft = -31;
          result.cursor     = "row-resize";
          result.source = "widget/splitpane/knob-vertical.png";
        }

        return result;
      }
    },

    "scrollbar-blocker" :
    {
      style : function( states )
      {
        return {
          backgroundColor : "black",
          opacity : 0.2
        };
      }
    }

  }
});