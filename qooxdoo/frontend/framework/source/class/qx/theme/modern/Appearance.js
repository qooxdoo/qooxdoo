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

#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)

************************************************************************* */

/**
 * The modern appearance theme.
 */
qx.Theme.define("qx.theme.modern.Appearance",
{
  title : "Modern",

  appearances :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "widget" : {},


    "root" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background",
          textColor       : "label",
          font            : "default"
        };
      }
    },



    "label" :
    {
      style : function(states)
      {
        return {
          //paddingTop : 4
          //textColor  : "label"
        };
      }
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
        var base = "decoration/";
        var decorator, textColor;

        if (states.checked && states.focused) {
          decorator = "button-checked-focused";
          textColor = "text";
        } else if (states.checked) {
          decorator = "button-checked";
          textColor = "text";
        } else if (states.pressed) {
          decorator = "button-pressed";
          textColor = "#001533";
        } else if (states.hovered) {
          decorator = "button-hovered";
          textColor = "#001533";
        } else if (states.preselected && states.focused) {
          decorator = "button-preselected-focused";
          textColor = "#001533";
        } else if (states.preselected) {
          decorator = "button-preselected";
          textColor = "#001533";
        } else if (states.focused) {
          decorator = "button-focused";
          textColor = "text";
        } else {
          decorator = "button";
          textColor = "text";
        }

        return {
          padding    : 2,
          align      : "left",
          textColor  : textColor,
          font       : "default",
          decorator  : decorator
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */


    "check-box":
    {
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
          align: "left",
          gap: 6
        }
      }
    },


    "radio-button":
    {
      include : "check-box",

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


    "text-field" :
    {
      style : function(states)
      {
        return {
          decorator: states.focused ? "textfield-focused" : "textfield",
          padding: [ 1, 3 ],
          textColor: states.disabled ? "text-disabled" : "input-text",
          backgroundColor: "white"
        };
      }
    },


    "text-area" : {
      include : "text-field"
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
          padding : [ 4, 10 ],
          legendPosition : "top"
        };
      }
    },

    "group-box-legend" :
    {
      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 0],
          textColor : "#314a6e",
          font      : new qx.bom.Font().set({
            family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ],
            size   : 12,
            bold   : true
          })
        };
      }
    },

    "group-box-frame" :
    {
      style : function(states)
      {
        return {
          padding : [ 12, 9 ],
          decorator  : new qx.ui.decoration.Rounded().set({
            backgroundColor: "#ececec",
            color : "#c6c6c6",
            radius : 5,
            width : 1
          })
        };
      }
    },


    /*
    ---------------------------------------------------------------------------
      IMAGE
    ---------------------------------------------------------------------------
    */

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : 1
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */


    "scroll-pane-corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#e4e4e4"
        };
      }
    },

    "scrollbar" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? "undefined" : 15,
          height : states.horizontal ? 15 : "undefined",
          decorator : new qx.ui.decoration.Uniform().set({
            backgroundImage : states.horizontal ? "decoration/scrollbar/scrollbar-bg-horizontal.png" : "decoration/scrollbar/scrollbar-bg-vertical.png",
            backgroundRepeat : states.horizontal ? "repeat-x" : "repeat-y"
          }),
          padding : states.horizontal ? [0, 1, 1, 1] : [1, 1, 1, 0]
        };
      }
    },

    "slider-knob" :
    {
      style : function(states)
      {
        return {
          decorator: states.horizontal ? "slider-knob-horizontal" : "slider-knob-vertical",
          height : 14,
          width : 14
        };
      }
    },

    "scrollbar-slider" :
    {
      style : function(states)
      {
        return {
          padding : states.horizontal ? [0, 1, 0, 1] : [1, 0, 1, 0]
        }
      }
    },

    "scrollbar-button" :
    {
      style : function(states)
      {
        var icon = "decoration/scrollbar/scrollbar-";
        if (states.left) {
          icon += "left.png";
        } else if (states.right) {
          icon += "right.png";
        } else if (states.up) {
          icon += "up.png";
        } else {
          icon += "down.png";
        }

        if (states.left || states.right)
        {
          return {
            padding : [0, 0, 0, states.left ? 3 : 4],
            icon : icon,
            width: 15,
            height: 14,
            decorator : states.pressed ? "slider-knob-pressed-horizontal" : "slider-knob-horizontal"
          }
        }
        else
        {
          return {
            padding : [0, 0, 0, 2],
            icon : icon,
            width: 14,
            height: 15,
            decorator : states.pressed ? "slider-knob-pressed-vertical" : "slider-knob-vertical"
          }
        }
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
          decorator : states.focused ? "focus-line" : "black",
          backgroundColor : states.focused ? "#F0F4FA" : "white"
        };
      }
    },

    "list-item" :
    {
      style : function(states)
      {
        return {
          padding   : 4,
          textColor : states.selected ? "text-selected" : "undefined",
          decorator : states.selected
            ? new qx.ui.decoration.Single().set({
              backgroundImage : "decoration/selection.png",
              backgroundRepeat : "scale"
            })
            : "undefined"
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
          decorator : "toolbar"
        };
      }
    },

    "toolbar-button" :
    {
      style : function(states)
      {
        return {
          padding : states.pressed||states.checked ? 4 : states.hovered ? 4 : 6,
          margin : 2,
          decorator : states.pressed||states.checked ? "toolbar-button-checked" : states.hovered ? "toolbar-button-hovered" : "undefined",
          textColor: states.disabled ? "text-disabled" : "text"
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-separator",
          margin    : 7,
          width     : 0,
          height    : 0
        };
      }
    },

    "toolbar-part" : {},

    "toolbar-part-handle" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-part-handle",
          width     : 7
        };
      }
    },



    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */


    "tree" : {
      include : "list"
    },

    "tree-folder" :
    {
      style : function(states)
      {
        return {
          padding : [4, 3, 3, 3],
          //backgroundColor : states.selected ? "selected" : "undefined",
          textColor : states.selected ? "text-selected" : "undefined",
          decorator : states.selected
            ? new qx.ui.decoration.Single().set({
              backgroundImage : "decoration/selection.png",
              backgroundRepeat : "scale",
              widthBottom: 1,
              colorBottom: "#F2F2F2"
            })
            : new qx.ui.decoration.Single().set({
              widthBottom: 1,
              colorBottom: "#F2F2F2"
            }),
          icon : "icon/16/places/folder-open.png",
          iconOpened : "icon/16/places/folder.png"
        }
      }
    },

    "tree-file" :
    {
      include : "tree-folder",

      style : function(states)
      {
        return {
          icon : "icon/16/mimetypes/text-plain.png"
        }
      }
    },

    "tree-folder-icon" : {
      style : function(states)
      {
        return {
          padding : [0, 5, 0, 0]
        }
      }
    },

    "tree-folder-label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 0, 0, 0 ]
        }
      }
    },

    "tree-file-icon" : {
      include : "tree-folder-icon"
    },

    "tree-file-label" : {
      include : "tree-folder-label"
    },

    "folder-open-button" :
    {
      style : function(states)
      {
        var icon;
        if (states.selected && states.opened)
        {
          icon = "decoration/tree/tree-open-selected.png"; 
        }
        else if (states.selected && !states.opened)
        {
          icon = "decoration/tree/tree-closed-selected.png";
        }
        else if (states.opened)
        {
          icon = "decoration/tree/tree-open.png";
        }
        else
        {
          icon = "decoration/tree/tree-closed.png";
        }
        
        return {
          padding : [0, 5, 0, 2],
          source  : icon
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      TOOL-TIP
    ---------------------------------------------------------------------------
    */

    "tool-tip" :
    {
      style : function(states)
      {
        return {
          padding : 5,
          backgroundColor : "#ffffdd",
          decorator : "tooltip"
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
          backgroundColor : "#a9a9a9",
          decorator       : "window"
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states)
      {
        return {

        };
      }
    },

    "window-captionbar" :
    {
      style : function(states)
      {
        return {
          decorator : states.active ? "window-captionbar-active" : "window-captionbar-inactive",
          padding   : [ -4, 0, -6, 0 ],
          textColor : states.active ? "#ffffff" : "#4a4a4a"
        };
      }
    },

    "window-captionbar-icon" :
    {
      style : function(states)
      {
        return {
          margin : [ 4, 0, 2, 2 ]
        };
      }
    },

    "window-captionbar-title" :
    {
      style : function(states)
      {
        return {
          margin : [ 7, 8, 0, 4 ],
          font   : "default"
        };
      }
    },

    "window-captionbar-button" :
    {
      style : function(states)
      {
        return {
          margin  : [ 8, 4, 4, 4 ]
        };
      }
    },

    "window-captionbar-minimize-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : states.active ? "decoration/window/minimize-active.png" : "decoration/window/minimize-inactive.png"
        };
      }
    },

    "window-captionbar-restore-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          // icons seems to be missing in resource folder, Alex?
          //icon : states.active ? "decoration/window/restore-active.png" : "decoration/window/restore-inactive.png"
        };
      }
    },

    "window-captionbar-maximize-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : states.active ? "decoration/window/maximize-active.png" : "decoration/window/maximize-inactive.png"
        };
      }
    },

    "window-captionbar-close-button" :
    {
      include : "window-captionbar-button",

      style : function(states)
      {
        return {
          icon : states.active ? "decoration/window/close-active.png" : "decoration/window/close-inactive.png"
        };
      }
    },

    "window-statusbar" :
    {
      style : function(states)
      {
        return {
          paddingLeft : 2,
          decorator   : "window-statusbar"
        };
      }
    },

    "window-statusbar-text" :
    {
      style : function(states)
      {
        return {
          font      : "medium",
          textColor : "text"
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
      style : function(states)
      {
        return {
          decorator : "outset"
        };
      }
    },

    "resizer-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "dark-shadow"
        };
      }
    }
  }
});
