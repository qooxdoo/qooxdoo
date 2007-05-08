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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/* ************************************************************************

#ignore(auto-use)
#embed(qx.static/image/dotted_white.gif)
#embed(qx.static/image/blank.gif)
#embed(qx.widget/gradient/barbutton_gradient.png)
#embed(qx.widget/gradient/button_gradient.png)
#embed(qx.widget/gradient/tabbutton_gradient.png)
#embed(qx.widget/gradient/tabbutton_reverse_gradient.png)
#embed(qx.widget/gradient/toolbar_gradient.png)

************************************************************************* */

/**
 * Ext-Clone appearance theme.
 */
qx.Theme.define("qx.theme.ext.Appearance",
{
  title : "Ext",

  appearances :
  {
    "empty" :
    {
    },

    "widget" :
    {
    },

    "image" : {
    },



    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "client-document" : {
      style : function(states) {
        return {
          backgroundColor    : "threedface",
          textColor          : "windowtext",
          hideFocus          : true
        }
      }
    },

    "blocker" : {
      style : function(states) {
        // You could also use: "static/image/dotted_white.gif" for example as backgroundImage here
        // (Visible) background tiles could be dramatically slow down mshtml!
        // A background image or color is always needed for mshtml to block the events successfully.
        return {
          cursor          : "default",
          backgroundImage : "static/image/blank.gif"
        }
      }
    },

    "atom" : {
      style : function(states) {
        return {
          cursor                        : "default",
          spacing                       : 4,
          width                         : "auto",
          height                        : "auto",
          horizontalChildrenAlign       : "center",
          verticalChildrenAlign         : "middle",
          stretchChildrenOrthogonalAxis : false
        }
      }
    },

    "label" : {
      style : function(states) {
        return {
          font  : '11px verdana, helvetica, tahoma, sans-serif',
          wrap  : false,
          textColor : states.disabled ? "graytext" : "undefined"
        }
      }
    },

    "htmlcontainer" : {
      include : "label"
    },

    "popup" : {
      style : function(states) {
        return {
          width  : "auto",
          height : "auto"
        }
      }
    },

    "tool-tip" : {
      include : "popup",

      style : function(states) {
        return {
          backgroundColor : "infobackground",
          textColor       : "infotext",
          border          : "1px solid #FCC90D",
          paddingTop      : 1,
          paddingRight    : 3,
          paddingBottom   : 2,
          paddingLeft     : 3
        }
      }
    },

    "iframe" : {
      style : function(states) {
        return { border : "1px solid #6593CF" }
      }
    },






    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" : {
      include : "atom",

      style : function(states) {
        return {
          backgroundImage : "widget/gradient/button_gradient.png",

          backgroundColor : states.over ? "buttonhighlight" : "buttonface",
          border          : states.over ? "inset" : "thinOutset",
          paddingTop      : states.over ? 2 : 3,
          paddingBottom   : states.over ? 2 : states.pressed ? 1 : 3,
          paddingLeft     : states.over ? 3 : 4,
          paddingRight    : states.over ? 3 : states.pressed ? 2 : 4
        }
      }
    },








    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" : {
      style : function(states) {
        return {
          border          : "1px solid #98C0F4",
          backgroundColor : "#C9DEFA",
          backgroundImage : "widget/gradient/toolbar_gradient.png",
          height          : "auto"
        }
      }
    },

    "toolbar-part" : {
      style : function(states) {
        return { width : "auto" }
      }
    },

    "toolbar-part-handle" : {
      style : function(states) {
        return { width : 10 }
      }
    },

    "toolbar-part-handle-line" : {
      style : function(states) {
        return {
          top    : 2,
          left   : 3,
          bottom : 2,
          width  : 4,
          border : "1px solid #6593CF"
        }
      }
    },

    "toolbar-separator" : {
      style : function(states) {
        return { width : 8 }
      }
    },

    "toolbar-separator-line" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setLeft(1, "solid", "#6593CF");

        return {
          top    : 2,
          left   : 3,
          width  : 2,
          bottom : 2,
          border : border_default
        }
      }
    },

    "toolbar-button" : {
      style : function(states) {
        var border_pressed = new qx.renderer.border.Border(1, "solid", "#6593CF");
        var border_default = "undefined";

        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle",

          backgroundColor       : states.checked || states.pressed || states.over ? "highlight" : "transparent",
          border                : states.pressed || states.checked || states.abandoned || states.over ? border_pressed : border_default,
          paddingTop            : states.pressed || states.checked || states.abandoned ? 3 : states.over ? 2 : 3,
          paddingRight          : states.pressed || states.checked || states.abandoned ? 2 : states.over ? 3 : 4,
          paddingBottom         : states.pressed || states.checked || states.abandoned ? 1 : states.over ? 2 : 3,
          paddingLeft           : states.pressed || states.checked || states.abandoned ? 4 : states.over ? 3 : 4
        }
      }
    },







    /*
    ---------------------------------------------------------------------------
      BUTTON VIEW
    ---------------------------------------------------------------------------
    */

    "button-view" : {
      style : function(states) {
        return {
          backgroundColor : "white",
          border          : "1px solid #6593CF"
        }
      }
    },

    "button-view-pane" : {
      style : function(states) {
        return {
          width  : states.barHorizontal ? null : "1*",
          height : states.barHorizontal ? "1*" : null
        }
      }
    },

    "button-view-page" : {
      style : function(states) {
        return {
          backgroundColor : "white",
          left            : 10,
          right           : 10,
          top             : 10,
          bottom          : 10
        }
      }
    },

    "button-view-bar" : {
      style : function(states) {
        var border_top = new qx.renderer.border.Border;
        border_top.setBottom(1, "solid", "#6593CF");

        var border_bottom = new qx.renderer.border.Border;
        border_bottom.setTop(1, "solid", "#6593CF");

        var border_left = new qx.renderer.border.Border;
        border_left.setRight(1, "solid", "#6593CF");

        var border_right = new qx.renderer.border.Border;
        border_right.setLeft(1, "solid", "#6593CF");

        var vReturn = {};
        vReturn.backgroundColor = "#BCD4F7";

        if (states.barTop) {
          vReturn.paddingTop    = 1;
          vReturn.paddingRight  = 0;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft   = 0;

          vReturn.border        = border_top;
          vReturn.height        = "auto";
          vReturn.width         = null;
          vReturn.orientation   = "horizontal";
        }
        else if (states.barBottom) {
          vReturn.paddingTop    = 1;
          vReturn.paddingRight  = 0;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft   = 0;

          vReturn.border        = border_bottom;
          vReturn.height        = "auto";
          vReturn.width         = null;
          vReturn.orientation   = "horizontal";
        }
        else if (states.barLeft) {
          vReturn.paddingTop    = 0;
          vReturn.paddingRight  = 1;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft   = 1;

          vReturn.border        = border_left;
          vReturn.height        = null;
          vReturn.width         = "auto";
          vReturn.orientation   = "vertical";
        }
        else if (states.barRight) {
          vReturn.paddingTop    = 0;
          vReturn.paddingRight  = 1;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft   = 1;

          vReturn.border        = border_right;
          vReturn.height        = null;
          vReturn.width         = "auto";
          vReturn.orientation   = "vertical";
        }

        return vReturn;
      }
    },

    "button-view-button" : {
      include : "atom",

      style : function(states) {
        var vReturn = {
          iconPosition  : "top"
        };

        if (states.checked || states.over) {
          vReturn.border          = "1px solid buttonshadow";
          vReturn.backgroundImage = states.checked ? "widget/gradient/barbutton_gradient.png" : null;
          vReturn.backgroundColor = states.checked ? "buttonface" : "undefined";
          vReturn.paddingTop      = vReturn.paddingBottom = 3;
          vReturn.paddingLeft     = vReturn.paddingRight  = 6;
        }
        else {
          vReturn.border          = "undefined";
          vReturn.backgroundImage = null;
          vReturn.backgroundColor = "undefined";
          vReturn.paddingTop      = vReturn.paddingBottom = 4;
          vReturn.paddingRight    = vReturn.paddingLeft   = 7;
        }

        if (states.barTop || states.barBottom) {
          vReturn.marginTop       = vReturn.marginBottom = 0;
          vReturn.marginRight     = vReturn.marginLeft   = 1;
          vReturn.width           = "auto";
          vReturn.height          = null;
        }
        else if (states.barLeft || states.barRight) {
          vReturn.marginTop       = vReturn.marginBottom = 1;
          vReturn.marginRight     = vReturn.marginLeft   = 0;
          vReturn.height          = "auto";
          vReturn.width           = null;
        }

        return vReturn;
      }
    },


    /*
    ---------------------------------------------------------------------------
      RADIO VIEW
    ---------------------------------------------------------------------------
    */

    "radio-view" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          border          : "1px solid #6593CF"
        };
      }
    },

    "radio-view-pane" :
    {
      style : function(states)
      {
        return {
          width  : states.barHorizontal ? null : "1*",
          height : states.barHorizontal ? "1*" : null
        };
      }
    },

    "radio-view-page" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          left            : 10,
          right           : 10,
          top             : 10,
          bottom          : 10
        };
      }
    },

    "radio-view-bar" :
    {
      style : function(states)
      {
        var border_top = new qx.renderer.border.Border;
        border_top.setBottom(1, "solid", "#6593CF");

        var border_bottom = new qx.renderer.border.Border;
        border_bottom.setTop(1, "solid", "#6593CF");

        var border_left = new qx.renderer.border.Border;
        border_left.setRight(1, "solid", "#6593CF");

        var border_right = new qx.renderer.border.Border;
        border_right.setLeft(1, "solid", "#6593CF");

        var vReturn = {};
        vReturn.backgroundColor = "#BCD4F7";

        if (states.barTop) {
          vReturn.paddingTop    = 1;
          vReturn.paddingRight  = 0;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft   = 0;

          vReturn.border        = border_top;
          vReturn.height        = "auto";
          vReturn.width         = null;
          vReturn.orientation   = "horizontal";
        }
        else if (states.barBottom) {
          vReturn.paddingTop    = 1;
          vReturn.paddingRight  = 0;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft   = 0;

          vReturn.border        = border_bottom;
          vReturn.height        = "auto";
          vReturn.width         = null;
          vReturn.orientation   = "horizontal";
        }
        else if (states.barLeft) {
          vReturn.paddingTop    = 0;
          vReturn.paddingRight  = 1;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft   = 1;

          vReturn.border        = border_left;
          vReturn.height        = null;
          vReturn.width         = "auto";
          vReturn.orientation   = "vertical";
        }
        else if (states.barRight) {
          vReturn.paddingTop    = 0;
          vReturn.paddingRight  = 1;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft   = 1;

          vReturn.border        = border_right;
          vReturn.height        = null;
          vReturn.width         = "auto";
          vReturn.orientation   = "vertical";
        }

        return vReturn;
      }
    },

    "radio-view-button" :
    {
      include : "atom",

      style : function(states)
      {
        var vReturn = {
          iconPosition  : "top"
        };

        if (states.checked || states.over) {
          vReturn.border          = "1px solid buttonshadow";
          vReturn.backgroundImage = states.checked ? "widget/gradient/barbutton_gradient.png" : null;
          vReturn.backgroundColor = states.checked ? "buttonface" : "undefined";
          vReturn.paddingTop      = vReturn.paddingBottom = 3;
          vReturn.paddingLeft     = vReturn.paddingRight  = 6;
        }
        else {
          vReturn.border          = "undefined";
          vReturn.backgroundImage = null;
          vReturn.backgroundColor = "undefined";
          vReturn.paddingTop      = vReturn.paddingBottom = 4;
          vReturn.paddingRight    = vReturn.paddingLeft   = 7;
        }

        if (states.barTop || states.barBottom) {
          vReturn.marginTop       = vReturn.marginBottom = 0;
          vReturn.marginRight     = vReturn.marginLeft   = 1;
          vReturn.width           = "auto";
          vReturn.height          = null;
        }
        else if (states.barLeft || states.barRight) {
          vReturn.marginTop       = vReturn.marginBottom = 1;
          vReturn.marginRight     = vReturn.marginLeft   = 0;
          vReturn.height          = "auto";
          vReturn.width           = null;
        }

        return vReturn;
      }
    },






    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" : {
      style : function(states) {
        return {
          backgroundColor : "background",
          textColor       : "windowtext",
          paddingTop      : 0,
          paddingRight    : 0,
          paddingBottom   : 0,
          paddingLeft     : 0,
          border          : states.maximized ? "undefined" : "1px solid #6593CF"
        }
      }
    },

    "window-captionbar" : {
      style : function(states) {
        return {
          paddingTop            : 4,
          paddingRight          : 2,
          paddingBottom         : 5,
          paddingLeft           : 2,
          verticalChildrenAlign : "middle",
          height                : 24,
          overflow              : "hidden",

          backgroundColor       : states.active ? "activecaption" : "inactivecaption",
          textColor             : states.active ? "captiontext" : "inactivecaptiontext"
        }
      }
    },

    "window-resize-frame" : {
      style : function(states) {
        return { border : "1px solid #6593CF" }
      }
    },

    "window-captionbar-icon" : {
      style : function(states) {
        return { marginRight : 2 }
      }
    },

    "window-captionbar-title" : {
      style : function(states) {
        return {
          cursor      : "default",
          font        : '12px bold tahoma, verdana, helvetica, tahoma, sans-serif',
          marginRight : 2,
          wrap        : false
        }
      }
    },

    "window-captionbar-button" : {
      include : "button",

      style : function(states) {
        return {
          paddingTop      : 0,
          paddingBottom   : 0,
          paddingRight    : 1,
          paddingLeft     : 1,
          border          : "undefined",
          backgroundColor : "transparent",
          backgroundImage : null
        }
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
        return { icon : states.active ? "widget/window/restore.gif" : "widget/window/restore_inactive.gif" }
      }
    },

    "window-captionbar-maximize-button" : {
      include : "window-captionbar-button",

      style : function(states) {
        return { icon : states.active ? "widget/window/maximize.gif" : "widget/window/maximize_inactive.gif" }
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

    "window-statusbar" : {
      style : function(states) {
        return {
          border : "thinInset",
          height : "auto"
        }
      }
    },

    "window-statusbar-text" : {
      style : function(states) {
        return {
          paddingTop    : 1,
          paddingRight  : 4,
          paddingBottom : 1,
          paddingLeft   : 4,
          cursor        : "default"
        }
      }
    },







    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer": {
      style: function(states) {
        return { border : "thinOutset" }
      }
    },

    "resizer-frame" : {
      style : function(states) {
        return { border : "1px solid #6593CF" }
      }
    },







    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" : {
      style : function(states) {
        return {
          width           : "auto",
          height          : "auto",
          backgroundColor : "menu",
          border          : "1px solid #6593CF",
          paddingTop      : 1,
          paddingRight    : 1,
          paddingBottom   : 1,
          paddingLeft     : 1
        }
      }
    },

    "menu-layout" : {
      style : function(states) {
        return {
          top    : 0,
          right  : 0,
          bottom : 0,
          left   : 0
        }
      }
    },

    "menu-button" : {
      style : function(states) {
        return {
          minWidth              : "auto",
          height                : "auto",
          spacing               : 2,
          paddingTop            : 2,
          paddingRight          : 4,
          paddingBottom         : 2,
          paddingLeft           : 4,
          cursor                : "default",
          verticalChildrenAlign : "middle",
          backgroundColor       : states.over ? "highlight" : "undefined",
          textColor             : states.over ? "highlighttext" : "undefined"
        }
      }
    },

    "menu-check-box" : {
      include : "menu-button"
    },

    "menu-radio-button" : {
      include : "menu-button"
    },

    "menu-separator" : {
      style : function(states) {
        return {
          height       : "auto",
          marginTop    : 3,
          marginBottom : 2,
          paddingLeft  : 3,
          paddingRight : 3
        }
      }
    },

    "menu-separator-line" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setTop(1, "solid", "#6593CF");

        return {
          right  : 0,
          left   : 0,
          height : "auto",
          border : border_default
        }
      }
    },








    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" : {
      style : function(states) {
        return {
          overflow        : "hidden",
          border          : "1px solid #6593CF",
          backgroundColor : "#FAFBFE"
        }
      }
    },

    "list-item" : {
      style : function(states) {
        return {
          cursor                  : "default",
          height                  : "auto",
          horizontalChildrenAlign : "left",
          verticalChildrenAlign   : "middle",
          spacing                 : 4,
          paddingTop              : 3,
          paddingRight            : 5,
          paddingBottom           : 3,
          paddingLeft             : 5,
          minWidth                : "auto",

          backgroundColor         : states.selected ? "highlight" : "undefined",
          textColor               : states.selected ? "highlighttext" : "undefined"
        }
      }
    },








    /*
    ---------------------------------------------------------------------------
      FIELDS
    ---------------------------------------------------------------------------
    */

    "text-field" : {
      style : function(states) {
        return {
          hideFocus       : true,
          font            : '11px verdana, helvetica, tahoma, sans-serif',
          border          : "1px solid #6593CF",
          width           : "auto",
          height          : "auto",
          paddingTop      : 1,
          paddingBottom   : 1,
          paddingLeft     : 3,
          paddingRight    : 3,

          textColor       : states.disabled ? "graytext" : "#1E3C73",
          backgroundColor : states.focused ? "#BCD4F7" : "white"
        }
      }
    },

    "text-area" : {
      include : "text-field",

      style : function(states) {
        return {
          overflow     : "auto",

          // gecko automatically defines a marginTop/marginBottom of 1px. We need to reset these values.
          marginTop    : 0,
          marginBottom : 0
        }
      }
    },










    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combo-box" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setTop(1, "solid", "#6593CF");
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");

        return {
          border          : border_default,
          minWidth        : 40,
          width           : 120,
          height          : "auto",
          backgroundColor : "white",
          allowStretchY   : false
        }
      }
    },

    "combo-box-ex" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setTop(1, "solid", "#6593CF");
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");

        return {
          width           : "auto",
          height          : "auto",
          border          : border_default,
          backgroundColor : "white",
          allowStretchY   : false
        }
      }
    },

    "combo-box-list" : {
      include : "list",

      style : function(states) {
        return {
          backgroundColor : "white",
          textColor       : "#1E3C73",
          top             : 0,
          right           : 0,
          bottom          : 0,
          left            : 0,
          border          : "undefined",
          overflow        : "scrollY"
        }
      }
    },

    "combo-box-ex-list" : {
      include : "list",

      style : function(states) {
        return {
          statusBarVisible              : false,
          columnVisibilityButtonVisible : false,
          height                        : 'auto',
          maxHeight                     : 150,
          top                           : 0,
          left                          : 0,
          border                        : "undefined"
        }
      }
    },

    "combo-box-popup" : {
      include : "list",

      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");
        border_default.setRight(1, "solid", "#6593CF");

        return {
          height       : "auto",
          maxHeight    : 150,
          paddingLeft  : 0,
          paddingRight : 0,
          marginLeft   : 0,
          marginRight  : 0,
          border       : border_default
        }
      }
    },

    "combo-box-ex-popup" : {
      include : "list",

      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");
        border_default.setRight(1, "solid", "#6593CF");

        return {
          width  : "auto",
          height : "auto",
          border : border_default
        }
      }
    },

    "combo-box-text-field" : {
      include : "text-field",

      style : function(states) {
        return {
          border          : "undefined",
          width           : "1*",
          backgroundColor : "transparent",
          textColor       : "#1E3C73"
        }
      }
    },

    "combo-box-ex-text-field" : {
      include : "text-field",

      style : function(states) {
        return {
          border          : "undefined",
          minWidth        : 30,
          width           : 100,
          backgroundColor : "transparent"
        }
      }
    },

    // Used both for ComboBox and ComboBoxEx
    "combo-box-button" : {
      include : "button",

      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setRight(1, "solid", "#6593CF");

        return {
          height          : null,
          allowStretchY   : true,
          backgroundImage : null,
          backgroundColor : "#E2E3E8",
          border          : border_default,
          paddingTop      : 0,
          paddingRight    : 3,
          paddingBottom   : 0,
          paddingLeft     : 2
        }
      }
    },







    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-element" : {
      style : function(states) {
        return {
          height                : 16,
          verticalChildrenAlign : "middle"
        }
      }
    },

    "tree-element-icon" : {
      style : function(states) {
        return {
          width  : 16,
          height : 16
        }
      }
    },

    "tree-element-label" : {
      include : "label",

      style : function(states) {
        return {
          cursor          : "default",
          marginLeft      : 3,
          height          : 15,
          paddingTop      : 2,
          paddingRight    : 2,
          paddingBottom   : 2,
          paddingLeft     : 2,
          allowStretchY   : false,

          backgroundColor : states.selected ? "highlight" : "undefined",
          textColor       : states.selected ? "highlighttext" : "undefined"
        }
      }
    },

    "tree-folder" : {
      include : "tree-element"
    },

    "tree-folder-icon" : {
      style : function(states) {
        return {
          width  : 16,
          height : 16
        }
      }
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

    "tree-container" : {
      style : function(states) {
        return {
          verticalChildrenAlign : "top",
          border                : "black"
        }
      }
    },

    "tree-folder-container" : {
      style : function(states) {
        return {
          height                : "auto",
          verticalChildrenAlign : "top"
        }
      }
    },







    /*
    ---------------------------------------------------------------------------
      LISTVIEW
    ---------------------------------------------------------------------------
    */

    "list-view" : {
      style : function(states) {
        return {
          cursor   : "default",
          overflow : "hidden"
        }
      }
    },

    "list-view-pane" : {
      style : function(states) {
        return {
          width             : "1*",
          horizontalSpacing : 1,
          overflow          : "hidden"
        }
      }
    },

    "list-view-header" : {
      style : function(states) {
        var border_default  = new qx.renderer.border.Border;
        border_default.setBottom(1, "solid", "#E2E2E2");

        return {
          height          : "auto",
          overflow        : "hidden",
          border          : border_default,
          backgroundColor : "#EBEADB"
        }
      }
    },

    "list-view-header-cell" : {
      style : function(states) {
        var border_hover = new qx.renderer.border.Border;
        border_hover.setBottom(2, "solid", "#F9B119");

        return {
          overflow        : "hidden",
          paddingTop      : 2,
          paddingRight    : 6,
          paddingLeft     : 6,
          spacing         : 4,

          paddingBottom   : states.over ? 2 : 0,
          backgroundColor : states.over ? "#FAF9F4" : "undefined",
          border          : states.over ? border_hover : "undefined"
        }
      }
    },

    "list-view-header-separator" : {
      style : function(states) {
        return {
          backgroundColor : "#D6D5D9",
          width           : 1,
          marginTop       : 1,
          marginBottom    : 1
        };
      }
    },

    "list-view-content-cell" : {
      style : function(states) {
        return {
          backgroundColor : states.selected ? "#5A8AD3" : "undefined",
          textColor       : states.selected ? "white" : "undefined"
        };
      }
    },

    "list-view-content-cell-image" : {
      include : "list-view-content-cell",

      style : function(states) {
        return {
          paddingLeft  : 6,
          paddingRight : 6
        };
      }
    },

    "list-view-content-cell-text" : {
      include : "list-view-content-cell",

      style : function(states) {
        return {
          overflow     : "hidden",
          paddingLeft  : 6,
          paddingRight : 6,
          font         : '11px verdana, helvetica, tahoma, sans-serif'
        }
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
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tab-view" : {
      style : function(states) {
        return { spacing : -1 };
      }
    },

    "tab-view-bar" : {
      style : function(states) {
        return { height : "auto" };
      }
    },

    "tab-view-pane" : {
      style : function(states) {
        return {
          height          : "1*",
          backgroundColor : "white",
          border          : "1px solid #6593CF",
          paddingTop      : 10,
          paddingRight    : 10,
          paddingBottom   : 10,
          paddingLeft     : 10
        };
      }
    },

    "tab-view-page" : {
      style : function(style) {
        return {
          textColor  : "#1E3C73",
          top    : 0,
          right  : 0,
          bottom : 0,
          left   : 0
        };
      }
    },

    "tab-view-button" : {
      include : "atom",

      style : function(states) {
        // state-check - only create the border-instance which is needed
        if (states.barTop) {
          var border_top_default = new qx.renderer.border.Border;
          border_top_default.setLeft(1, "solid", "#6593CF");
          border_top_default.setTop(1, "solid", "#6593CF");
          border_top_default.setRight(1, "solid", "#6593CF");
        };

        if (!states.barTop) {
          var border_bottom_default  = new qx.renderer.border.Border;
          border_bottom_default.setRight(1, "solid", "#6593CF");
          border_bottom_default.setBottom(1, "solid", "#6593CF");
          border_bottom_default.setLeft(1, "solid", "#6593CF");
        };

        var vReturn;

        if (states.checked) {
          vReturn = {
            textColor           : "#1E3C73",
            backgroundImage : states.barTop ? "widget/gradient/tabbutton_gradient.png" : "widget/gradient/tabbutton_reverse_gradient.png",
            backgroundColor : "buttonface",
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
            textColor           : "#666666",
            backgroundImage : states.barTop ? "widget/gradient/tabbutton_gradient.png" : "widget/gradient/tabbutton_reverse_gradient.png",
            backgroundColor : "#D2D6D8",
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
      FIELDSET
    ---------------------------------------------------------------------------
    */

    "field-set" : {
      style : function(states) {
        return { backgroundColor : "transparent" }
      }
    },

    "field-set-legend" : {
      include : "atom",

      style : function(states) {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "#6593CF",
          textColor           : "captiontext",
          paddingTop      : 1,
          paddingBottom   : 2,
          paddingRight    : 3,
          paddingLeft     : 4,
          marginRight     : 10
        }
      }
    },

    "field-set-frame" : {
      style : function(states) {
        return {
          top             : 8,
          left            : 2,
          right           : 2,
          bottom          : 2,
          paddingTop      : 20,
          paddingRight    : 9,
          paddingBottom   : 12,
          paddingLeft     : 9,
          border          : "1px solid #6593CF",
          backgroundColor : "white"
        }
      }
    },

    "check-box-field-set-legend" : {
      include : "atom",

      style : function(states) {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "#E5F4FE",
          paddingRight    : 3
        }
      }
    },

    "radio-button-field-set-legend" : {
      include : "check-box-field-set-legend"
    },







    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setTop(1, "solid", "#6593CF");
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");

        return {
          width           : 60,
          height          : 22,
          border          : border_default
        }
      }
    },

    "spinner-field" : {
      include : "text-field",

      style : function(states) {


        return {
          width  : "1*",
          border : "undefined"
        }
      }
    },

    "spinner-button-up" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setLeft(1, "solid", "#6593CF");
        border_default.setBottom(1, "solid", "#6593CF");
        border_default.setRight(1, "solid", "#6593CF");

        return {
          height          : "1*",
          width           : "auto",
          backgroundColor : "#E2E3E8",
          border          : border_default,
          paddingTop      : 2,
          paddingRight    : 4,
          paddingBottom   : 0,
          paddingLeft     : 3
        }
      }
    },

    "spinner-button-down" : {
      include : "spinner-button-up",

      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setRight(1, "solid", "#6593CF");
        border_default.setTop(1, "solid", "#6593CF");
        border_default.setLeft(1, "solid", "#6593CF");

        return {
          paddingTop    : 3,
          paddingBottom : 0,
          border        : border_default
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      COLORSELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : {
      style : function(states) {
        return {
          border : "1px solid #6593CF",
          width  : "auto",
          height : "auto"
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATECHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-toolbar-button" : {
      style : function(states) {
        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle",
          paddingTop            : 2,
          paddingBottom         : 2,
          paddingLeft           : 2,
          paddingRight          : 2
        };
      }
    },


    "datechooser-monthyear" : {
      style : function(states) {
        return {
          font          : "boldCenter",
          verticalAlign : "middle"
        }
      }
    },


    "datechooser-datepane" : {
      style : function(states) {
        return {
          border          : "1px solid #6593CF",
          backgroundColor : "white"
        }
      }
    },


    "datechooser-weekday" : {
      style : function(states) {
        var border_default  = new qx.renderer.border.Border;
        border_default.setBottom(1, "solid", "#6593CF");

        return {
          border          : border_default,
          font            : "center",

          textColor           : states.weekend ? "#406FAC" : "#C3DAF9",
          backgroundColor : states.weekend ? "#C3DAF9" : "#406FAC"
        }
      }

    },


    "datechooser-day" : {
      style: function(states) {
        var border_transparent = new qx.renderer.border.Border(1, "none");
        var border_today       = new qx.renderer.border.Border(1, "solid", "#6593CF");

        return {
          cursor          : "default",
          font            : 'center',
          verticalAlign   : "middle",
          selectable      : false,

          border          : states.today ? border_today : border_transparent,
          textColor           : states.selected ? "highlightText" : (states.otherMonth ? "grayText" : "#1F3E75"),
          backgroundColor : states.selected ? "highlight" : "undefined"
        }
      }
    },

    "datechooser-week" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setRight(1, "solid", "#6593CF");

        var border_header = new qx.renderer.border.Border;
        border_header.setRight(1, "solid", "#6593CF");
        border_header.setBottom(1, "solid", "#6593CF");

        return {
          font        : '11px verdana, helvetica, tahoma, sans-serif',
          textColor       : "#1F3E75",
          paddingLeft : 2,

          border      : states.header ? border_header : border_default
        }
      }
    },






    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table-focus-statusbar" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setTop(1, "solid", "#6593CF");

        return {
          font         : '11px verdana, helvetica, tahoma, sans-serif',
          border       : border_default,
          paddingLeft  : 2,
          paddingRight : 2
        }
      }
    },


    "table-focus-indicator" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border(3, "solid", "#B3D9FF");
        var border_blur    = new qx.renderer.border.Border(3, "solid", "#C5C8CA");
        var border_editing = new qx.renderer.border.Border(2, "solid", "#B3D9FF");

        return {
          border : states.editing ? border_editing : (states.tableHasFocus ? border_default : border_blur)
        }
      }
    },


    "table-editor-textfield" : {
      style : function(states) {
        return {
          font          : '11px verdana, helvetica, tahoma, sans-serif',
          border        : "none",
          paddingLeft   : 2,
          paddingRight  : 2,
          paddingTop    : 0,
          paddingBottom : 0
        }
      }
    },

    "table-header-cell" : {
      style : function(states) {
        var border_default = new qx.renderer.border.Border;
        border_default.setRight(1, "solid", "#D6D2C2");
        border_default.setBottom(1, "solid", "#D6D2C2");

        var border_mouseOver     = new qx.renderer.border.Border;
        border_mouseOver.setRight(1, "solid", "#D6D2C2");
        border_mouseOver.setBottom(1, "solid", "#F9B119");

        return {
          cursor                : "default",
          paddingLeft           : 2,
          paddingRight          : 2,
          spacing               : 2,
          overflow              : "hidden",
          selectable            : false,
          iconPosition          : "right",
          verticalChildrenAlign : "middle",

          backgroundColor       : states.mouseover ? "white" : "#EBEADB",
          border                : states.mouseover ? border_mouseOver : border_default
        }
      }
    },


    "table-menubar-button" : {
      style : function(states) {
        var border_pressed = new qx.renderer.border.Border(1, "solid", "#6593CF");
        var border_default = "undefined";

        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle",

          backgroundColor       : states.checked || states.pressed || states.over ? "highlight" : "transparent",
          border                : states.pressed || states.checked || states.abandoned || states.over ? border_pressed : border_default,
          paddingTop            : states.pressed || states.checked || states.abandoned ? 3 : states.over ? 2 : 3,
          paddingRight          : states.pressed || states.checked || states.abandoned ? 2 : states.over ? 3 : 4,
          paddingBottom         : states.pressed || states.checked || states.abandoned ? 1 : states.over ? 2 : 3,
          paddingLeft           : states.pressed || states.checked || states.abandoned ? 4 : states.over ? 3 : 4
        }
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
        return { overflow : "hidden" }
      }
    },

    "splitpane-glasspane" :
    {
      style : function(states)
      {
        return {
          zIndex          : 1e7,
          backgroundColor : "#003C74",

          opacity         : states.visible ? 0.2 : 0
        }
      }
    },

    "splitpane-splitter" :
    {
      style : function(states) {
        return {
          backgroundColor : "#E5F4FE",

          cursor          : states.horizontal ? "col-resize" : "row-resize"
        };
      }
    },

    "splitpane-slider" :
    {
      style : function(states)
      {
        return {
          opacity         : 0.5,
          zIndex          : 1e8,

          backgroundColor : states.dragging ? "#003C74" : "#E5F4FE"
        }
      }
    },

    "splitpane-knob" :
    {
      style : function(states)
      {
        return {
          opacity    : states.dragging ? 0.5 : 1.0,
          top        : states.horizontal ? "45%" : null,
          left       : states.horizontal ? null : "45%",
          marginLeft : states.horizontal ? 1 : 0,
          marginTop  : states.horizontal ? 0 : 1,
          cursor     : states.horizontal ? "col-resize" : "row-resize"
        }
      }
    }
  }
});