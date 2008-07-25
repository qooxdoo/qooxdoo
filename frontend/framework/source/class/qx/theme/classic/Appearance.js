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

#asset(qx/icon/Oxygen/16/places/folder-open.png)
#asset(qx/icon/Oxygen/16/places/folder.png)
#asset(qx/icon/Oxygen/16/mimetypes/text-plain.png)
#asset(qx/decoration/Classic/*)

************************************************************************* */

/**
 * The classic qooxdoo appearance theme.
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

    "widget" : {},

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : "undefined"
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : "undefined"
        }
      }
    },

    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "root" :
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

    "popup" : "widget",

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "tooltip",
          textColor : "tooltip-text",
          decorator : "tooltip",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 1, 1, 20, 1 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "iframe" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          decorator : "inset"
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "dark-shadow"
        };
      }
    },

    "resize-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "dark-shadow"
        };
      }
    },
    
    
    
    /*
    ---------------------------------------------------------------------------
      DRAG AND DROP CURSORS
    ---------------------------------------------------------------------------
    */
    
    "cursor-dnd-move" :
    {
      style : function(states)
      {
        return {
          source : "decoration/cursors/move.gif"
        };
      }
    },

    "cursor-dnd-copy" :
    {
      style : function(states)
      {
        return {
          source : "decoration/cursors/copy.gif"
        };
      }
    },

    "cursor-dnd-alias" :
    {
      style : function(states)
      {
        return {
          source : "decoration/cursors/alias.gif"
        };
      }
    },

    "cursor-dnd-nodrop" :
    {
      style : function(states)
      {
        return {
          source : "decoration/cursors/nodrop.gif"
        };
      }
    },

    "button" :
    {
      alias : "atom",

      style : function(states)
      {
        if (states.pressed || states.abandoned || states.checked) {
          var decorator = !states.inner && states.focused ? "focused-inset" : "inset";
        } else {
          var decorator = !states.inner && states.focused ? "focused-outset" : "outset";
        }

        if (states.pressed || states.abandoned || states.checked) {
          var padding = [ 4, 3, 2, 5 ];
        } else {
          var padding = [ 3, 4 ];
        }

        return {
          backgroundColor : states.abandoned ? "button-abandoned" : states.hovered ? "button-hovered" : states.checked ? "button-checked" : "button",
          decorator : decorator,
          padding : padding
        };
      }
    },

    "splitbutton" : {},
    "splitbutton/button" : "button",
    "splitbutton/arrow" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.gif"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea/corner" :
    {
      style : function()
      {
        return {
          backgroundColor : "background",
          width : 0, // TODO: dimensions are functional in this case!
          height : 0
        }
      }
    },

    "scrollarea" : "widget",
    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",





    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      alias : "scrollarea",

      style : function(states)
      {
        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          backgroundColor : states.focused ? "background-focused" : "white"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      LIST ITEM
    ---------------------------------------------------------------------------
    */

    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          gap             : 4,
          padding         : states.lead ? [ 2, 4 ] : [ 3, 5 ],
          backgroundColor : states.selected ? "background-selected" : "undefined",
          textColor       : states.selected ? "text-selected" : "undefined",
          decorator       : states.lead ? "lead-item" : "undefined"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

    "textfield" :
    {
      style : function(states)
      {
        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          padding         : [ 2, 3 ],
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : states.disabled ? "background-disabled" : states.focused ? "background-focused" : "background-field"
        };
      }
    },

    "textarea" : "textfield",

    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        var icon;
        if (states.checked && states.focused) {
          icon = "checkbox-checked-focused";
        } else if (states.checked && states.disabled) {
          icon = "checkbox-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "checkbox-checked-pressed";
        } else if (states.checked && states.hovered) {
          icon = "checkbox-checked-hovered";
        } else if (states.checked) {
          icon = "checkbox-checked";
        } else if (states.disabled) {
          icon = "checkbox-disabled";
        } else if (states.focused) {
          icon = "checkbox-focused";
        } else if (states.pressed) {
          icon = "checkbox-pressed";
        } else if (states.hovered) {
          icon = "checkbox-hovered";
        } else {
          icon = "checkbox";
        }

        return {
          icon: "decoration/form/" + icon + ".png",
          gap: 6
        }
      }
    },

    "radiobutton":
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        var icon;
        if (states.checked && states.focused) {
          icon = "radiobutton-checked-focused";
        } else if (states.checked && states.disabled) {
          icon = "radiobutton-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "radiobutton-checked-pressed";
        } else if (states.checked && states.hovered) {
          icon = "radiobutton-checked-hovered";
        } else if (states.checked) {
          icon = "radiobutton-checked";
        } else if (states.disabled) {
          icon = "radiobutton-disabled";
        } else if (states.focused) {
          icon = "radiobutton-focused";
        } else if (states.pressed) {
          icon = "radiobutton-pressed";
        } else if (states.hovered) {
          icon = "radiobutton-hovered";
        } else {
          icon = "radiobutton";
        }

        return {
          icon: "decoration/form/" + icon + ".png"
        }
      }
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
          decorator       : states.focused ? "focused-inset" : "inset",
          textColor       : states.disabled ? "text-disabled" : "undefined"
        };
      }
    },

    "spinner/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : "undefined",
          padding: [2, 3]
        };
      }
    },

    "spinner/upbutton" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/up-small.gif",
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3],
          backgroundColor : states.hovered ? "button-hovered" : "button"
        }
      }
    },

    "spinner/downbutton" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down-small.gif",
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3],
          backgroundColor : states.hovered ? "button-hovered" : "button"
        };
      }
    },






    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background"
        };
      }
    },

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          backgroundColor : "background",
          paddingRight    : 4,
          paddingLeft     : 4,
          marginRight     : 10,
          marginLeft      : 10
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          padding : [ 12, 9 ],
          decorator  : "groove"
        };
      }
    },

    "check-groupbox" : "groupbox",

    "check-groupbox/legend" :
    {
      alias : "checkbox",
      include : "checkbox",

      style : function(states)
      {
        return {
          backgroundColor : "background",
          paddingRight    : 3,
          paddingLeft     : 3,
          marginRight     : 10,
          marginLeft      : 10
        };
      }
    },

    "radio-groupbox" : "groupbox",

    "radio-groupbox/legend" :
    {
      alias : "radiobutton",
      include : "radiobutton",

      style : function(states)
      {
        return {
          backgroundColor : "background",
          paddingRight    : 3,
          paddingLeft     : 3,
          marginRight     : 10,
          marginLeft      : 10
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
          decorator       : "outset-thin",
          backgroundColor : "background"
        };
      }
    },

    "toolbar/part" : {},
    "toolbar/part/container" : {},

    "toolbar/part/handle" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-part-handle",
          width     : 4,
          margin    : [ 3, 2 ]
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          width     : 1, // TODO: functional?
          margin    : [ 3, 2 ],
          decorator : "divider-horizontal"
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        if (states.pressed || states.checked || states.abandoned)
        {
          var border = "inset-thin";
          var padding = [ 3, 2, 1, 4 ];
        }
        else if (states.hovered)
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
          decorator : border,
          padding : padding,
          backgroundColor : states.abandoned ? "button-abandoned" : states.checked ? "background-light" : "button"
        };
      }
    },

    "toolbar-splitbutton" : {},
    "toolbar-splitbutton/button" : "toolbar-button",
    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.gif"
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      SLIDEBAR
    ---------------------------------------------------------------------------
    */

    "slidebar" : {},
    "slidebar/scrollpane" : {},
    "slidebar/content" : {},

    "slidebar/button-forward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/next.gif"
        };
      }
    },

    "slidebar/button-backward" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/left.gif"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview" : {},

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        var marginTop=0, marginRight=0, marginBottom=0, marginLeft=0;

        if (states.barTop) {
          marginBottom = -2;
        } else if (states.barBottom) {
          marginTop = -2;
        } else if (states.barRight) {
          marginLeft = -2;
        } else {
          marginRight = -2;
        }

        return {
          marginBottom : marginBottom,
          marginTop : marginTop,
          marginLeft : marginLeft,
          marginRight : marginRight
        };
      }
    },

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          decorator : "outset",
          padding : 10
        };
      }
    },

    "tabview-page" : {},

    "tabview-page/button" :
    {
      alias : "button",

      style : function(states)
      {
        var decorator = new qx.ui.decoration.Double;
        decorator.setWidth(1);
        decorator.setInnerWidth(1);
        if (states.focused)
        {
          decorator.setColor([ "border-focused-light-shadow", "border-focused-dark", "border-focused-dark", "border-focused-light-shadow" ]);
          decorator.setInnerColor([ "border-focused-light", "border-focused-dark-shadow", "border-focused-dark-shadow", "border-focused-light" ]);
        }
        else
        {
          decorator.setColor([ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ]);
          decorator.setInnerColor([ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]);
        }

        var marginTop=0, marginRight=0, marginBottom=0, marginLeft=0;

        if (states.barTop || states.barBottom) {
          var paddingTop=2, paddingBottom=2, paddingLeft=6, paddingRight=6;
        } else {
          var paddingTop=6, paddingBottom=6, paddingLeft=6, paddingRight=6;
        }

        if (states.barTop)
        {
          decorator.setWidthBottom(0);
          decorator.setInnerWidthBottom(0);
        }
        else if (states.barRight)
        {
          decorator.setWidthLeft(0);
          decorator.setInnerWidthLeft(0);
        }
        else if (states.barBottom)
        {
          decorator.setWidthTop(0);
          decorator.setInnerWidthTop(0);
        }
        else
        {
          decorator.setWidthRight(0);
          decorator.setInnerWidthRight(0);
        }

        if (states.checked)
        {
          if (states.barTop || states.barBottom)
          {
            paddingLeft += 2;
            paddingRight += 2;
          }
          else
          {
            paddingTop += 2;
            paddingBottom += 2;
          }
        }
        else
        {
          if (states.barTop || states.barBottom)
          {
            marginBottom += 2;
            marginTop += 2;
          }
          else if (states.barLeft || states.barRight)
          {
            marginRight += 2;
            marginLeft += 2;
          }
        }

        if (states.checked)
        {
          if (!states.firstTab)
          {
            if (states.barTop || states.barBottom) {
              marginLeft = -4;
            } else {
              marginTop = -4;
            }
          }

          if (!states.lastTab)
          {
            if (states.barTop || states.barBottom) {
              marginRight = -4;
            } else {
              marginBottom = -4;
            }
          }
        }

        return {
          zIndex : states.checked ? 10 : 5,
          backgroundColor : "background",
          decorator : decorator,
          iconPosition : states.barLeft || states.barRight ? "top" : "left",
          padding : [ paddingTop, paddingRight, paddingBottom, paddingLeft ],
          margin : [ marginTop, marginRight, marginBottom, marginLeft ]
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar" : {},

    "scrollbar/slider" :
    {
      alias : "slider",

      style : function(states)
      {
        return {
          backgroundColor : "background-light"
        }
      }
    },

    "scrollbar/button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        var padding;
        if (states.up || states.down)
        {
          if (states.pressed || states.abandoned || states.checked) {
            padding = [ 5, 2, 3, 4 ];
          } else {
            padding = [ 4, 3 ];
          }
        }
        else
        {
          if (states.pressed || states.abandoned || states.checked) {
            padding = [ 4, 3, 2, 5 ];
          } else {
            padding = [ 3, 4 ];
          }
        }

        var icon = "decoration/arrows/";
        if (states.left) {
          icon += "left.gif";
        } else if (states.right) {
          icon += "right.gif";
        } else if (states.up) {
          icon += "up.gif";
        } else {
          icon += "down.gif";
        }

        return {
          padding : padding,
          icon : icon
        }
      }
    },

    "scrollbar/button-begin" : "scrollbar/button",
    "scrollbar/button-end" : "scrollbar/button",




    /*
    ---------------------------------------------------------------------------
      SLIDER
    ---------------------------------------------------------------------------
    */

    "slider" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background-light",
          decorator : states.focused ? "focused-inset" : "inset"
        }
      }
    },

    "slider/knob" :
    {
      include : "button",

      style : function(states)
      {
        return {
          width: 14,
          height: 14,
          decorator : "outset"
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "folder-open-button" :
    {
      style : function(states)
      {
        return {
          source : states.opened ? "decoration/tree/minus.gif" : "decoration/tree/plus.gif"
        };
      }
    },


    "tree-folder" :
    {
      style : function(states)
      {
        return {
          padding : [2, 3, 2, 0],
          icon : "icon/16/places/folder-open.png",
          iconOpened : "icon/16/places/folder.png"
        };
      }
    },

    "tree-folder-icon" :
    {
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 0]
        };
      }
    },

    "tree-folder-label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 2 ],
          backgroundColor : states.selected ? "background-selected" : "undefined",
          textColor : states.selected ? "text-selected" : "undefined"
        };
      }
    },

    "tree-file" :
    {
      include : "tree-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        };
      }
    },

    "tree-file-icon" : "tree-folder-icon",
    "tree-file-label" : "tree-folder-label",

    "tree" :
    {
      include : "list",
      alias : "list",

      style : function(states)
      {
        return {
          contentPadding : [4, 4, 4, 4]
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
          decorator : states.maximized ? "undefined" : "outset"
        };
      }
    },

    "window/pane" : {},

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          padding : 1,
          backgroundColor : states.active ? "window-active-caption" : "window-inactive-caption",
          textColor : states.active ? "window-active-caption-text" : "window-inactive-caption-text"
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          marginRight : 4
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "bold",
          marginRight : 20,
          alignY: "middle"
        };
      }
    },

    "window/minimize-button" :
    {
      include : "button",
      alias : "button",

      style : function(states)
      {
        return {
          icon : "decoration/window/minimize.gif",
          padding : states.pressed || states.abandoned ? [ 2, 1, 0, 3] : [ 1, 2 ]
        };
      }
    },

    "window/restore-button" :
    {
      include : "button",
      alias : "button",

      style : function(states)
      {
        return {
          icon : "decoration/window/restore.gif",
          padding : states.pressed || states.abandoned ? [ 2, 1, 0, 3] : [ 1, 2 ]
        };
      }
    },

    "window/maximize-button" :
    {
      include : "button",
      alias : "button",

      style : function(states)
      {
        return {
          icon : "decoration/window/maximize.gif",
          padding : states.pressed || states.abandoned ? [ 2, 1, 0, 3] : [ 1, 2 ]
        };
      }
    },

    "window/close-button" :
    {
      include : "button",
      alias : "button",

      style : function(states)
      {
        return {
          marginLeft : 2,
          icon : "decoration/window/close.gif",
          padding : states.pressed || states.abandoned ? [ 2, 1, 0, 3] : [ 1, 2 ]
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          padding : [ 2, 6 ]
        };
      }
    },

    "window/statusbar-text" : "label",




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
          decorator : "outset"
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" : {},

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 5 : "undefined",
          height : states.vertical ? 5 : "undefined",
          backgroundColor : states.active ? "border-dark-shadow" : "border-dark"
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 5 : "undefined",
          height : states.vertical ? 5 : "undefined",
          backgroundColor : "border-dark-shadow"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    "selectbox" : "button",
    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",
    "selectbox/list" : "list",

    "selectbox/arrow" :
    {
      style : function(states)
      {
        return {
          source : "decoration/arrows/down.gif",
          paddingRight : 4,
          paddingLeft : 5
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combobox" :
    {
      style : function(states)
      {
        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : "background-field"
        };
      }
    },

    "combobox/button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.gif",
          backgroundColor : states.hovered ? "button-hovered" : "button"
        };
      }
    },

    "combobox/popup" : "popup",
    "combobox/list" : "list",

    "combobox/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : "undefined",
          padding: [2, 3]
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
        var result =
        {
          backgroundColor : "background",
          decorator : "outset",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4,
          padding : 1
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offsetLeft = result.offsetRight = -3;
          result.offsetTop = result.offsetBottom = -2;
        }

        return result;
      }
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height : 0,
          decorator : "menu-separator",
          marginTop : 4,
          marginBottom: 4,
          marginLeft : 2,
          marginRight : 2
        }
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          backgroundColor : states.selected ? "background-selected" : "undefined",
          textColor : states.selected ? "text-selected" : "undefined",
          padding : [ 2, 6 ]
        };
      }
    },

    "menu-button/icon" :
    {
      include : "image",

      style : function(states)
      {
        return {
          alignY : "middle"
        };
      }
    },

    "menu-button/label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          padding : 1
        };
      }
    },

    "menu-button/shortcut" :
    {
      include : "label",

      style : function(states)
      {
        return {
          alignY : "middle",
          marginLeft : 14,
          padding : 1
        };
      }
    },

    "menu-button/arrow" :
    {
      style : function(states)
      {
        return {
          source : states.selected ? "decoration/arrows/right-invert.gif" : "decoration/arrows/right.gif",
          alignY : "middle"
        };
      }
    },

    "menu-checkbox" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? "undefined" :
            states.selected ? "decoration/menu/checkbox-invert.gif" :
              "decoration/menu/checkbox.gif"
        }
      }
    },

    "menu-radiobutton" :
    {
      alias : "menu-button",
      include : "menu-button",

      style : function(states)
      {
        return {
          icon : !states.checked ? "undefined" :
            states.selected ? "decoration/menu/radiobutton-invert.gif" :
              "decoration/menu/radiobutton.gif"
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : new qx.ui.decoration.Single().set({ top : [ 1, "solid", "border-dark-shadow" ] }),
          paddingLeft : 2,
          paddingRight : 2
        };
      }
    },

    "table-header":
    {
      style : function(states)
      {
        return {
          decoration : new qx.ui.decoration.Single().set({ bottom : [ 1, "solid", "table-header-border" ] }),
          backgroundColor : "table-header"
        };
      }
    },

    "table/column-button" :
    {
      alias : "button",
      style : function(states)
      {
        var border, padding;

        if (states.pressed || states.checked || states.abandoned)
        {
          border = "inset-thin";
          padding = [ 3, 2, 1, 4 ];
        }
        else if (states.hovered)
        {
          border = "outset-thin";
          padding = [ 2, 3 ];
        }
        else
        {
          border = "undefined";
          padding = [ 3, 4 ];
        }

        return {
          decorator : border,
          padding : padding,
          backgroundColor : states.abandoned ? "button-abandoned" : "button",
          icon : "decoration/table/select-column-order.png"
        };
      }
    },

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller" : "widget",

    "table-scroller/header":
    {
      style : function(states)
      {
        return {
          decorator : new qx.ui.decoration.Single().set({
            bottom : [ 1, "solid", "table-header-border" ]
          }),
          backgroundColor : "table-header"
        };
      }
    },

    "table-scroller/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "table-pane"
        };
      }
    },

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : new qx.ui.decoration.Single(2, "solid", "table-focus-indicator")
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "#D6D5D9",
          width: 3
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {

        if (states.hovered)
        {
          deco = new qx.ui.decoration.Single().set({
            right : [ 1, "solid", "table-header-border" ],
            bottom : [ 2, "solid", "effect" ]
          });

          paddingBottom = 0;
          backgroundColor = "table-header-cell-hover";
        }
        else
        {
          deco = new qx.ui.decoration.Single().set({
            right : [ 1, "solid", "table-header-border" ]
          });

          paddingBottom = 2;
          backgroundColor = "table-header-cell";
        }

        return {
          paddingLeft : 2,
          paddingRight : 2,
          paddingBottom : paddingBottom,
          decorator : deco,
          backgroundColor : backgroundColor,
          sortIcon : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : "undefined"
        }
      }
    },

    "table-header-cell/sort-icon" : {
      style : function(states)
      {
        return {
          alignY : "middle"
        }
      }
    }
  }
});
