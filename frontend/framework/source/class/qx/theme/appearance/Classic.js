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

 ************************************************************************ */

/* ************************************************************************

#ignore(auto-use)
#embed(qx.static/image/dotted_white.gif)
#embed(qx.static/image/blank.gif)

 ************************************************************************ */

/**
 * The default qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.appearance.Classic",
{
  title : "Classic",

  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "image" :
    {
      initial : function()
      {
        return {
          allowStretchX : false,
          allowStretchY : false
        };
      }
    },

    "client-document" :
    {
      initial : function()
      {
        return {
          backgroundColor    : "threedface",
          color              : "windowtext",
          hideFocus          : true,
          enableElementFocus : false
        };
      }
    },

    "blocker" :
    {
      initial : function()
      {
        // You could also use: "static/image/dotted_white.gif" for example as backgroundImage here
        // (Visible) background tiles could be dramatically slow down mshtml!
        // A background image or color is always needed for mshtml to block the events successfully.
        return {
          cursor          : "default",
          backgroundImage : "static/image/blank.gif"
        };
      }
    },

    "atom" :
    {
      initial : function()
      {
        return {
          cursor                        : "default",
          spacing                       : 4,
          width                         : "auto",
          height                        : "auto",
          horizontalChildrenAlign       : "center",
          verticalChildrenAlign         : "middle",
          stretchChildrenOrthogonalAxis : false,
          allowStretchY                 : false,
          allowStretchX                 : false
        };
      }
    },

    "label" :
    {
      initial : function()
      {
        return {
          font : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          wrap : false
        };
      },

      state : function(states) {
        return { color : states.disabled ? "graytext" : null };
      }
    },

    "htmlcontainer" :
    {
      extend : "label"
    },

    "popup" :
    {
      initial : function()
      {
        return {
          width  : "auto",
          height : "auto"
        };
      }
    },

    "tool-tip" :
    {
      extend : "popup",

      initial : function()
      {
        return {
          backgroundColor : "InfoBackground",
          color           : "InfoText",
          border          : qx.renderer.border.BorderPresets.getInstance().info,
          paddingTop      : 1,
          paddingRight    : 3,
          paddingBottom   : 2,
          paddingLeft     : 3
        };
      }
    },

    "iframe" :
    {
      initial : function() {
        return { border : qx.renderer.border.BorderPresets.getInstance().inset };
      }
    },




    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      extend : "atom",

      state : function(states)
      {
        var vReturn = {
          backgroundColor : states.abandoned ? "#FFF0C9" : states.over ? "#87BCE5" : "buttonface"
        };

        if (states.pressed || states.checked || states.abandoned)
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().inset;
        }
        else
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().outset;
        }

        if (states.pressed || states.abandoned)
        {
          vReturn.paddingTop = 4;
          vReturn.paddingRight = 3;
          vReturn.paddingBottom = 2;
          vReturn.paddingLeft = 5;
        }
        else
        {
          vReturn.paddingTop = vReturn.paddingBottom = 3;
          vReturn.paddingRight = vReturn.paddingLeft = 4;
        }

        return vReturn;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      initial : function()
      {
        return {
          border          : qx.renderer.border.BorderPresets.getInstance().thinOutset,
          backgroundColor : "threedface",
          height          : "auto"
        };
      }
    },

    "toolbar-part" :
    {
      initial : function() {
        return { width : "auto" };
      }
    },

    "toolbar-part-handle" :
    {
      initial : function() {
        return { width : 10 };
      }
    },

    "toolbar-part-handle-line" :
    {
      initial : function()
      {
        return {
          top    : 2,
          left   : 3,
          bottom : 2,
          width  : 4,
          border : qx.renderer.border.BorderPresets.getInstance().thinOutset
        };
      }
    },

    "toolbar-separator" :
    {
      initial : function() {
        return { width : 8 };
      }
    },

    "toolbar-separator-line" :
    {
      setup : function()
      {
        var b = this.border = new qx.renderer.border.BorderObject;

        b.setLeftColor("threedshadow");
        b.setRightColor("threedhighlight");

        b.setLeftStyle("solid");
        b.setRightStyle("solid");

        b.setLeftWidth(1);
        b.setRightWidth(1);
        b.setTopWidth(0);
        b.setBottomWidth(0);
      },

      initial : function()
      {
        return {
          top    : 2,
          left   : 3,
          width  : 2,
          bottom : 2,
          border : this.border
        };
      }
    },

    "toolbar-button" :
    {
      initial : function()
      {
        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle"
        };
      },

      state : function(states)
      {
        var vReturn =
        {
          backgroundColor : states.abandoned ? "#FFF0C9" : "buttonface",
          backgroundImage : states.checked && !states.over ? "static/image/dotted_white.gif" : null
        };

        if (states.pressed || states.checked || states.abandoned)
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().thinInset;

          vReturn.paddingTop = 3;
          vReturn.paddingRight = 2;
          vReturn.paddingBottom = 1;
          vReturn.paddingLeft = 4;
        }
        else if (states.over)
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().thinOutset;

          vReturn.paddingTop = vReturn.paddingBottom = 2;
          vReturn.paddingLeft = vReturn.paddingRight = 3;
        }
        else
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().none;

          vReturn.paddingTop = vReturn.paddingBottom = 3;
          vReturn.paddingLeft = vReturn.paddingRight = 4;
        }

        return vReturn;
      }
    },




    /*
    ---------------------------------------------------------------------------
      BAR VIEW
    ---------------------------------------------------------------------------
    */

    "bar-view" :
    {
      initial : function()
      {
        return {
          backgroundColor : "#FAFBFE",
          border          : qx.renderer.border.BorderPresets.getInstance().shadow
        };
      }
    },

    "bar-view-pane" :
    {
      state : function(states)
      {
        if (states.barHorizontal)
        {
          return {
            width  : null,
            height : "1*"
          };
        }
        else
        {
          return {
            width  : "1*",
            height : null
          };
        }
      }
    },

    "bar-view-page" :
    {
      initial : function()
      {
        return {
          left   : 10,
          right  : 10,
          top    : 10,
          bottom : 10
        };
      }
    },

    "bar-view-bar" :
    {
      setup : function()
      {
        this.border_top = new qx.renderer.border.BorderObject;
        this.border_top.setBottom(1, "solid", "threedshadow");

        this.border_bottom = new qx.renderer.border.BorderObject;
        this.border_bottom.setTop(1, "solid", "threedshadow");

        this.border_left = new qx.renderer.border.BorderObject;
        this.border_left.setRight(1, "solid", "threedshadow");

        this.border_right = new qx.renderer.border.BorderObject;
        this.border_right.setLeft(1, "solid", "threedshadow");
      },

      initial : function()
      {
        return {
          backgroundColor : "#E1EEFF"
        };
      },

      state : function(states)
      {
        if (states.barTop)
        {
          return {
            paddingTop    : 1,
            paddingRight  : 0,
            paddingBottom : 1,
            paddingLeft   : 0,
            border        : this.border_top,
            height        : "auto",
            width         : null,
            orientation   : "horizontal"
          };
        }
        else if (states.barBottom)
        {
          return {
            paddingTop    : 1,
            paddingRight  : 0,
            paddingBottom : 1,
            paddingLeft   : 0,
            border        : this.border_bottom,
            height        : "auto",
            width         : null,
            orientation   : "horizontal"
          };
        }
        else if (states.barLeft)
        {
          return {
            paddingTop    : 0,
            paddingRight  : 1,
            paddingBottom : 0,
            paddingLeft   : 1,
            border        : this.border_left,
            height        : null,
            width         : "auto",
            orientation   : "vertical"
          };
        }
        else if (states.barRight)
        {
          return {
            paddingTop    : 0,
            paddingRight  : 1,
            paddingBottom : 0,
            paddingLeft   : 1,
            border        : this.border_right,
            height        : null,
            width         : "auto",
            orientation   : "vertical"
          };
        }
      }
    },

    "bar-view-button" :
    {
      extend : "atom",

      setup : function()
      {
        this.border_top_checked = new qx.renderer.border.Border(1, "solid", "threedshadow");
        this.border_top_checked.setBottom(3, "solid", "#FEC83C");

        this.border_bottom_checked = new qx.renderer.border.Border(1, "solid", "threedshadow");
        this.border_bottom_checked.setTop(3, "solid", "#FEC83C");

        this.border_left_checked = new qx.renderer.border.Border(1, "solid", "threedshadow");
        this.border_left_checked.setRight(3, "solid", "#FEC83C");

        this.border_right_checked = new qx.renderer.border.Border(1, "solid", "threedshadow");
        this.border_right_checked.setLeft(3, "solid", "#FEC83C");
      },

      initial : function()
      {
        return {
          iconPosition : "top"
        };
      },

      state : function(states)
      {
        var vReturn =
        {
          backgroundColor : states.checked ? "#FAFBFE" : null,
          allowStretchX   : true,
          allowStretchY   : true
        };

        if (states.checked || states.over)
        {
          if (states.barTop)
          {
            vReturn.border = this.border_top_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 1;
            vReturn.paddingLeft = 6;
          }
          else if (states.barBottom)
          {
            vReturn.border = this.border_bottom_checked;
            vReturn.paddingTop = 1;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 6;
          }
          else if (states.barLeft)
          {
            vReturn.border = this.border_left_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 4;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 6;
          }
          else if (states.barRight)
          {
            vReturn.border = this.border_right_checked;
            vReturn.paddingTop = 3;
            vReturn.paddingRight = 6;
            vReturn.paddingBottom = 3;
            vReturn.paddingLeft = 4;
          }
        }
        else
        {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().none;
          vReturn.paddingTop = vReturn.paddingBottom = 4;
          vReturn.paddingRight = vReturn.paddingLeft = 7;
        }

        if (states.barTop || states.barBottom)
        {
          vReturn.marginTop = vReturn.marginBottom = 0;
          vReturn.marginRight = vReturn.marginLeft = 1;
          vReturn.width = "auto";
          vReturn.height = null;
        }
        else if (states.barLeft || states.barRight)
        {
          vReturn.marginTop = vReturn.marginBottom = 1;
          vReturn.marginRight = vReturn.marginLeft = 0;
          vReturn.height = "auto";
          vReturn.width = null;
        }

        return vReturn;
      }
    },




    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      initial : function()
      {
        return {
          backgroundColor : "threedface",
          color           : "windowtext",
          paddingTop      : 1,
          paddingRight    : 1,
          paddingBottom   : 1,
          paddingLeft     : 1
        };
      },

      state : function(states) {
        return { border : states.maximized ? qx.renderer.border.BorderPresets.getInstance().none : qx.renderer.border.BorderPresets.getInstance().outset };
      }
    },

    "window-captionbar" :
    {
      initial : function()
      {
        return {
          paddingTop            : 1,
          paddingRight          : 2,
          paddingBottom         : 2,
          paddingLeft           : 2,
          verticalChildrenAlign : "middle",
          height                : "auto",
          overflow              : "hidden"
        };
      },

      state : function(states)
      {
        return {
          backgroundColor : states.active ? "activecaption" : "inactivecaption",
          color           : states.active ? "captiontext" : "inactivecaptiontext"
        };
      }
    },

    "window-resize-frame" :
    {
      initial : function() {
        return { border : qx.renderer.border.BorderPresets.getInstance().shadow };
      }
    },

    "window-captionbar-icon" :
    {
      initial : function() {
        return { marginRight : 2 };
      }
    },

    "window-captionbar-title" :
    {
      initial : function()
      {
        return {
          cursor      : "default",
          font        : '11px bold "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          marginRight : 2,
          wrap        : false
        };
      }
    },

    "window-captionbar-button" :
    {
      extend : "button",

      state : function(states)
      {
        var vReturn = {};

        if (states.pressed || states.abandoned)
        {
          vReturn.paddingTop = 2;
          vReturn.paddingRight = 1;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft = 3;
        }
        else
        {
          vReturn.paddingTop = vReturn.paddingBottom = 1;
          vReturn.paddingRight = vReturn.paddingLeft = 2;
        }

        return vReturn;
      }
    },

    "window-captionbar-minimize-button" :
    {
      extend : "window-captionbar-button"
    },

    "window-captionbar-restore-button" :
    {
      extend : "window-captionbar-button"
    },

    "window-captionbar-maximize-button" :
    {
      extend : "window-captionbar-button"
    },

    "window-captionbar-close-button" :
    {
      extend : "window-captionbar-button",

      initial : function() {
        return { marginLeft : 2 };
      }
    },

    "window-statusbar" :
    {
      initial : function()
      {
        return {
          border : qx.renderer.border.BorderPresets.getInstance().thinInset,
          height : "auto"
        };
      }
    },

    "window-statusbar-text" :
    {
      initial : function()
      {
        return {
          paddingTop    : 1,
          paddingRight  : 4,
          paddingBottom : 1,
          paddingLeft   : 4,
          cursor        : "default"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      initial : function() {
        return { border : qx.renderer.border.BorderPresets.getInstance().outset };
      }
    },

    "resizer-frame" :
    {
      initial : function() {
        return { border : qx.renderer.border.BorderPresets.getInstance().shadow };
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      initial : function()
      {
        return {
          width           : "auto",
          height          : "auto",
          backgroundColor : "menu",
          border          : qx.renderer.border.BorderPresets.getInstance().outset,
          paddingTop      : 1,
          paddingRight    : 1,
          paddingBottom   : 1,
          paddingLeft     : 1
        };
      }
    },

    "menu-layout" :
    {
      initial : function()
      {
        return {
          top    : 0,
          right  : 0,
          bottom : 0,
          left   : 0
        };
      }
    },

    "menu-button" :
    {
      initial : function()
      {
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
          allowStretchX         : true
        };
      },

      state : function(states)
      {
        return {
          backgroundColor : states.over ? "highlight" : null,
          color           : states.over ? "highlighttext" : null
        };
      }
    },

    "menu-check-box" :
    {
      extend : "menu-button"
    },

    "menu-radio-button" :
    {
      extend : "menu-button"
    },

    "menu-separator" :
    {
      initial : function()
      {
        return {
          height       : "auto",
          marginTop    : 3,
          marginBottom : 2,
          paddingLeft  : 3,
          paddingRight : 3
        };
      }
    },

    "menu-separator-line" :
    {
      initial : function()
      {
        return {
          right  : 0,
          left   : 0,
          height : "auto",
          border : qx.renderer.border.BorderPresets.getInstance().verticalDivider
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
      initial : function()
      {
        return {
          overflow        : "hidden",
          border          : qx.renderer.border.BorderPresets.getInstance().thinInset,
          backgroundColor : "white"
        };
      }
    },

    "list-item" :
    {
      initial : function()
      {
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
          minWidth                : "auto"
        };
      },

      state : function(states)
      {
        return {
          backgroundColor : states.selected ? "highlight" : null,
          color           : states.selected ? "highlighttext" : null
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIELDS
    ---------------------------------------------------------------------------
    */

    "text-field" :
    {
      initial : function()
      {
        return {
          hideFocus     : true,
          border        : qx.renderer.border.BorderPresets.getInstance().inset,
          paddingTop    : 1,
          paddingRight  : 3,
          paddingBottom : 1,
          paddingLeft   : 3,
          allowStretchY : false,
          allowStretchX : true,
          font          : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          width         : "auto",
          height        : "auto"
        };
      },

      state : function(states) {
        return { color : states.disabled ? "graytext" : null };
      }
    },

    "text-area" :
    {
      extend : "text-field",

      initial : function()
      {
        return {
          overflow     : "auto",

          // gecko automatically defines a marginTop/marginBottom of 1px. We need to reset these values.
          marginTop    : 0,
          marginBottom : 0
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combo-box" :
    {
      initial : function()
      {
        return {
          minWidth        : 40,
          width           : 120,
          height          : "auto",
          border          : qx.renderer.border.BorderPresets.getInstance().inset,
          backgroundColor : "white",
          allowStretchY   : false
        };
      }
    },

    "combo-box-ex" :
    {
      initial : function()
      {
        return {
          width           : "auto",
          height          : "auto",
          border          : qx.renderer.border.BorderPresets.getInstance().inset,
          backgroundColor : "white",
          allowStretchY   : false
        };
      }
    },

    "combo-box-list" :
    {
      extend : "list",

      initial : function()
      {
        return {
          top      : 0,
          right    : 0,
          bottom   : 0,
          left     : 0,
          border   : null,
          overflow : "scrollY"
        };
      }
    },

    "combo-box-ex-list" :
    {
      extend : "list",

      initial : function()
      {
        return {
          statusBarVisible              : false,
          columnVisibilityButtonVisible : false,
          height                        : 'auto',
          maxHeight                     : 150,
          top                           : 0,
          left                          : 0,
          border                        : null
        };
      }
    },

    "combo-box-popup" :
    {
      extend : "list",

      initial : function()
      {
        return {
          height    : "auto",
          maxHeight : 150,
          border    : qx.renderer.border.BorderPresets.getInstance().shadow
        };
      }
    },

    "combo-box-ex-popup" :
    {
      extend : "list",

      initial : function()
      {
        return {
          width  : "auto",
          height : "auto",
          border : qx.renderer.border.BorderPresets.getInstance().shadow
        };
      }
    },

    "combo-box-text-field" :
    {
      extend : "text-field",

      initial : function()
      {
        return {
          border          : qx.renderer.border.BorderPresets.getInstance().none,
          width           : "1*",
          backgroundColor : "transparent"
        };
      }
    },

    "combo-box-ex-text-field" :
    {
      extend : "text-field",

      initial : function()
      {
        return {
          border          : qx.renderer.border.BorderPresets.getInstance().none,
          minWidth        : 30,
          width           : 100,
          backgroundColor : "transparent"
        };
      }
    },

    // Used both for ComboBox and ComboBoxEx
    "combo-box-button" :
    {
      extend : "button",

      initial : function()
      {
        return {
          height        : null,
          allowStretchY : true
        };
      },

      state : function(states)
      {
        return {
          paddingTop    : 0,
          paddingRight  : 3,
          paddingBottom : 0,
          paddingLeft   : 2
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual-focus-indicator" :
    {
    },




    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-element" :
    {
      initial : function()
      {
        return {
          height                : 16,
          verticalChildrenAlign : "middle"
        };
      }
    },

    "tree-element-icon" :
    {
      initial : function()
      {
        return {
          width  : 16,
          height : 16
        };
      }
    },

    "tree-element-label" :
    {
      extend : "label",

      initial : function()
      {
        return {
          cursor        : "default",
          marginLeft    : 3,
          height        : 15,
          paddingTop    : 2,
          paddingRight  : 2,
          paddingBottom : 2,
          paddingLeft   : 2,
          allowStretchY : false
        };
      },

      state : function(states)
      {
        return {
          backgroundColor : states.selected ? "highlight" : null,
          color           : states.selected ? "highlighttext" : null
        };
      }
    },

    "tree-folder" :
    {
      extend : "tree-element"
    },

    "tree-folder-icon" :
    {
      initial : function()
      {
        return {
          width  : 16,
          height : 16
        };
      }
    },

    "tree-folder-label" :
    {
      extend : "tree-element-label"
    },

    "tree" :
    {
      extend : "tree-folder"
    },

    "tree-icon" :
    {
      extend : "tree-folder-icon"
    },

    "tree-label" :
    {
      extend : "tree-folder-label"
    },

    "tree-container" :
    {
      initial : function() {
        return { verticalChildrenAlign : "top" };
      }
    },

    "tree-folder-container" :
    {
      initial : function()
      {
        return {
          height                : "auto",
          verticalChildrenAlign : "top"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      LISTVIEW
    ---------------------------------------------------------------------------
    */

    "list-view" :
    {
      initial : function()
      {
        return {
          cursor   : "default",
          overflow : "hidden"
        };
      }
    },

    "list-view-pane" :
    {
      initial : function()
      {
        return {
          width             : "1*",
          horizontalSpacing : 1,
          overflow          : "hidden"
        };
      }
    },

    "list-view-header" :
    {
      setup : function()
      {
        this.border = new qx.renderer.border.Border;
        this.border.setBottom(1, "solid", "#e2e2e2");
      },

      initial : function()
      {
        return {
          height          : "auto",
          overflow        : "hidden",
          border          : this.border,
          backgroundColor : "#f2f2f2"
        };
      }
    },

    "list-view-header-cell" :
    {
      setup : function()
      {
        this.border_hover = new qx.renderer.border.Border;
        this.border_hover.setBottom(2, "solid", "#F9B119");
      },

      initial : function()
      {
        return {
          overflow      : "hidden",
          paddingTop    : 2,
          paddingRight  : 6,
          paddingBottom : 2,
          paddingLeft   : 6,
          spacing       : 4
        };
      },

      state : function(states)
      {
        if (states.over)
        {
          return {
            backgroundColor : "white",
            paddingBottom   : 0,
            border          : this.border_hover
          };
        }
        else
        {
          return {
            backgroundColor : null,
            paddingBottom   : 2,
            border          : null
          };
        }
      }
    },

    "list-view-header-separator" :
    {
      initial : function()
      {
        return {
          backgroundColor : "#D6D5D9",
          width           : 1,
          marginTop       : 1,
          marginBottom    : 1
        };
      }
    },

    "list-view-content-cell" :
    {
      state : function(states)
      {
        return {
          backgroundColor : states.selected ? "highlight" : null,
          color           : states.selected ? "highlighttext" : null
        };
      }
    },

    "list-view-content-cell-image" :
    {
      extend : "list-view-content-cell",

      initial : function()
      {
        return {
          paddingLeft  : 6,
          paddingRight : 6
        };
      }
    },

    "list-view-content-cell-text" :
    {
      extend : "list-view-content-cell",

      initial : function()
      {
        return {
          overflow     : "hidden",
          paddingLeft  : 6,
          paddingRight : 6,
          font         : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif'
        };
      }
    },

    "list-view-content-cell-html" :
    {
      extend : "list-view-content-cell-text"
    },

    "list-view-content-cell-icon-html" :
    {
      extend : "list-view-content-cell-text"
    },

    "list-view-content-cell-link" :
    {
      extend : "list-view-content-cell-text"
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tab-view" :
    {
      initial : function() {
        return { spacing : -1 };
      }
    },

    "tab-view-bar" :
    {
      initial : function() {
        return { height : "auto" };
      }
    },

    "tab-view-pane" :
    {
      initial : function()
      {
        return {
          height          : "1*",
          backgroundColor : "#FAFBFE",
          border          : "1px solid #91A5BD",
          paddingTop      : 10,
          paddingRight    : 10,
          paddingBottom   : 10,
          paddingLeft     : 10
        };
      }
    },

    "tab-view-page" :
    {
      initial : function()
      {
        return {
          top    : 0,
          right  : 0,
          bottom : 0,
          left   : 0
        };
      }
    },

    "tab-view-button" :
    {
      extend : "atom",

      setup : function()
      {
        this.border_top_normal = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        this.border_top_normal.setBottomWidth(0);

        this.border_top_checked = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        this.border_top_checked.setBottomWidth(0);
        this.border_top_checked.setTop(3, "solid", "#FEC83C");

        this.border_bottom_normal = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        this.border_bottom_normal.setTopWidth(0);

        this.border_bottom_checked = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        this.border_bottom_checked.setTopWidth(0);
        this.border_bottom_checked.setBottom(3, "solid", "#FEC83C");
      },

      state : function(states)
      {
        var vReturn;

        if (states.checked)
        {
          vReturn =
          {
            backgroundColor : "#FAFBFE",
            zIndex          : 1,
            paddingTop      : 2,
            paddingBottom   : 4,
            paddingLeft     : 7,
            paddingRight    : 8,
            border          : states.barTop ? this.border_top_checked : this.border_bottom_checked,
            marginTop       : 0,
            marginBottom    : 0,
            marginRight     : -1,
            marginLeft      : -2
          };

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              vReturn.paddingLeft = 6;
              vReturn.paddingRight = 7;
              vReturn.marginLeft = 0;
            }
          }
          else
          {
            if (states.lastChild)
            {
              vReturn.paddingLeft = 8;
              vReturn.paddingRight = 5;
              vReturn.marginRight = 0;
            }
          }
        }
        else
        {
          vReturn =
          {
            backgroundColor : states.over ? "#FAFBFE" : "#E1EEFF",
            zIndex          : 0,
            paddingTop      : 2,
            paddingBottom   : 2,
            paddingLeft     : 5,
            paddingRight    : 6,
            marginRight     : 1,
            marginLeft      : 0
          };

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              vReturn.paddingLeft = 6;
              vReturn.paddingRight = 5;
            }
          }
          else
          {
            if (states.lastChild)
            {
              vReturn.paddingLeft = 6;
              vReturn.paddingRight = 5;
              vReturn.marginRight = 0;
            }
          }

          if (states.barTop)
          {
            vReturn.border = this.border_top_normal;
            vReturn.marginTop = 3;
            vReturn.marginBottom = 1;
          }
          else
          {
            vReturn.border = this.border_bottom_normal;
            vReturn.marginTop = 1;
            vReturn.marginBottom = 3;
          }
        }

        return vReturn;
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIELDSET
    ---------------------------------------------------------------------------
    */

    "field-set" :
    {
      initial : function() {
        return { backgroundColor : "threedface" };
      }
    },

    "field-set-legend" :
    {
      extend : "atom",

      initial : function()
      {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "threedface",
          paddingRight    : 3,
          paddingLeft     : 4,
          marginRight     : 10
        };
      }
    },

    "field-set-frame" :
    {
      initial : function()
      {
        return {
          top           : 8,
          left          : 2,
          right         : 2,
          bottom        : 2,
          paddingTop    : 12,
          paddingRight  : 9,
          paddingBottom : 12,
          paddingLeft   : 9,
          border        : qx.renderer.border.BorderPresets.getInstance().groove
        };
      }
    },

    "check-box-field-set-legend" :
    {
      extend : "atom",

      initial : function()
      {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "threedface",
          paddingRight    : 3
        };
      }
    },

    "radio-button-field-set-legend" :
    {
      extend : "check-box-field-set-legend"
    },




    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      initial : function()
      {
        return {
          width           : 60,
          height          : 22,
          border          : qx.renderer.border.BorderPresets.getInstance().inset,
          backgroundColor : "white"
        };
      }
    },

    "spinner-field" :
    {
      extend : "text-field",

      initial : function()
      {
        return {
          width  : "1*",
          border : qx.renderer.border.BorderPresets.getInstance().none
        };
      }
    },

    "spinner-button-up" :
    {
      extend : "button",

      initial : function()
      {
        return {
          allowStretchX : false,
          allowStretchY : false,
          height          : "1*",
          width           : 16,
          backgroundColor : new qx.renderer.color.ColorObject("threedface")
        };
      },

      state : function(states)
      {
        return {
          paddingTop    : 0,
          paddingRight  : 0,
          paddingBottom : 0,
          paddingLeft   : 3
        };
      }
    },

    "spinner-button-down" :
    {
      extend : "button",

      initial : function()
      {
        return {
          allowStretchX : false,
          allowStretchY : false,
          height          : "1*",
          width           : 16,
          backgroundColor : new qx.renderer.color.ColorObject("threedface")
        };
      },

      state : function(states)
      {
        return {
          paddingTop    : 1,
          paddingRight  : 0,
          paddingBottom : 0,
          paddingLeft   : 3
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
      initial : function()
      {
        return {
          border : qx.renderer.border.BorderPresets.getInstance().outset,
          width  : "auto",
          height : "auto"
        };
      },

      state : function(states) {}
    },




    /*
    ---------------------------------------------------------------------------
      DATECHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-toolbar-button" :
    {
      initial : function()
      {
        return {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle"
        };
      },

      state : function(states)
      {
        var vReturn =
        {
          backgroundColor : states.abandoned ? "#FFF0C9" : "buttonface",
          backgroundImage : (states.checked && !states.over) ? "static/image/dotted_white.gif" : null
        };

        if (states.pressed || states.checked || states.abandoned) {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().thinInset;
        } else if (states.over) {
          vReturn.border = qx.renderer.border.BorderPresets.getInstance().thinOutset;
        } else {
          vReturn.border = null;
        }

        if (states.pressed || states.checked || states.abandoned)
        {
          vReturn.paddingTop = 2;
          vReturn.paddingRight = 0;
          vReturn.paddingBottom = 0;
          vReturn.paddingLeft = 2;
        }
        else if (states.over)
        {
          vReturn.paddingTop = vReturn.paddingBottom = 1;
          vReturn.paddingLeft = vReturn.paddingRight = 1;
        }
        else
        {
          vReturn.paddingTop = vReturn.paddingBottom = 2;
          vReturn.paddingLeft = vReturn.paddingRight = 2;
        }

        return vReturn;
      }
    },

    "datechooser-monthyear" :
    {
      initial : function()
      {
        return {
          font          : '13px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          textAlign     : "center",
          verticalAlign : "middle"
        };
      }
    },

    "datechooser-datepane" :
    {
      initial : function()
      {
        return {
          border          : "1px solid gray",
          backgroundColor : "window"
        };
      }
    },

    "datechooser-weekday" :
    {
      setup : function()
      {
        this.border = new qx.renderer.border.Border;
        this.border.setBottom(1, "solid", "gray");
      },

      initial : function()
      {
        return {
          border    : this.border,
          font      : '11px bold "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          textAlign : "center"
        };
      },

      state : function(states)
      {
        return {
          color           : states.weekend ? "#6285BA" : "window",
          backgroundColor : states.weekend ? "window" : "#6285BA"
        };
      }
    },

    "datechooser-day" :
    {
      initial : function()
      {
        return {
          cursor        : "default",
          color         : "windowText",
          font          : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          textAlign     : "center",
          verticalAlign : "middle",
          selectable    : false
        };
      },

      state : function(states)
      {
        return {
          border          : states.today ? qx.renderer.border.BorderPresets.getInstance().black : "1px none",
          color           : states.selected ? "highlightText" : states.otherMonth ? "graytext" : "windowText",
          backgroundColor : states.selected ? "highlight" : null
        };
      }
    },

    "datechooser-week" :
    {
      setup : function()
      {
        this.border = new qx.renderer.border.Border;
        this.border.setRight(1, "solid", "gray");

        this.headerBorder = new qx.renderer.border.Border;
        this.headerBorder.setRight(1, "solid", "gray");
        this.headerBorder.setBottom(1, "solid", "gray");
      },

      initial : function()
      {
        return {
          font        : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          color       : "#6285BA",
          paddingLeft : 2
        };
      },

      state : function(states)
      {
        return {
          border : states.header ? this.headerBorder : this.border
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
      setup : function()
      {
        this.border = new qx.renderer.border.Border;
        this.border.setTop(1, "solid", "threedshadow");
      },

      initial : function()
      {
        return {
          font         : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          border       : this.border,
          paddingLeft  : 2,
          paddingRight : 2
        };
      }
    },

    "table-focus-indicator" :
    {
      setup : function()
      {
        this.border = new qx.renderer.border.Border(3, "solid", "#b3d9ff");
        this.blurBorder = new qx.renderer.border.Border(3, "solid", "#c5c8ca");
        this.editingBorder = new qx.renderer.border.Border(2, "solid", "#b3d9ff");
      },

      state : function(states)
      {
        return {
          border : states.editing ? this.editingBorder : (states.tableHasFocus ? this.border : this.blurBorder)
        };
      }
    },

    "table-editor-textfield" :
    {
      initial : function()
      {
        return {
          font          : '11px "Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif',
          border        : qx.renderer.border.BorderPresets.getInstance().none,
          paddingLeft   : 2,
          paddingRight  : 2,
          paddingTop    : 0,
          paddingBottom : 0
        };
      }
    },

    "table-header-cell" :
    {
      setup : function()
      {
        this.border = new qx.renderer.border.Border;
        this.border.set(
        {
          rightColor  : "#d6d2c2",
          rightStyle  : "solid",
          rightWidth  : 1,
          bottomColor : "#d6d2c2",
          bottomStyle : "solid",
          bottomWidth : 2
        });

        this.mouseOverBorder = new qx.renderer.border.Border;
        this.mouseOverBorder.set(
        {
          rightColor  : "#d6d2c2",
          rightStyle  : "solid",
          rightWidth  : 1,
          bottomColor : "#F9B119",
          bottomStyle : "solid",
          bottomWidth : 2
        });
      },

      initial : function()
      {
        return {
          cursor                : "default",
          paddingLeft           : 2,
          paddingRight          : 2,
          spacing               : 2,
          overflow              : "hidden",
          selectable            : false,
          iconPosition          : "right",
          verticalChildrenAlign : "middle"
        };
      },

      state : function(states)
      {
        return {
          backgroundColor : states.mouseover ? "white" : "#ebeadb",
          border          : states.mouseover ? this.mouseOverBorder : this.border
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
      initial : function() {
        return { overflow : "hidden" };
      }
    },

    "splitpane-glasspane" :
    {
      initial : function()
      {
        return {
          zIndex          : 1e7,
          backgroundColor : "threedshadow"
        };
      },

      state : function(states) {
        return { opacity : states.visible ? 0.2 : 0 };
      }
    },

    "splitpane-splitter" :
    {
      initial : function() {
        return { backgroundColor : "threedface" };
      },

      state : function(states) {
        return { cursor : states.horizontal ? "col-resize" : "row-resize" };
      }
    },

    "splitpane-slider" :
    {
      initial : function()
      {
        return {
          opacity : 0.5,
          zIndex  : 1e8
        };
      },

      state : function(states) {
        return { backgroundColor : states.dragging ? "threeddarkshadow" : "threedface" };
      }
    },

    "splitpane-knob" :
    {
      state : function(states)
      {
        var vReturn = { opacity : states.dragging ? 0.5 : 1.0 };

        if (states.horizontal)
        {
          vReturn.top = "33%";
          vReturn.left = null;
          vReturn.marginLeft = -6;
          vReturn.marginTop = 0;
          vReturn.cursor = "col-resize";
        }
        else if (states.vertical)
        {
          vReturn.top = null;
          vReturn.left = "33%";
          vReturn.marginTop = -6;
          vReturn.marginLeft = 0;
          vReturn.cursor = "row-resize";
        }

        return vReturn;
      }
    }
  }
});
