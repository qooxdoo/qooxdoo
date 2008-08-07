/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

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

# Cursor
#embed(qx.widgettheme/cursors/*)

# Table (HeaderCell)
#embed(qx.widgettheme/table/ascending.png)
#embed(qx.widgettheme/table/descending.png)

# Splitpane
#embed(qx.widgettheme/splitpane/*)

************************************************************************* */

/**
 * The default qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.classic.Appearance",
{
  title : "Classic",

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

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : "undefined"
        };
      }
    },

    "client-document" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor : "text",
          font : "default"
        };
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
          textColor : "tooltip-text",
          border : "tooltip",
          padding : [ 1, 3, 2, 3 ]
        };
      }
    },

    "iframe" :
    {
      style : function(states)
      {
        return {
          border : "inset"
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
        if (states.pressed || states.checked || states.abandoned) {
          var border = "inset";
        } else {
          var border = "outset";
        }

        if (states.pressed || states.abandoned) {
          var padding = [ 4, 3, 2, 5 ];
        } else {
          var padding = [ 3, 4 ];
        }

        return {
          backgroundColor : states.abandoned ? "button-abandoned" : states.over ? "button-hover" : "button",
          border : border,
          padding : padding
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
          border : "outset-thin",
          backgroundColor : "background"
        };
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
          border : "outset-thin"
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
        return {
          top    : 2,
          left   : 3,
          width  : "auto",
          bottom : 2,
          border : "divider-horizontal"
        };
      }
    },

    "toolbar-button" :
    {
      style : function(states)
      {
        if (states.pressed || states.checked || states.abandoned)
        {
          var border = "inset-thin";
          var padding = [ 3, 2, 1, 4 ];
        }
        else if (states.over)
        {
          var border = "outset-thin";
          var padding = [ 2, 3 ];
        }
        else
        {
          var border = "undefined";
          var padding = [ 3, 4 ];
        }

        return {
          cursor  : "default",
          spacing : 4,
          width   : "auto",
          border  : border,
          padding : padding,
          verticalChildrenAlign : "middle",
          backgroundColor       : states.abandoned ? "button-abandoned" : "button",
          backgroundImage       : states.checked && !states.over ? "static/image/dotted_white.gif" : null
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
          border : "dark-shadow"
        };
      }
    },

    "button-view-pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "button-view-pane",
          padding : 10
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
        var border = "undefined";
        var clazz = qx.ui.core.Border;

        if (states.barTop)
        {
          padding = [ 1, 0 ];
          border = clazz.fromConfig({ bottom : [ 1, "solid", "border-dark-shadow" ] });
        }
        else if (states.barBottom)
        {
          padding = [ 1, 0 ];
          border = clazz.fromConfig({ top : [ 1, "solid", "border-dark-shadow" ] });
        }
        else if (states.barLeft)
        {
          padding = [ 0, 1 ];
          border = clazz.fromConfig({ right : [ 1, "solid", "border-dark-shadow" ] });
        }
        else if (states.barRight)
        {
          padding = [ 0, 1 ];
          border = clazz.fromConfig({ left : [ 1, "solid", "border-dark-shadow" ] });
        }

        return {
          backgroundColor : "button-view-bar",
          padding : padding || "undefined",
          border : border || "undefined"
        };
      }
    },

    "button-view-button" :
    {
      style : function(states)
      {
        var margin, width, height, padding, border;

        if (states.checked || states.over)
        {
          border = new qx.ui.core.Border(1, "solid", "border-dark-shadow");

          if (states.barTop)
          {
            border.setBottom(3, "solid", "effect");
            padding = [ 3, 6, 1, 6 ];
          }
          else if (states.barBottom)
          {
            border.setTop(3, "solid", "effect");
            padding = [ 1, 6, 3, 6 ];
          }
          else if (states.barLeft)
          {
            border.setRight(3, "solid", "effect");
            padding = [ 3, 4, 3, 6 ];
          }
          else
          {
            border.setLeft(3, "solid", "effect");
            padding = [ 3, 6, 3, 4 ];
          }
        }
        else
        {
          border = "undefined";
          padding = [ 4, 7 ];
        }

        if (states.barTop || states.barBottom)
        {
          margin = [ 0, 1 ];
          width = "auto";
          height = null;
        }
        else
        {
          margin = [ 1, 0 ];
          height = "auto";
          width = null;
        }

        return {
          backgroundColor : states.checked ? "button-view-pane" : "undefined",
          iconPosition : "top",
          margin : margin,
          width : width ,
          height : height,
          border : border,
          padding : padding || "undefined"
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
          border : new qx.ui.core.Border(1, "solid", "tab-view-border"),
          padding : 10
        };
      }
    },

    "tab-view-page" : {
    },

    "tab-view-button" :
    {
      style : function(states)
      {
        var paddingTop, paddingBottom, paddingLeft, paddingRight;
        var marginTop, marginBottom, marginRight, marginLeft;
        var backgroundColor, border;

        marginTop = 0;
        marginBottom = 0;
        border = new qx.ui.core.Border(1, "solid", "tab-view-border");

        if (states.checked)
        {
          paddingTop = 2;
          paddingBottom = 4;
          paddingLeft = 7;
          paddingRight = 8;
          marginRight = -1;
          marginLeft = -2;
          backgroundColor = "tab-view-button-checked";

          if (states.barTop)
          {
            border.setWidthBottom(0);
            border.setTop(3, "solid", "effect");
          }
          else
          {
            border.setWidthTop(0);
            border.setBottom(3, "solid", "effect");
          }

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              paddingLeft = 6;
              paddingRight = 7;
              marginLeft = 0;
            }
          }
          else
          {
            if (states.lastChild)
            {
              paddingLeft = 8;
              paddingRight = 5;
              marginRight = 0;
            }
          }
        }
        else
        {
          paddingTop = 2;
          paddingBottom = 2;
          paddingLeft = 5;
          paddingRight = 6;
          marginRight = 1;
          marginLeft = 0;
          backgroundColor = states.over ? "tab-view-button-hover" : "tab-view-button";

          if (states.barTop)
          {
            border.setWidthBottom(0);
            marginTop = 3;
            marginBottom = 1;
          }
          else
          {
            border.setWidthTop(0);
            marginTop = 1;
            marginBottom = 3;
          }

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              paddingLeft = 6;
              paddingRight = 5;
            }
          }
          else
          {
            if (states.lastChild)
            {
              paddingLeft = 6;
              paddingRight = 5;
              marginRight = 0;
            }
          }
        }

        return {
          padding : [ paddingTop, paddingRight, paddingBottom, paddingLeft ],
          margin : [ marginTop, marginRight, marginBottom, marginLeft ],
          border : border,
          backgroundColor : backgroundColor
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      RADIO VIEW
    ---------------------------------------------------------------------------
    */

    "radio-view" : {
      include : "button-view"
    },

    "radio-view-pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "radio-view-pane"
        };
      }
    },

    "radio-view-page" : {
    },

    "radio-view-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "radio-view-bar",
          padding : [ 1, 0 ],
          border : states.barTop ?
            qx.ui.core.Border.fromConfig({ bottom : [ 1, "solid", "border-dark-shadow" ] }) :
            qx.ui.core.Border.fromConfig({ top : [ 1, "solid", "border-dark-shadow" ] })
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
          border = new qx.ui.core.Border(1, "solid", "border-dark-shadow");
          border.setLeft(3, "solid", "effect");
          padding = [ 2, 6, 2, 4 ];
        }
        else
        {
          border = "undefined";
          padding = [ 3, 7 ];
        }

        return {
          backgroundColor : states.checked ? "radio-view-button-checked" : "undefined",
          iconPosition : "left",
          margin : [ 0, 1 ],
          width : "auto",
          opacity : states.checked ? 1.0 : 0.3,
          border : border,
          padding : padding
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
          padding : 1,
          border : states.maximized ? "undefined" : "outset"
        };
      }
    },

    "window-captionbar" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 2, 2 ],
          verticalChildrenAlign : "middle",
          backgroundColor : states.active ? "window-active-caption" : "window-inactive-caption",
          textColor : states.active ? "window-active-caption-text" : "window-inactive-caption-text"
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states)
      {
        return {
          border : "dark-shadow"
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
          padding : states.pressed || states.abandoned ? [ 2, 1, 0, 3] : [ 1, 2 ]
        };
      }
    },

    "window-captionbar-minimize-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : "widget/window/minimize.gif"
        };
      }
    },

    "window-captionbar-restore-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : "widget/window/restore.gif"
        };
      }
    },

    "window-captionbar-maximize-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : "widget/window/maximize.gif"
        };
      }
    },

    "window-captionbar-close-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          marginLeft : 2,
          icon : "widget/window/close.gif"
        };
      }
    },

    "window-statusbar" :
    {
      style : function(states)
      {
        return {
          border : "inset-thin"
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
          padding : 4,
          border : "outset",
          backgroundColor : "background"
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
          border : "outset"
        };
      }
    },

    "resizer-frame" :
    {
      style : function(states)
      {
        return {
          border : "dark-shadow"
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
          border : "outset",
          padding : 1
        };
      }
    },

    "menu-layout" : {
    },

    "menu-button" :
    {
      style : function(states)
      {
        return {
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
        return {
          right  : 0,
          left   : 0,
          height : "auto",
          border : "divider-vertical"
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
          border          : "inset-thin",
          backgroundColor : "list"
        };
      }
    },

    "list-item" :
    {
      style : function(states)
      {
        return {
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
          border          : "inset",
          padding         : [ 1, 3 ],
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : "field"
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
        return {
          border          : "inset",
          backgroundColor : "field"
        };
      }
    },

    "combo-box-list" :
    {
      include : "list",

      style : function(states)
      {
        return {
          border   : "undefined",
          overflow : "scrollY"
        };
      }
    },

    "combo-box-popup" :
    {
      include : "list",

      style : function(states)
      {
        return {
          maxHeight : 150,
          border    : "dark-shadow"
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
          backgroundColor : "transparent"
        };
      }
    },

    "combo-box-button" :
    {
      include : "button",

      style : function(states)
      {
        return {
          padding : [ 0, 3, 0, 2 ],
          icon : "widget/arrows/down.gif"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      COMBOBOX EX
    ---------------------------------------------------------------------------
    */


    "combo-box-ex" :
    {
      style : function(states)
      {
        return {
          border          : "inset",
          backgroundColor : "field"
        };
      }
    },

    "combo-box-ex-list" :
    {
      include : "list",

      style : function(states)
      {
        return {
          border    : "undefined",
          edge      : 0
        };
      }
    },

    "combo-box-ex-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          border          : "undefined",
          minWidth        : 30,
          width           : 100,
          backgroundColor : "transparent"
        };
      }
    },

    "combo-box-ex-popup" :
    {
      include : "list",

      style : function(states)
      {
        return {
          border    : "resizer"
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
          textColor       : states.disabled ? "text-disabled" : (states.selected ? "text-selected" : "undefined")
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
          border : new qx.ui.core.Border(1, "solid", "list-view-border"),
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
          border : qx.ui.core.Border.fromConfig({ bottom : [ 1, "solid", "list-view-header-border" ] }),
          backgroundColor : "list-view-header"
        };
      }
    },

    "list-view-header-cell" :
    {
      style : function(states)
      {
        return {
          padding : [ 2, 6 ],
          spacing : 4,
          backgroundColor : states.over ? "list-view-header-cell-hover" : "undefined",
          paddingBottom : states.over ? 0 : 2,
          border : states.over ?
            new qx.ui.core.Border.fromConfig({ bottom : [ 2, "solid", "effect" ] }) :
            "undefined"
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
          backgroundColor : "list-view-header-border",
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
          backgroundColor : states.selected ? "selected" : "undefined",
          textColor       : states.selected ? "text-selected" : "undefined",
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
          backgroundColor : "background"
        };
      }
    },

    "group-box-legend" :
    {
      style : function(states)
      {
        return {
          location        : [ 10, 1 ],
          backgroundColor : "background",
          paddingRight    : 3,
          paddingLeft     : 4,
          marginRight     : 10
        };
      }
    },

    "group-box-frame" :
    {
      style : function(states)
      {
        return {
          edge : [ 8, 0, 0 ],
          padding : [ 12, 9 ],
          border  : "groove"
        };
      }
    },

    "check-box-group-box-legend" :
    {
      style : function(states)
      {
        return {
          location        : [ 10, 1 ],
          backgroundColor : "background",
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
        return {
          border          : "inset",
          backgroundColor : "field"
        };
      }
    },

    "spinner-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          backgroundColor : "transparent"
        };
      }
    },

    "spinner-button":
    {
      style : function(states)
      {
        return {
          width : 16,
          backgroundColor : "background",
          paddingLeft : 3,
          border : states.pressed || states.checked || states.abandoned ?
            "inset" : "outset"
        };
      }
    },

    "spinner-button-up" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          source : "widget/arrows/up_small.gif"
        }
      }
    },

    "spinner-button-down" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          paddingTop : 1,
          source : "widget/arrows/down_small.gif"
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
          backgroundColor : "background",
          border : "outset"
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
        var result =
        {
          backgroundColor : states.abandoned ? "button-abandoned" : "button",
          backgroundImage : (states.checked && !states.over) ? "static/image/dotted_white.gif" : null,
          spacing : 4,
          width : "auto",
          verticalChildrenAlign : "middle"
        };

        if (states.pressed || states.checked || states.abandoned) {
          result.border = "inset-thin";
        } else if (states.over) {
          result.border = "outset-thin";
        } else {
          result.border = "undefined";
        }

        if (states.pressed || states.checked || states.abandoned) {
          result.padding = [ 2, 0, 0, 2 ];
        } else if (states.over) {
          result.padding = 1;
        } else {
          result.padding = 2;
        }

        return result;
      }
    },

    "datechooser-monthyear" :
    {
      style : function(states)
      {
        return {
          font          : "large",
          textAlign     : "center",
          verticalAlign : "middle"
        };
      }
    },

    "datechooser-datepane" :
    {
      style : function(states)
      {
        return {
          border          : new qx.ui.core.Border(1, "solid", "gray"),
          backgroundColor : "date-chooser"
        };
      }
    },

    "datechooser-weekday" :
    {
      style : function(states)
      {
        var border = qx.ui.core.Border.fromConfig({
          bottom : [ 1, "solid", "gray" ]
        });

        return {
          border          : border,
          font            : "bold-large",
          textAlign       : "center",
          textColor       : states.weekend ? "date-chooser-title" : "date-chooser",
          backgroundColor : states.weekend ? "date-chooser" : "date-chooser-title"
        };
      }
    },

    "datechooser-day" :
    {
      style : function(states)
      {
        return {
          textAlign       : "center",
          verticalAlign   : "middle",
          border          : states.today ? "black" : "undefined",
          textColor       : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : "undefined",
          backgroundColor : states.selected ? "selected" : "undefined",
          padding         : [ 2, 4 ]
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
            right : [ 1, "solid", "gray" ],
            bottom : [ 1, "solid", "gray" ]
          });
        }
        else
        {
          var border = qx.ui.core.Border.fromConfig({
            right : [ 1, "solid", "gray" ]
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
          border : qx.ui.core.Border.fromConfig({ top : [ 1, "solid", "border-dark-shadow" ] }),
          paddingLeft : 2,
          paddingRight : 2
        };
      }
    },

    "table-focus-indicator" :
    {
      style : function(states)
      {
        return {
          border : new qx.ui.core.Border(2, "solid", "table-focus-indicator")
        };
      }
    },

    "table-editor-textfield" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          border  : "undefined",
          padding : [ 0, 2 ]
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
          var border = "inset-thin";
          var padding = [ 3, 2, 1, 4 ];
        }
        else if (states.over)
        {
          var border = "outset-thin";
          var padding = [ 2, 3 ];
        }
        else
        {
          var border = "undefined";
          var padding = [ 3, 4 ];
        }

        return {
          cursor  : "default",
          spacing : 4,
          width   : "auto",
          border  : border,
          padding : padding,
          verticalChildrenAlign : "middle",
          backgroundColor       : states.abandoned ? "button-abandoned" : "button",
          icon : "widget/table/selectColumnOrder.png"
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
            right : [ 1, "solid", "table-header-border" ],
            bottom : [ 2, "solid", "effect" ]
          });

          paddingBottom = 0;
          backgroundColor = "table-header-cell-hover";
        }
        else
        {
          border = qx.ui.core.Border.fromConfig({
            right : [ 1, "solid", "table-header-border" ]
          });

          paddingBottom = 2;
          backgroundColor = "table-header-cell";
        }

        return {
          paddingLeft           : 2,
          paddingRight          : 2,
          paddingBottom         : paddingBottom,
          spacing               : 4,
          overflow              : "hidden",
          iconPosition          : "right",
          verticalChildrenAlign : "middle",
          border                : border,
          backgroundColor       : backgroundColor,
          icon                  : states.sorted ?
            (states.sortedAscending ? "widget/table/ascending.png" : "widget/table/descending.png")
            : null,
          horizontalChildrenAlign : "left"
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
          overflow : "hidden",
          splitterSize : 8,
          backgroundColor : "background"
        };
      }
    },

    "splitpane-splitter" :
    {
      style : function(states)
      {
        return {
          cursor : states.horizontal ? "col-resize" : "row-resize"
        };
      }
    },

    "splitpane-slider" :
    {
      style : function(states)
      {
        return {
          opacity : 0.5,
          backgroundColor : "background"
        };
      }
    },

    "splitpane-knob" :
    {
      style : function(states)
      {
        if (states.horizontal)
        {
          return {
            opacity : states.dragging ? 0.5 : 1.0,
            top : "50%",
            left : "50%",
            cursor : "col-resize",
            source : "widget/splitpane/knob-horizontal.png",
            marginLeft : -2,
            marginTop : -7
          };
        }
        else
        {
          return {
            opacity : states.dragging ? 0.5 : 1.0,
            top : "50%",
            left : "50%",
            source : "widget/splitpane/knob-vertical.png",
            marginTop : -2,
            marginLeft : -7,
            cursor : "row-resize"
          }
        }
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
