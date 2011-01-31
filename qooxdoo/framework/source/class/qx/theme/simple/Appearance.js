/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#asset(qx/icon/Tango/16/actions/window-close.png)
#asset(qx/icon/Tango/16/actions/dialog-cancel.png)
#asset(qx/icon/Tango/16/actions/dialog-ok.png)

#asset(qx/decoration/Classic/*)

************************************************************************* */

/**
 * The simple qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.simple.Appearance",
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
          backgroundColor: undefined
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
        var decorator = "button-box";
        
        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }
        
        return {
          decorator : decorator,
          padding : [3, 8],
          cursor: states.disabled ? undefined : "pointer"
        };
      }
    },
    
    "button-frame/label" : {
      alias : "atom/label",

      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : undefined
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
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          decorator : states.hovered ? "button" : undefined
        }
      }
    },

    "splitbutton" : {},

    "splitbutton/button" : 
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";
        
        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }
        
        decorator += "-left";
        
        return {
          decorator : decorator,
          padding : [3, 8],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "splitbutton/arrow" : {

      style : function(states)
      {
        var decorator = "button-box";
        
        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }
        
        decorator += "-right";
        
        return {
          icon : "decoration/arrows/down.gif",
          decorator : decorator,
          cursor : "pointer",
          padding: [3, 4]
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
      style : function(states)
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
      include : "textfield"
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

    "textfield" :
    {
      style : function(states)
      {
        var textColor;
        if (states.disabled) {
          textColor = "text-disabled";
        } else if (states.showingPlaceholder) {
          textColor = "text-placeholder";
        } else {
          textColor = undefined;
        }
        
        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding,
          textColor : textColor,
          backgroundColor : states.disabled ? "background-disabled" : undefined
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
          textColor : states.disabled ? "text-disabled" : undefined
        };
      }
    },

    "spinner/textfield" : "textfield",

    "spinner/upbutton" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/up-small.gif"
        }
      }
    },

    "spinner/downbutton" : 
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down-small.gif"
        }
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
          decorator : undefined
        };
      }
    },
    


    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */

    "groupbox" : {},

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          padding : [6, 9],
          margin: [18, 2, 2, 2],
          decorator  : "white-box"
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
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
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
          textColor : states.invalid ? "invalid" : undefined,
          padding : 5,
          margin : 4,
          font: "bold"
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
          backgroundColor : "light-blue",
          padding : [0, 10]
        };
      }
    },

    "toolbar/part" : {
      style : function(states)
      {
        return {
          margin : [0 , 15]
        };
      }
    },

    "toolbar/part/container" : {},
    "toolbar/part/handle" : {},

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin: [7, 0],
          width: 4
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator = "button-box";

        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }

        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }
        
        // set the margin
        var margin = [7, 10];
        if (states.left || states.middle || states.right) {
          margin = [7, 0];
        }

        return {
          cursor  : "pointer",
          decorator : decorator,
          margin : margin,
          padding: [3, 5]
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
          source : "decoration/arrows/down.gif",
          cursor : "pointer",
          padding : [0, 5],
          marginLeft: 2
        };
      }
    },

    "toolbar-splitbutton" : {},
    "toolbar-splitbutton/button" : 
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";
        
        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }
        
        // set the right left and right decoratos
        if (states.left) {
          decorator += "-left";
        } else if (states.right) {
          decorator += "-middle";
        } else if (states.middle) {
          decorator += "-middle";
        }
        
        return {
          icon : "decoration/arrows/down.gif",
          decorator : decorator
        };
      }
    },


    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        var decorator = "button-box";
        
        if (states.disabled) {
          decorator = "button-box";
        } else if (states.hovered && !states.pressed && !states.checked) {
          decorator = "button-box-hovered";
        } else if (states.hovered && (states.pressed || states.checked)) {
          decorator = "button-box-pressed-hovered";
        } else if (states.pressed || states.checked) {
          decorator = "button-box-pressed";
        }
        
        // set the right left and right decoratos
        if (states.left) {
          decorator += "-middle";
        } else if (states.right) {
          decorator += "-right";
        } else if (states.middle) {
          decorator += "-middle";
        }
        
        return {
          icon : "decoration/arrows/down.gif",
          decorator : decorator
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
          marginBottom -= 2;
        } else if (states.barBottom) {
          marginTop -= 2;
        } else if (states.barRight) {
          marginLeft -= 2;
        } else {
          marginRight -= 2;
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
          decorator : "border-blue",
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
          backgroundColor : "dark-blue",
          textColor: "white",
          font: "bold",
          padding : [ paddingTop, paddingRight, paddingBottom, paddingLeft ],
          margin : [ marginTop, marginRight, marginBottom, marginLeft ]
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
    "scrollbar/slider" : {},

    "scrollbar/slider/knob" :
    {
      style : function(states)
      {
        return {
          height    : 14,
          width     : 14,
          decorator : "button",
          cursor : "pointer",
          minHeight : states.horizontal ? undefined : 9,
          minWidth  : states.horizontal ? 9 : undefined
        };
      }
    },


    "scrollbar/button" :
    {
      style : function(states)
      {
        var styles = {};
        if (states.up || states.down) {
          styles.padding = [ 4, 3 ];
        }
        else {
          styles.padding = [ 3, 4 ];
        }

        styles.icon = "decoration/arrows/";
        if (states.left) {
          styles.icon += "left.gif";
          styles.marginRight = 2;
        } else if (states.right) {
          styles.icon += "right.gif";
          styles.marginLeft = 2;
        } else if (states.up) {
          styles.icon += "up.gif";
          styles.marginBottom = 2;
        } else {
          styles.icon += "down.gif";
          styles.marginTop = 2;
        }
        
        styles.decorator = "button-box";
        return styles;
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
        var decorator;
        var padding;
        if (states.disabled) {
          decorator = "inset";
          padding = [2, 3];
        } else if (states.invalid) {
          decorator = "border-invalid";
          padding = [1, 2];
        } else if (states.focused) {
          decorator = "focused-inset";
          padding = [1, 2];
        } else {
          padding = [2, 3];
          decorator = "inset";
        }

        return {
          decorator : decorator,
          padding   : padding
        }
      }
    },

    "slider/knob" :
    {
      style : function(states)
      {
        return {
          width: 14,
          height: 14,
          decorator : "button",
          cursor : "pointer"
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
          decorator : states.maximized ? undefined : "window"
        };
      }
    },

    "window/pane" : {},

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-blue",
          padding : 8,
          font: "bold"
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
      alias : "button",

      style : function(states)
      {
        return {
          icon : "data:image/png;base64,R0lGODlhCQAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAJAAkAAAILjI+py+0NojxyhgIAOw==",
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/restore-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          icon : "data:image/png;base64,R0lGODlhCAAJAPABAAAAAAAAACH5BAUAAAEALAAAAAAIAAkAQAIQTICpaAvXTHuSTqeO1ayaAgA7",
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          icon : "data:image/png;base64,R0lGODlhCQAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAJAAkAAAIPhI+JwR3mGowP0HpnVKgAADs=",
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
        };
      }
    },

    "window/close-button" :
    {
      alias : "button",

      style : function(states)
      {
        return {
          marginLeft : 2,
          icon : "data:image/png;base64,R0lGODlhCgAJAIABAAAAAAAAACH5BAEAAAEALAAAAAAKAAkAAAIRjI8BgHuuWFsyQUuxuTemXwAAOw==",
          padding : [ 1, 2 ],
          cursor : states.disabled ? undefined : "pointer"
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
          backgroundColor : "light-blue"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : states.horizontal ? 
            "decoration/splitpane/knob-horizontal.png" : 
            "decoration/splitpane/knob-vertical.png",
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
      style : function(states)
      {
        return {
          decorator : states.invalid && !states.disabled ? "button-invalid" : 
            states.focused && !states.disabled ? "button-focused" : "button",
          cursor : "pointer",
          padding: (states.invalid || states.focused) && !states.disabled ? 2 : 4
        };
      }
    },

    "selectbox/atom" : "atom",
    "selectbox/popup" : "popup",
    "selectbox/list" : {
      alias : "list",
      include : "list",
      
      style : function() 
      {
        return {
          decorator : undefined
        };
      }
    },

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
          decorator : "main"
        }
      }
    },

    "datechooser/navigation-bar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
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
          backgroundColor : "background"
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
          textColor       : states.disabled ? "text-disabled" : states.weekend ? "dark-blue" : "background",
          backgroundColor : states.weekend ? "background" : "dark-blue"
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
          backgroundColor : states.disabled ? undefined : states.selected ? "blue" : undefined,
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
          textColor : "dark-blue",
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

    "combobox" :{},

    "combobox/button" :
    {
      alias : "button",
      include : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.gif",
          decorator : "button",
          cursor : "pointer",
          padding : [0, 5],
          marginLeft: 4
        };
      }
    },

    "combobox/popup" : "popup",
    "combobox/list" : {},

    "combobox/textfield" : "textfield",




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
          decorator : "main",
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
    "colorselector/input-field-set" : "groupbox",
    "colorselector/preview-field-set" : "groupbox",

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
          paddingRight : 2,
          backgroundColor: "light-blue"
        };
      }
    },

    "table/column-button" :
    {
      alias : "button",
      style : function(states)
      {
        return {
          decorator : "button",
          padding : 4,
          margin: [3, 5],
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

    "table-scroller/header": {},

    "table-scroller/pane" : {},

    "table-scroller/focus-indicator" :
    {
      style : function(states)
      {
        return {
          decorator : "main"
        };
      }
    },

    "table-scroller/resize-line" :
    {
      style : function(states)
      {
        return {
          backgroundColor: "middle-blue",
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
          font : "bold",
          paddingTop: 3,
          paddingLeft: 5,
          cursor : "pointer",
          sortIcon : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : undefined
        }
      }
    },
    
    "table-header-cell/icon" : 
    {
      include : "atom/icon", 
      
      style : function(states) {
        return {
          paddingRight : 5
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
          backgroundColor: "white"
        }
      }
    },

    "progressbar/progress":
    {
      style: function(states) {
        return {
          backgroundColor: "background-selected"
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "dark-blue",
          padding : [8, 12]
        };
      }
    }
  }
});
