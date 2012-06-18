/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de
"border"
   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Oxygen/16/apps/office-calendar.png)
#asset(qx/icon/Oxygen/16/places/folder-open.png)
#asset(qx/icon/Oxygen/16/places/folder.png)
#asset(qx/icon/Oxygen/16/mimetypes/text-plain.png)
#asset(qx/icon/Oxygen/16/actions/view-refresh.png)
#asset(qx/icon/Oxygen/16/actions/window-close.png)
#asset(qx/icon/Oxygen/16/actions/dialog-cancel.png)
#asset(qx/icon/Oxygen/16/actions/dialog-ok.png)

#asset(qx/decoration/Classic/*)

************************************************************************* */

/**
 * The classic qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.classic.Appearance",
{
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
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : undefined
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

    "popup" :
    {
      style : function(states)
      {
        return {
          decorator : "main",
          backgroundColor : "background-pane",
          shadow : "shadow-small"
        }
      }
    },

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "tooltip",
          textColor : "tooltip-text",
          decorator : "tooltip",
          shadow : "shadow-small",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 15, 5, 5, 5 ]
        };
      }
    },

    "tooltip/atom" : "atom",

    "tooltip-error" :
    {
      include : "tooltip",

      style : function(states)
      {
        return {
          textColor: "text-selected",
          showTimeout: 100,
          hideTimeout: 10000,
          decorator: "tooltip-error",
          font: "bold",
          backgroundColor: "tooltip-invalid"
        };
      }
    },

    "tooltip-error/atom" : "atom",

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
          decorator : "main"
        };
      }
    },

    "resize-frame" : "move-frame",

    "dragdrop-cursor" :
    {
      style : function(states)
      {
        var icon = "nodrop";

        if (states.copy) {
          icon = "copy";
        } else if (states.move) {
          icon = "move";
        } else if (states.alias) {
          icon = "alias";
        }

        return {
          source : "decoration/cursors/" + icon + ".gif",
          position : "right-top",
          offset : [ 2, 16, 2, 6 ]
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        if (states.pressed || states.abandoned || states.checked) {
          var decorator = !states.inner && states.focused ? "focused-inset" : "inset";
          var padding = [ 4, 3, 2, 5 ];
        } else {
          var decorator = !states.inner && states.focused ? "focused-outset" : "outset";
          var padding = [ 3, 4 ];
        }

        return {
          backgroundColor : states.abandoned ? "button-abandoned" : states.hovered ? "button-hovered" : states.checked ? "button-checked" : "button",
          decorator : decorator,
          padding : padding
        };
      }
    },

    "button" :
    {
      alias : "button-frame",
      include : "button-frame",

      style : function(states)
      {
        return {
          center : true
        };
      }
    },

    "hover-button" :
    {
      alias : "atom",
      include : "atom",

      style : function(states)
      {
        return {
          backgroundColor : states.hovered ? "background-selected" : undefined,
          textColor : states.hovered ? "text-selected" : undefined
        }
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
          backgroundColor : "background"
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
        var backgroundColor;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (invalid && !disabled) {
          backgroundColor = "background-invalid";
        } else if (focused && !invalid && !disabled) {
          backgroundColor = "background-focused";
        } else if (disabled) {
          backgroundColor = "background-disabled";
        } else {
          backgroundColor = "white";
        }

        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          backgroundColor : backgroundColor
        };
      }
    },

    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          gap             : 4,
          padding         : states.lead ? [ 2, 4 ] : [ 3, 5 ],
          backgroundColor : states.selected ? "background-selected" : undefined,
          textColor       : states.selected ? "text-selected" : undefined,
          decorator       : states.lead ? "lead-item" : undefined
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */
    "form-renderer-label" : {
      include : "label",
      style : function() {
        return {
          paddingTop: 4
        };
      }
    },

    "textfield" :
    {
      style : function(states)
      {
        var backgroundColor;

        var focused = !!states.focused;
        var invalid = !!states.invalid;
        var disabled = !!states.disabled;

        if (invalid && !disabled) {
          backgroundColor = "background-invalid";
        } else if (focused && !invalid && !disabled) {
          backgroundColor = "background-focused";
        } else if (disabled) {
          backgroundColor = "background-disabled";
        } else {
          backgroundColor = "background-field";
        }

        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }

        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          padding         : [ 2, 3 ],
          textColor       : textColor,
          backgroundColor : backgroundColor
        };
      }
    },

    "textarea" : "textfield",

    "checkbox":
    {
      alias : "atom",

      style : function(states)
      {
        // The "disabled" icon is set to an icon **without** the -disabled
        // suffix on purpose. This is because the Image widget handles this
        // already by replacing the current image with a disabled version
        // (if available). If no disabled image is found, the opacity style
        // is used.
        var icon;

        // Checked
        if (states.checked) {
          if (states.disabled) {
            icon = "checkbox-checked";
          } else if (states.focused) {
            icon = "checkbox-checked-focused";
          } else if (states.pressed) {
            icon = "checkbox-checked-pressed";
          } else if (states.hovered) {
            icon = "checkbox-checked-hovered";
          } else {
            icon = "checkbox-checked";
          }

        // Undetermined
        } else if (states.undetermined) {
          if (states.disabled) {
            icon = "checkbox-undetermined";
          } else if (states.focused) {
            icon = "checkbox-undetermined-focused";
          } else if (states.hovered) {
            icon = "checkbox-undetermined-hovered";
          } else {
            icon = "checkbox-undetermined";
          }

        // Focused & Pressed & Hovered (when enabled)
        } else if (!states.disabled) {
          if (states.focused) {
            icon = "checkbox-focused";
          } else if (states.pressed) {
            icon = "checkbox-pressed";
          } else if (states.hovered ) {
            icon = "checkbox-hovered";
          }
        }

        // Unchecked
        icon = icon || "checkbox";

        var invalid = states.invalid && !states.disabled ? "-invalid" : "";

        return {
          icon: "decoration/form/" + icon + invalid + ".png",
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
        // "disabled" state is not handled here with purpose. The image widget
        // does handle this already by replacing the current image with a
        // disabled version (if available). If no disabled image is found the
        // opacity style is used.
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
        } else if (states.focused) {
          icon = "radiobutton-focused";
        } else if (states.pressed) {
          icon = "radiobutton-pressed";
        } else if (states.hovered) {
          icon = "radiobutton-hovered";
        } else {
          icon = "radiobutton";
        }

        var invalid = states.invalid && !states.disabled ? "-invalid" : "";

        return {
          icon: "decoration/form/" + icon + invalid + ".png",
          shadow: undefined
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
          decorator : states.focused ? "focused-inset" : "inset",
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "spinner/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
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
      DATEFIELD
    ---------------------------------------------------------------------------
    */

    "datefield" : "combobox",

    "datefield/button" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "icon/16/apps/office-calendar.png",
          padding : [0, 3],
          backgroundColor : undefined,
          decorator : undefined
        };
      }
    },

    "datefield/list" :
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states)
      {
        return {
          decorator: states.focused ? "focused-inset" : "inset"
        }
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
          textColor : states.invalid ? "invalid" : undefined,
          padding   : [1, 0, 1, 4]
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          padding : [ 12, 9 ],
          marginTop: 10,
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
          textColor : states.invalid ? "invalid" : undefined,
          padding   : [1, 0, 1, 4]
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
          textColor : states.invalid ? "invalid" : undefined,
          padding   : [1, 0, 1, 4]
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
          backgroundColor : "background",
          padding   : [ 0, 1 ],
          margin    : [ 3, 2 ],
          allowGrowY : true
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          margin    : [ 3, 2 ],
          decorator : "toolbar-separator"
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
        else if (states.hovered && !states.disabled)
        {
          var border = "outset-thin";
          var padding = [ 2, 3 ];
        }
        else
        {
          var border = undefined;
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

    "toolbar-menubutton" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          showArrow : true
        };
      }
    },

    "toolbar-menubutton/arrow" :
    {
      alias : "image",
      include : "image",

      style : function(states)
      {
        return {
          source : "decoration/arrows/down-small.gif"
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
          icon : states.vertical ?
            "decoration/arrows/down.gif" :
            "decoration/arrows/next.gif"
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
          icon : states.vertical ?
            "decoration/arrows/up.gif" :
           "decoration/arrows/left.gif"
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


    "tabview/bar/button-forward" :
    {
      include : "slidebar/button-forward",
      alias : "slidebar/button-forward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          }
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          }
        }
      }
    },

    "tabview/bar/button-backward" :
    {
      include : "slidebar/button-backward",
      alias : "slidebar/button-backward",

      style : function(states)
      {
        if (states.barTop || states.barBottom)
        {
          return {
            marginTop : 2,
            marginBottom: 2
          }
        }
        else
        {
          return {
            marginLeft : 2,
            marginRight : 2
          }
        }
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

    "tabview-page" : "widget",

    "tabview-page/button" :
    {
      style : function(states)
      {
        var decorator;
        var marginTop=0, marginRight=0, marginBottom=0, marginLeft=0;

        if (states.barTop || states.barBottom) {
          var paddingTop=2, paddingBottom=2, paddingLeft=6, paddingRight=6;
        } else {
          var paddingTop=6, paddingBottom=6, paddingLeft=6, paddingRight=6;
        }

        if (states.barTop)
        {
          decorator = "tabview-page-button-top";
        }
        else if (states.barRight)
        {
          decorator = "tabview-page-button-right";
        }
        else if (states.barBottom)
        {
          decorator = "tabview-page-button-bottom";
        }
        else
        {
          decorator = "tabview-page-button-left";
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
          decorator : decorator,
          backgroundColor : "background",
          padding : [ paddingTop, paddingRight, paddingBottom, paddingLeft ],
          margin : [ marginTop, marginRight, marginBottom, marginLeft ],
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "tabview-page/button/label" :
    {
      alias : "label",

      style : function(states)
      {
        return {
          padding : [0, 1, 0, 1],
          margin : states.focused ? 0 : 1,
          decorator : states.focused ? "keyboard-focus" : undefined
        };
      }
    },

    "tabview-page/button/icon" : "image",
    "tabview-page/button/close-button" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          icon : "qx/icon/Oxygen/16/actions/window-close.png"
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

    "scrollbar/slider/knob" :
    {
      include : "button-frame",

      style : function(states)
      {
        return {
          height    : 14,
          width     : 14,

          minHeight : states.horizontal ? undefined : 9,
          minWidth  : states.horizontal ? 9 : undefined
        };
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
        var backgroundColor;

        if (states.disabled) {
          backgroundColor = "background-disabled";
        } else if (states.invalid) {
          backgroundColor = "background-invalid";
        } else if (states.focused) {
          backgroundColor = "background-light";
        } else {
          backgroundColor = "background-field";
        }

        return {
          backgroundColor :  backgroundColor,
          decorator : states.focused ? "focused-inset" : "inset"
        }
      }
    },

    "slider/knob" :
    {
      include : "button-frame",

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

    "tree-folder/open" :
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
          icon : states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png",
          iconOpened : "icon/16/places/folder-open.png"
        };
      }
    },

    "tree-folder/icon" :
    {
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 0]
        };
      }
    },

    "tree-folder/label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 2 ],
          backgroundColor : states.selected ? "background-selected" : undefined,
          textColor : states.selected ? "text-selected" : undefined
        };
      }
    },

    "tree-file" :
    {
      include : "tree-folder",
      alias : "tree-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        };
      }
    },

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
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        }
      }
    },

    "treevirtual-folder" :
    {
      style : function(states)
      {
        return {
          icon : (states.opened
                  ? "icon/16/places/folder-open.png"
                  : "icon/16/places/folder.png")
        }
      }
    },

    "treevirtual-file" :
    {
      include : "treevirtual-folder",
      alias : "treevirtual-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        }
      }
    },

    "treevirtual-line" :
    {
      style : function(states)
      {
        return {
          icon       : "decoration/treevirtual/line.gif"
        }
      }
    },

    "treevirtual-contract" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/tree/minus.gif"
        }
      }
    },

    "treevirtual-expand" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/tree/plus.gif"
        }
      }
    },

    "treevirtual-only-contract" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/only_minus.gif"
        }
      }
    },

    "treevirtual-only-expand" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/only_plus.gif"
        }
      }
    },

    "treevirtual-start-contract" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/start_minus.gif"
        }
      }
    },

    "treevirtual-start-expand" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/start_plus.gif"
        }
      }
    },

    "treevirtual-end-contract" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/end_minus.gif"
        }
      }
    },

    "treevirtual-end-expand" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/end_plus.gif"
        }
      }
    },

    "treevirtual-cross-contract" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/cross_minus.gif"
        }
      }
    },

    "treevirtual-cross-expand" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/cross_plus.gif"
        }
      }
    },


    "treevirtual-end" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/end.gif"
        }
      }
    },

    "treevirtual-cross" :
    {
      style : function(states)
      {
        return {
          icon        : "decoration/treevirtual/cross.gif"
        }
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
          contentPadding : [ 10, 10, 10, 10 ],
          backgroundColor : "background",
          decorator : states.maximized ? undefined : "outset",
          shadow : states.maximized ? undefined : "shadow-small"
        };
      }
    },

    "window-resize-frame" : "resize-frame",

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
          backgroundColor : "background"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : states.horizontal ? "decoration/splitpane/knob-horizontal.png" : "decoration/splitpane/knob-vertical.png",
          padding : 2
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "border-dark",
          opacity : 0.3
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SELECTBOX
    ---------------------------------------------------------------------------
    */

    "selectbox" :
    {
      include: "button-frame",

      style : function(states)
      {
        var background = "button";
        if (states.invalid && !states.disabled) {
          background = "background-invalid";
        } else if (states.abandoned) {
          background = "button-abandoned";
        } else if (!states.abandoned && states.hovered) {
          background = "button-hovered";
        } else if (!states.abandoned && !states.hovered && states.checked) {
          background = "button-checked";
        }

        return {
          backgroundColor : background
        };
      }
    },

    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",
    "selectbox/list" : "list",

    "selectbox/arrow" :
    {
      include : "image",

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
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser" :
    {
      style : function(states)
      {
        return {
          decorator : "outset"
        }
      }
    },

    "datechooser/navigation-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "date-chooser",
          textColor : states.disabled ? "text-disabled" : states.invalid ? "invalid" : undefined,
          padding : [2, 10]
        };
      }
    },

    "datechooser/last-year-button-tooltip" : "tooltip",
    "datechooser/last-month-button-tooltip" : "tooltip",
    "datechooser/next-year-button-tooltip" : "tooltip",
    "datechooser/next-month-button-tooltip" : "tooltip",

    "datechooser/last-year-button"  : "datechooser/button",
    "datechooser/last-month-button" : "datechooser/button",
    "datechooser/next-year-button"  : "datechooser/button",
    "datechooser/next-month-button" : "datechooser/button",
    "datechooser/button/icon" : {},

    "datechooser/button" :
    {
      style : function(states)
      {
        var result = {
          width  : 17,
          show   : "icon"
        };

        if (states.lastYear) {
          result.icon = "decoration/arrows/rewind.gif";
        } else if (states.lastMonth) {
          result.icon = "decoration/arrows/left.gif";
        } else if (states.nextYear) {
          result.icon = "decoration/arrows/forward.gif";
        } else if (states.nextMonth) {
          result.icon = "decoration/arrows/right.gif";
        }

        if (states.pressed || states.checked || states.abandoned) {
          result.decorator = "inset-thin";
        } else if (states.hovered) {
          result.decorator = "outset-thin";
        } else {
          result.decorator = undefined;
        }

        if (states.pressed || states.checked || states.abandoned) {
          result.padding = [ 2, 0, 0, 2 ];
        } else if (states.hovered) {
          result.padding = 1;
        } else {
          result.padding = 2;
        }

        return result;
      }
    },

    "datechooser/month-year-label" :
    {
      style : function(states)
      {
        return {
          font          : "bold",
          textAlign     : "center"
        };
      }
    },

    "datechooser/date-pane" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-date-pane",
          backgroundColor : "date-chooser"
        };
      }
    },

    "datechooser/weekday" :
    {
      style : function(states)
      {
        return {
          decorator       : "datechooser-weekday",
          font            : "bold",
          textAlign       : "center",
          textColor       : states.disabled ? "text-disabled" : states.weekend ? "date-chooser-title" : "date-chooser",
          backgroundColor : states.weekend ? "date-chooser" : "date-chooser-title"
        };
      }
    },

    "datechooser/day" :
    {
      style : function(states)
      {
        return {
          textAlign       : "center",
          decorator       : states.today ? "main" : undefined,
          textColor       : states.disabled ? "text-disabled" : states.selected ? "text-selected" : states.otherMonth ? "text-disabled" : undefined,
          backgroundColor : states.disabled ? undefined : states.selected ? "date-chooser-selected" : undefined,
          padding         : [ 2, 4 ]
        };
      }
    },

    "datechooser/week" :
    {
      style : function(states)
      {
        return {
          textAlign : "center",
          textColor : "date-chooser-title",
          padding   : [ 2, 4 ],
          decorator : states.header ? "datechooser-week-header" : "datechooser-week"
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
        var backgroundColor;

        if (states.disabled) {
          backgroundColor = "background-disabled";
        } else if (states.invalid) {
          backgroundColor = "background-invalid";
        } else if (states.focused) {
          backgroundColor = "background-focused";
        } else {
          backgroundColor = "background-field";
        }

        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          textColor       : states.disabled ? "text-disabled" : undefined,
          backgroundColor : backgroundColor
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
          decorator : undefined,
          padding: [2, 3],
          backgroundColor: undefined
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
          shadow : "shadow-small",
          decorator : "outset",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4,
          padding : 1,
          placementModeY : states.submenu || states.contextmenu ? "best-fit" : "keep-align"
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
        }

        if (states.contextmenu) {
          result.offset = 4;
        }

        return result;
      }
    },

    "menu/slidebar" : "menu-slidebar",

    "menu-slidebar" : "widget",

    "menu-slidebar-button" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.hovered  ? "background-selected" : undefined,
          padding : 6,
          center : true
        };
      }
    },

    "menu-slidebar/button-backward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/up-invert.gif" : "decoration/arrows/up.gif"
        };
      }
    },

    "menu-slidebar/button-forward" :
    {
      include : "menu-slidebar-button",

      style : function(states)
      {
        return {
          icon : states.hovered ? "decoration/arrows/down-invert.gif" : "decoration/arrows/down.gif"
        };
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
          backgroundColor : states.selected ? "background-selected" : undefined,
          textColor : states.selected ? "text-selected" : undefined,
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
      include : "image",

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
          icon : !states.checked ? undefined :
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
          icon : !states.checked ? undefined :
            states.selected ? "decoration/menu/radiobutton-invert.gif" :
              "decoration/menu/radiobutton.gif"
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    "menubar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          decorator       : "outset"
        };
      }
    },

    "menubar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding : [ 2, 6 ],
          backgroundColor : states.pressed || states.hovered ? "background-selected" : undefined,
          textColor : states.pressed || states.hovered ? "text-selected" : undefined
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" : "widget",
    "colorselector/control-bar" : "widget",
    "colorselector/visual-pane" : "groupbox",
    "colorselector/control-pane": "widget",
    "colorselector/preset-grid" : "widget",

    "colorselector/colorbucket":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          width : 16,
          height : 16
        }
      }
    },

    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        }
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 12
        }
      }
    },

    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    "colorselector/preview-content-old":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          width : 50,
          height : 10
        }
      }
    },

    "colorselector/preview-content-new":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          backgroundColor : "white",
          width : 50,
          height : 10
        }
      }
    },

    "colorselector/hue-saturation-field":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          margin : 5
        }
      }
    },

    "colorselector/brightness-field":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          margin : [5, 7]
        }
      }
    },

    "colorselector/hue-saturation-pane": "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane": "widget",
    "colorselector/brightness-handle" : "widget",







    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" : "widget",

    "table/statusbar" :
    {
      style : function(states)
      {
        return {
          decorator : "table-statusbar",
          paddingLeft : 2,
          paddingRight : 2
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
          border = undefined;
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

    "table-column-reset-button" :
    {
      extend : "menu-button",
      alias : "menu-button",

      style : function()
      {
        return {
          icon : "icon/16/actions/view-refresh.png"
        }
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
          decorator : "table-scroller-header",
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
          decorator : "table-scroller-focus-indicator"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "table-header-border",
          width: 3
        };
      }
    },

    "table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          minWidth: 13,
          paddingLeft : 2,
          paddingRight : 2,
          paddingBottom : states.hovered ? 0 : 2,
          decorator : states.hovered ? "table-header-cell-hovered" : "table-header-cell",
          backgroundColor : states.hovered ? "table-header-cell-hover" : "table-header-cell",
          sortIcon : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : undefined
        }
      }
    },

    "table-header-cell/icon" : {
      style : function(states)
      {
        return {
          marginRight: 4,
          opacity : states.disabled ? 0.3 : 1
        }
      }
    },

    "table-header-cell/sort-icon" : {
      style : function(states)
      {
        return {
          alignY : "middle",
          opacity : states.disabled ? 0.3 : 1
        }
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : undefined,
          padding : [ 2, 2 ]
        };
      }
    },

    "table-editor-selectbox" :
    {
      include : "selectbox",
      alias : "selectbox",

      style : function(states)
      {
        return {
          padding : [ 0, 2 ]
        };
      }
    },

    "table-editor-combobox" :
    {
      include : "combobox",
      alias : "combobox",

      style : function(states)
      {
        return {
          decorator : undefined
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */


    "colorpopup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          decorator : "outset",
          padding : 5,
          backgroundColor : "background"
        }
      }
    },

    "colorpopup/field":
    {
      style : function(states)
      {
        return {
          decorator : "inset-thin",
          margin : 2,
          width : 14,
          height : 14,
          backgroundColor : "background"
        }
      }
    },

    "colorpopup/selector-button" : "button",
    "colorpopup/auto-button" : "button",

    "colorpopup/preview-pane" : "groupbox",

    "colorpopup/current-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginLeft : 4,
          decorator : "inset-thin",
          allowGrowX : true
        }
      }
    },

    "colorpopup/selected-preview":
    {
      style : function(state)
      {
        return {
          height : 20,
          padding: 4,
          marginRight : 4,
          decorator : "inset-thin",
          allowGrowX : true
        }
      }
    },

    "colorpopup/colorselector-okbutton":
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-ok.png"
        };
      }
    },

    "colorpopup/colorselector-cancelbutton":
   {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "icon/16/actions/dialog-cancel.png"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */
    "virtual-list" : "list",
    "virtual-list/row-layer" : "row-layer",

    "row-layer" : "widget",
    "column-layer" : "widget",

    "group-item" :
    {
      include : "label",
      alias : "label",

      style : function(states)
      {
        return {
          padding : 4,
          backgroundColor : "#BABABA",
          textColor : "white",
          font: "bold"
        };
      }
    },

    "virtual-selectbox" : "selectbox",
    "virtual-selectbox/dropdown" : "popup",
    "virtual-selectbox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-combobox" : "combobox",
    "virtual-combobox/dropdown" : "popup",
    "virtual-combobox/dropdown/list" : {
      alias : "virtual-list"
    },

    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 21
        };
      }
    },

    "virtual-tree-folder" : "tree-folder",
    "virtual-tree-file" : "tree-file",

    "cell" :
    {
      style : function(states)
      {
        return {
          backgroundColor: states.selected ?
            "table-row-background-selected" :
            "table-row-background-even",
          textColor: states.selected ? "text-selected" : "text",
          padding: [3, 6]
        }
      }
    },

    "cell-string" : "cell",
    "cell-number" :
    {
      include : "cell",
      style : function(states)
      {
        return {
          textAlign : "right"
        }
      }
    },
    "cell-image" : "cell",
    "cell-boolean" : "cell",
    "cell-atom" : "cell",
    "cell-date" : "cell",
    "cell-html" : "cell",


    /*
    ---------------------------------------------------------------------------
      HTMLAREA
    ---------------------------------------------------------------------------
    */

    "htmlarea" :
    {
      "include" : "widget",

      style : function(states)
      {
        return {
          backgroundColor : "white"
        }
      }
    },

    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */
    "progressbar":
    {
      style: function(states) {
        return {
          decorator: "progressbar",
          padding: [1],
          backgroundColor: "white",
          width : 200,
          height : 20
        }
      }
    },

    "progressbar/progress":
    {
      style: function(states) {
        return {
          backgroundColor: states.disabled ? "background-disabled" : "background-selected"
        }
      }
    },



    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header":
    {
      style : function(states)
      {
        return {
          textColor : "text-selected",
          backgroundColor: "background-selected",
          padding : [8, 12]
        };
      }
    },

    "app-header-label": "label"
  }
});