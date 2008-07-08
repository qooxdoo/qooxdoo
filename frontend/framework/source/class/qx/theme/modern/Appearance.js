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

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
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


    "atom" : {},
    "atom/label" : "label",
    "atom/icon" : "image",


    /*
    ---------------------------------------------------------------------------
      POPUP
    ---------------------------------------------------------------------------
    */

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
          decorator: states.focused ? "textfield-focused" : "textfield",
          padding: [ 1, 3 ],
          textColor: states.disabled ? "text-disabled" : "input-text",
          backgroundColor: "white"
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
          icon : "decoration/arrows/down-small.gif",
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3],
          backgroundColor : states.focused ? "background-focused-inner" : states.hovered ? "button-hovered" : "button"
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
          padding : [ 4, 10 ],
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
          padding   : [1, 0, 1, 0],
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
          padding   : [ 12, 9 ],
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
          width: 0,
          height: 0
        };
      }
    },

    "scrollarea/pane" : "widget",
    "scrollarea/corner" : "widget",
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
        // TODO
        return {

        }
      }
    },


    "slider/knob" :
    {
      include : "button",

      style : function(states)
      {
        return {
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
          decorator : states.focused ? "focus-line" : "black",
          backgroundColor : states.focused ? "#F0F4FA" : "white"
        };
      }
    },

    // TODO
    "list/pane" : "widget",


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
    "slidebar/pane" : {},
    "slidebar/button-forward" : "button",
    "slidebar/button-backward" : "button",


    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */


    // TODO: still classic style
    "tabview" : {},

    "tabview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        return {
          zIndex          : 10, // TODO: functional?
          paddingLeft     : 10,
          paddingRight    : 10
        }
      }
    },

    "tabview/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "tabview-pane",
          decorator       : "tabview-pane",
          padding         : 10,
          marginTop       : -1
        };
      }
    },

    "tabview-page" : {},

    "tabview-page/button" :
    {
      alias : "button",

      style : function(states)
      {
        var paddingTop, paddingBottom, paddingLeft, paddingRight;
        var marginTop, marginBottom, marginRight, marginLeft;
        var backgroundColor, decorator;

        marginTop = 0;
        marginBottom = 0;
        decorator = new qx.ui.decoration.Single();
        decorator.set({
          width : 1,
          style : "solid",
          color : "tabview-border"
        });

        if (states.checked)
        {
          paddingTop = 2;
          paddingBottom = 4;
          paddingLeft = 7;
          paddingRight = 8;
          marginRight = -1;
          marginLeft = -2;
          backgroundColor = "tabview/button-checked";

          if (states.barTop)
          {
            decorator.setWidthBottom(0);
            decorator.setTop(3, "solid", "effect");
          }
          else
          {
            decorator.setWidthTop(0);
            decorator.setBottom(3, "solid", "effect");
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
          backgroundColor = states.over ? "tabview-button-hover" : "tabview-button";

          if (states.barTop)
          {
            decorator.setWidthBottom(0);
            marginTop = 3;
            marginBottom = 1;
          }
          else
          {
            decorator.setWidthTop(0);
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
          decorator : decorator,
          backgroundColor : backgroundColor
        }
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


    "tree" : {
      include : "list"
    },

    "tree-folder" :
    {
      style : function(states)
      {
        return {
          //backgroundColor : states.selected ? "selected" : "undefined",

          padding    : [4, 3, 3, 3],
          textColor  : states.selected ? "text-selected" : "undefined",
          decorator  : states.selected ? "tree-folder-selected" : "tree-folder",
          icon       : "icon/16/places/folder-open.png",
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
      tooltip
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          padding : 5,
          backgroundColor : "#ffffdd",
          decorator : "tooltip"
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
          decorator       : "window"
        };
      }
    },

    "window/pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#f3f3f3",
          decorator       : "window-border"
        };
      }
    },


    "window/captionbar" :
    {
      style : function(states)
      {
        return {
          decorator : states.active ? "window-captionbar-active" : "window-captionbar-inactive",
          textColor : states.active ? "#ffffff" : "#4a4a4a"
        };
      }
    },

    "window/icon" :
    {
      style : function(states)
      {
        return {
          margin : [ 4, 0, 2, 4 ]
        };
      }
    },

    "window/title" :
    {
      style : function(states)
      {
        return {
          alignY     : "middle",
          font       : "default",
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
          icon : states.active ? "decoration/window/minimize-active.png" : "decoration/window/minimize-inactive.png"
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
          //icon : states.active ? "decoration/window/restore-active.png" : "decoration/window/restore-inactive.png"
        };
      }
    },

    "window/maximize-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? "decoration/window/maximize-active.png" : "decoration/window/maximize-inactive.png"
        };
      }
    },

    "window/close-button" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          icon : states.active ? "decoration/window/close-active.png" : "decoration/window/close-inactive.png",
          margin : [ 4, 6, 2, 4 ]
        };
      }
    },


    "window/statusbar" :
    {
      style : function(states)
      {
        return {
          paddingLeft : 2,
          decorator   : "window-statusbar"
        };
      }
    },

    "window/statusbar-text" :
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
      IFRAME
    ---------------------------------------------------------------------------
    */

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
          backgroundColor : states.active ? "yellow" : "#aaa"
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
          backgroundColor : "red"
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
          paddingRight : 4,
          paddingLeft : 5
        };
      }
    },

    // TODO: check if this is the right appearance
    /*"selectbox" : {
      style : function(states)
      {
        var decorator, textColor;
        decorator = "button";
        textColor = "text";

        return {
          padding    : 2,
          textColor  : textColor,
          font       : "default",
          decorator  : decorator
        };
      }
    },*/


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
          decorator       : states.focused ? "textfield-focused" : "textfield",
          backgroundColor : "white"
        };
      }
    },

    "combobox/button" : "button",
    "combobox/popup" : "popup",
    "combobox/list" : "list",

    "combobox/textfield" :
    {
      include : "textfield",

      style : function(states)
      {
        return {
          padding: [ 2, 3 ],
          textColor: states.disabled ? "text-disabled" : "input-text"
        };
      }
    }

    // TODO: check if this is the right appearance
    /*"combobox-button" :
    {
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
    }*/
  }
});
