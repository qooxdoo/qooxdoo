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
   * Fabian Jakobs (fjakobs)
   * Alexander Back (aback)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/apps/utilities-color-chooser.png)
#asset(qx/decoration/Modern/*)

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
          textColor       : "text",
          font            : "default"
        };
      }
    },

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" :
                      states.focused ? "text-focused" :
                      "undefined"
        };
      }
    },

    "move-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "frame"
        };
      }
    },

    "resize-frame" :
    {
      style : function(states)
      {
        return {
          decorator : "frame"
        };
      }
    },

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

    "image" :
    {
      style : function(states)
      {
        return {
          opacity : !states.replacement && states.disabled ? 0.3 : 1
        }
      }
    },


    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",

    "popup" : "widget",





    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      alias : "atom",

      style : function(states)
      {
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
          textColor  : textColor,
          font       : "default",
          decorator  : decorator
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
          icon : "decoration/arrows/down.png"
        };
      }
    },





    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

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
      alias : "atom",

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
          icon: "decoration/form/" + icon + ".png",
          gap : 6
        }
      }
    },

    "textfield" :
    {
      style : function(states)
      {
        return {
          decorator       : states.focused ? "input-focused" : "input",
          padding         : [ 1, 3 ],
          textColor       : states.disabled ? "text-disabled" : "input-text",
          backgroundColor : "#fcfcfc"
        };
      }
    },

    "textarea" : "textfield",




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
          decorator : states.focused ? "input-focused" : "input",
          textColor : states.disabled ? "text-disabled" : "undefined"
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
          padding : [2, 3]
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
          icon : "decoration/arrows/up-small.png",
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3],
          backgroundColor : states.focused ? "background-focused-inner" : states.hovered ? "button-hovered" : "button"
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
          icon : "decoration/arrows/down-small.png",
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3],
          backgroundColor : states.focused ? "background-focused-inner" : states.hovered ? "button-hovered" : "button"
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
          backgroundColor : states.disabled ? "background-disabled" : states.focused ? "background-focused" : "background-field",
          decorator : "undefined"
        };
      }
    },

    "datefield/list" : 
    {
      alias : "datechooser",
      include : "datechooser",

      style : function(states) {
        return {
          decorator : states.focused ? "focused-inset" : "inset"
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      COLORFIELD
    ---------------------------------------------------------------------------
    */

    "colorfield" : "combobox",

    "colorfield/button" :
    {
      alias : "combobox/button",
      include : "combobox/button",

      style : function(states)
      {
        return {
          icon : "icon/16/apps/utilities-color-chooser.png",
          padding : [0, 3],
          backgroundColor : states.disabled ? "background-disabled" : states.focused ? "background-focused" : "background-field",
          decorator : "undefined"
        };
      }
    },

    "colorfield/list" : {
      alias : "list",
      include : "list",

      style : function(states) {
        return {
          decorator : states.focused ? "focused-inset" : "inset"
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
          legendPosition : "top"
        };
      }
    },

    "groupbox/legend" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : [1, 0, 1, 4],
          textColor : "#314a6e",
          font      : "bold"
        };
      }
    },

    "groupbox/frame" :
    {
      style : function(states)
      {
        return {
          padding   : 12,
          decorator : "groupbox-frame"
        };
      }
    },


    "check-groupbox" :
    {
      alias : "groupbox",
      include : "groupbox",

      style : function(states)
      {
        return {
          padding : 10
        }
      }
    },

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

    "radio-groupbox" :
    {
      alias : "groupbox",
      include : "groupbox",

      style : function(states)
      {
        return {
          padding : 10
        }
      }
    },

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
      SCROLLAREA
    ---------------------------------------------------------------------------
    */

    "scrollarea/corner" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#e4e4e4",
          
          // Functional!
          width: 0,
          height: 0
        };
      }
    },

    "scrollarea/pane" : "widget",
    "scrollarea/scrollbar-x" : "scrollbar",
    "scrollarea/scrollbar-y" : "scrollbar",
    
    
    
    


    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar" :
    {
      style : function(states)
      {
        return {
          width     : states.horizontal ? "undefined" : 16,
          height    : states.horizontal ? 16 : "undefined",
          decorator : states.horizontal ? "scrollbar-horizontal" : "scrollbar-vertical",
          padding   : 1
        };
      }
    },

    "scrollbar/slider" :
    {
      alias : "slider",

      style : function(states)
      {
        return {
          padding : states.horizontal ? [0, 1, 0, 1] : [1, 0, 1, 0]
        }
      }
    },

    "scrollbar/button" :
    {
      alias : "button",
      include : "button",

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
          decorator : "input"
        }
      }
    },

    "slider/knob" :
    {
      include : "button",

      style : function(states)
      {
        return {
          // TODO: Shouldn't this be the same image independend from the orientation? The light always comes from top!
          decorator: states.horizontal ? "slider-knob-horizontal" : "slider-knob-vertical",
          height : 14,
          width : 14
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
      alias : "scrollarea",

      style : function(states)
      {
        return {
          backgroundColor : "white"
        };
      }
    },

    "list/pane" : "widget",
    
    "listitem" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          padding   : 4,
          textColor : states.selected ? "text-selected" : "undefined",
          decorator : states.selected ? "listitem" : "undefined"
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
          icon : "decoration/arrows/right.png"
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
          icon : "decoration/arrows/left.png"
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
        return {
          zIndex          : 10, // TODO: functional?

          paddingLeft     : (states.barLeft || states.barRight) ? 0 : 10,
          paddingRight    : (states.barLeft || states.barRight) ? 0 : 10,
          paddingTop      : (states.barTop || states.barBottom) ? 0 : 10,
          paddingBottom   : (states.barTop || states.barBottom) ? 0 : 10,

          marginBottom    : states.barTop ? -1 : 0,
          marginTop       : states.barBottom ? -4 : 0,
          marginLeft      : states.barRight ? -3 : 0,
          marginRight     : states.barLeft ? -1 : 0
        }
      }
    },

    "tabview/bar/scrollpane" : {},

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          decorator : "pane",
          padding : 2,
          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "tabview-page" : "widget",

    /*
     * TODO
     *   - last button has own appearance
     *   - middle deactivated buttons have own appearance
     *   - different bar positions
     */
    "tabview-page/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var decorator, padding = 0, marginTop = 0, marginBottom = 0, marginLeft = 0, marginRight = 0;

        if (states.checked)
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-active";
            padding = [ 6, 14 ];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-active";
            padding = [ 6, 10 ];
            marginLeft = states.firstTab ? 0 : -5;
            marginRight = states.lastTab ? 0 : -5;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-active";
            padding = [ 6, 10 ];
            marginTop = states.firstTab ? 0 : -6;
            marginBottom = states.lastTab ? 0 : -6;
          }
          else
          {
            decorator = "tabview-page-button-left-active";
            padding = [ 6, 10 ];
            marginTop = states.firstTab ? 0 : -6;
            marginBottom = states.lastTab ? 0 : -6;
          }
        }
        else
        {
          if (states.barTop)
          {
            decorator = "tabview-page-button-top-inactive";
            padding = [ 4, 10 ];
            marginTop = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
          }
          else if (states.barBottom)
          {
            decorator = "tabview-page-button-bottom-inactive";
            padding = [ 4, 10 ];
            marginBottom = 4;
            marginLeft = states.firstTab ? 5 : 1;
            marginRight = 1;
          }
          else if (states.barRight)
          {
            decorator = "tabview-page-button-right-inactive";
            padding = [ 6, 10 ];
            marginRight = 4;
            marginTop = 1;
            marginBottom = 1;
            marginLeft = 1;
          }
          else
          {
            decorator = "tabview-page-button-left-inactive";
            padding = [ 6, 10 ];
            marginLeft = 4;
            marginTop = 2;
            marginBottom = 2;
            marginRight = 1;
          }
        }

        return {
          zIndex : states.checked ? 10 : 5,
          decorator : decorator,
          padding   : padding,
          marginTop : marginTop,
          marginBottom : marginBottom,
          marginLeft : marginLeft,
          marginRight : marginRight,
          textColor : states.checked ? "#26364D" : "#404955"
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

    "toolbar/part" : {},
    "toolbar/part/container" : {},

    "toolbar/part/handle" :
    {
      style : function(states)
      {
        return {
          decorator : "toolbar-part-handle",
          width     : 7
        };
      }
    },

    "toolbar-button" :
    {
      alias : "atom",

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

    "toolbar-splitbutton" : {},
    "toolbar-splitbutton/button" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          marginRight: 0,
          icon : "decoration/arrows/down.png"
        };
      }
    },

    "toolbar-splitbutton/arrow" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",

      style : function(states)
      {
        return {
          padding : states.pressed||states.checked ? 1 : states.hovered ? 1 : 3,
          marginLeft : 0,
          icon : "decoration/arrows/down.png"
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






    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree" :
    {
      include : "list",
      alias : "list",

      style : function(states)
      {
        return {
          contentPadding : [4, 4, 4, 4]
        }
      }
    },

    "tree-folder" :
    {
      style : function(states)
      {
        return {
          padding    : [ 1, 4 ],
          textColor  : states.selected ? "text-selected" : "undefined",
          decorator  : states.selected ? "tree-folder-selected" : "tree-folder",
          icon       : states.opened ? "icon/16/places/folder-open.png" : "icon/16/places/folder.png"
        }
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
        }
      }
    },

    "tree-folder/icon" :
    {
      style : function(states)
      {
        return {
          paddingRight : 5
        }
      }
    },

    "tree-folder/label" :
    {
      include : "label",

      style : function(states)
      {
        return {

        }
      }
    },

    "tree-folder/open" :
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
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "#ffffdd",
          decorator : "tooltip",
          shadow : "popup-shadow",
          padding : [ 1, 3, 2, 3 ],
          offset : [ 1, 1, 20, 1 ]
        };
      }
    },

    "tooltip/atom" : "atom",





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
          shadow : "window-shadow",
          contentPadding : [ 2, 3, 4, 3 ]
        };
      }
    },

    "window/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#a9a9a9",
          decorator       : "window-border"
        };
      }
    },
    
    // this appearance is a helper appearance to easily set this appearance
    // to the container holding the content of the window
    "window-pane-content" :
    {
      style : function(states)
      {
        return {
          decorator       : "window-pane-content",
          backgroundColor : "#f6f6f6",
          padding         : 0
        }
      }
    },

    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          decorator : states.active ? "window-captionbar-active" : "window-captionbar-inactive",
          textColor : states.active ? "#ffffff" : "#4a4a4a",
          minHeight : 26,
          paddingRight : 2
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          margin : [ 5, 0, 3, 6 ]
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          alignY     : "middle",
          font       : "bold",
          marginLeft : 6
        };
      }
    },

    "window/minimize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/minimize-active-hovered.png" : 
                                                  "decoration/window/minimize-active.png" : 
                                                  "decoration/window/minimize-inactive.png",
          margin : [ 4, 6, 2, 0 ]
        };
      }
    },

    "window/restore-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          // icons seems to be missing in resource folder, Alex?
          //icon : states.active ? "decoration/window/restore-active.png" : "decoration/window/restore-inactive.png",
          margin : [ 4, 6, 2, 0 ]
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/maximize-active-hovered.png" :
                                                  "decoration/window/maximize-active.png" :
                                                  "decoration/window/maximize-inactive.png",
          margin : [ 4, 6, 2, 0 ]
        };
      }
    },

    "window/close-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? states.hovered ? "decoration/window/close-active-hovered.png" : 
                                                  "decoration/window/close-active.png" : 
                                                  "decoration/window/close-inactive.png",
          margin : [ 4, 6, 2, 0 ]
        };
      }
    },

    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          padding   : [ 2, 6 ],
          decorator : "window-statusbar",
          minHeight : 18
        };
      }
    },

    "window/statusbar-text" :
    {
      style : function(states)
      {
        return {
          font      : "small",
          textColor : "text"
        };
      }
    },







    /*
    ---------------------------------------------------------------------------
      IFRAME
    ---------------------------------------------------------------------------
    */

    "iframe" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "white",
          decorator : "iframe"
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
          decorator : "pane"
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
          width : states.horizontal ? 6 : "undefined",
          height : states.vertical ? 6 : "undefined",
          backgroundColor : "#dfdfdf",
          decorator : states.horizontal ? "splitpane-splitter-horizontal" : "splitpane-splitter-vertical"
        };
      }
    },

    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : states.horizontal ? "decoration/splitpane/knob-horizontal.png" : "decoration/splitpane/knob-vertical.png"
        };
      }
    },

    "splitpane/slider" :
    {
      style : function(states)
      {
        return {
          width : states.horizontal ? 6 : "undefined",
          height : states.vertical ? 6 : "undefined",
          backgroundColor : "#dfdfdf"
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
          source : "decoration/arrows/down.png",
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
          decorator : "date-chooser"
        }
      }
    },
    
    "datechooser/navigation-bar" : 
    {
      style : function(states)
      {
        return {
          backgroundColor : "date-chooser",
          padding : [2, 10]
        };
      }
    },

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
          result.icon = "decoration/arrows/rewind.png";
        } else if (states.lastMonth) {
          result.icon = "decoration/arrows/left.png";
        } else if (states.nextYear) {
          result.icon = "decoration/arrows/forward.png";
        } else if (states.nextMonth) {
          result.icon = "decoration/arrows/right.png";
        }

        if (states.pressed || states.checked || states.abandoned) {
          result.decorator = "button-pressed";
        } else if (states.hovered) {
          result.decorator = "button";
        } else {
          result.decorator = "undefined";
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
          decorator       : "date-chooser-pane",
          backgroundColor : "date-chooser"
        };
      }
    },

    "datechooser-weekday" :
    {
      style : function(states)
      {
        // TODO: Please do not use inline decorators!
        var border = new qx.ui.decoration.Single().set({
          bottom : [ 1, "solid", "border-dark" ]
        });

        return {
          decorator       : border,
          font            : "bold",
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
          decorator       : states.today ? "focus" : "undefined",
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
        // TODO: Please do not use inline decorators!
        if (states.header)
        {
          var border = new qx.ui.decoration.Single().set({
            right : [ 1, "solid", "border-dark" ],
            bottom : [ 1, "solid", "border-dark" ]
          });
        }
        else
        {
          var border = new qx.ui.decoration.Single().set({
            right : [ 1, "solid", "border-dark" ]
          });
        }

        return {
          textAlign : "center",
          textColor : "date-chooser-title",
          padding   : [ 2, 4 ],
          decorator : border
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
          decorator       : states.focused ? "input-focused" : "input",
          backgroundColor : "white"
        };
      }
    },

    "combobox/popup" : "popup",
    "combobox/list" : "list",

    "combobox/button" :
    {
      include : "button",
      alias   : "button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down.png"
        };
      }
    },

    "combobox/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : null,
          padding   : [ 2, 3 ],
          textColor : states.disabled ? "text-disabled" : "input-text"
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
          decorator : "menu",
          shadow : "popup-shadow",
          spacingX : 6,
          spacingY : 1,
          iconColumnWidth : 16,
          arrowColumnWidth : 4
        };

        if (states.submenu)
        {
          result.position = "right-top";
          result.offset = [-2, -3];
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
          margin    : [ 4, 2 ]
        }
      }
    },

    "menu-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          decorator : states.selected ? "menu-button-selected" : "undefined",
          textColor : states.selected ? "text-selected" : "undefined",
          padding   : [ 4, 6 ]
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
          source : states.selected ? "decoration/arrows/right-invert.png" : "decoration/arrows/right.png",
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
      COLOR SELECTOR
    ---------------------------------------------------------------------------
    */
    
    "colorselector" : "widget",

    // TODO: "button-bar"
    "colorselector/button-bar" : "widget",
    "colorselector/cancle-button" : "button",
    "colorselector/ok-button" : "button",

    // TODO: "control-bar"
    "colorselector/control-bar" : "widget",
    "colorselector/control-pane" : "widget",

    // TODO: "preset-grid"
    "colorselector/preset-grid" : "widget",
    "colorselector/preset-field-set" : "groupbox",
    "colorselector/input-field-set" : "groupbox",
    "colorselector/preview-field-set" : "groupbox",

    // TODO: "hex-field-composite"
    "colorselector/hex-field-composite" : "widget",
    "colorselector/hex-field" : "textfield",

    // TODO: "rgb-spinner-composite"
    "colorselector/rgb-spinner-composite" : "widget",
    "colorselector/rgb-spinner-red" : "spinner",
    "colorselector/rgb-spinner-green" : "spinner",
    "colorselector/rgb-spinner-blue" : "spinner",

    // TODO: "hsb-spinner-composite"
    "colorselector/hsb-spinner-composite" : "widget",
    "colorselector/hsb-spinner-hue" : "spinner",
    "colorselector/hsb-spinner-saturation" : "spinner",
    "colorselector/hsb-spinner-brightness" : "spinner",

    // TODO
    "colorselector/preview-content-old" : "widget",
    "colorselector/preview-content-new" : "widget",

    // TODO
    "colorselector/hue-saturation-pane" : "widget",
    "colorselector/hue-saturation-field" : "widget",
    "colorselector/hue-saturation-handle" : "widget",
    "colorselector/brightness-pane" : "widget",
    "colorselector/brightness-field" : "widget",
    "colorselector/brightness-handle" : "widget",

    
    
    
    /*
    ---------------------------------------------------------------------------
      COLOR POPUP
    ---------------------------------------------------------------------------
    */
    
    "color-popup" :
    {
      alias : "popup",
      include : "popup",

      style : function(states)
      {
        return {
          decorator : "pane"
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "table"
        };
      }
    },

    "table-header": {},

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
        return {
          decorator : "table-column-button",
          padding   : [ 3, 1, 3, 2],
          icon      : "decoration/table/select-column-order.png"
        };
      }
    },

    "table-scroller" : "widget",

    "table-scroller/scrollbar-x": "scrollbar",
    "table-scroller/scrollbar-y": "scrollbar",

    "table-scroller/header":
    {
      style : function(states)
      {
        return {
          decorator       : "table-scroller-header"
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
        return {
          minWidth : 40,
          minHeight : 25,
          padding   : [ 3, 4 ],
          marginBottom : states.hovered ? 0 : 1,
          decorator : states.hovered ? "table-header-cell-hovered" : "table-header-cell",
          sortIcon  : states.sorted ?
              (states.sortedAscending ? "decoration/table/ascending.png" : "decoration/table/descending.png")
              : "undefined"
        }
      }
    },

    "table-header-cell/label" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5
        }
      }
    },

    "table-header-cell/sort-icon" :
    {
      style : function(states)
      {
        return {
          alignY : "middle",
          alignX : "right"
        }
      }
    },

    "table-header-cell/icon" :
    {
      style : function(states)
      {
        return {
          minWidth : 0,
          alignY : "middle",
          paddingRight : 5
        }
      }
    },

    "table-editor-textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          decorator : "undefined",
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
          decorator : "undefined"
        };
      }
    },

    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE
    ---------------------------------------------------------------------------
    */

    "progressive-table-header" :
    {
      alias : "widget",

      style : function(states)
      {
        return {
          decorator : "progressive-table-header"
        };
      }
    },

    "progressive-table-header-cell" :
    {
      alias : "atom",
      style : function(states)
      {
        return {
          minWidth : 40,
          minHeight : 25,
          paddingLeft : 6,
          decorator : "progressive-table-header-cell"
        }
      }
    }
  }
});
