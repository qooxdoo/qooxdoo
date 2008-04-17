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

    "label" :
    {
      style : function(states)
      {
        return {
          textColor : states.disabled ? "text-disabled" : "undefined"
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
        if (states.pressed || states.abandoned || states.checked) {
          var decorator = states.focuesd ? "focused-inset" : "inset";
        } else {
          var decorator = states.focused ? "focused-outset" : "outset";
        }

        if (states.pressed || states.abandoned || states.checked) {
          var padding = [ 4, 3, 2, 5 ];
        } else {
          var padding = [ 3, 4 ];
        }

        return {
          backgroundColor : states.abandoned ? "button-abandoned" : states.hovered ? "button-hovered" : "button",
          decorator : decorator,
          padding : padding
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
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      style : function(states)
      {
        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          backgroundColor : states.focused ? "#F0F4FA" : "white"
        };
      }
    },

    "list-item" :
    {
      style : function(states)
      {
        return {
          align           : "left",
          gap             : 4,
          padding         : states.lead ? [ 2, 4 ] : [ 3, 5 ],
          backgroundColor : states.selected ? "selected" : "undefined",
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

    "text-field" :
    {
      style : function(states)
      {
        return {
          decorator       : states.focused ? "focused-inset" : "inset",
          padding         : [ 2, 3 ],
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : states.disabled ? "#F4F4F4" : states.focused ? "#F0F4FA" : "field"
        };
      }
    },

    "text-area" : {
      include : "text-field"
    },


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
          decorator       : "inset",
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : "field"
        };
      }
    },

    "spinner-text-field" :
    {
      style : function(states)
      {
        return {
          padding: [1, 3]
        };
      }
    },

    "spinner-button":
    {
      include : "button",

      style : function(states)
      {
        return {
          padding : states.pressed ? [2, 2, 0, 4] : [1, 3, 1, 3]
        };
      }
    },

    "spinner-button-up" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/up-small.gif"
        }
      }
    },

    "spinner-button-down" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          icon : "decoration/arrows/down-small.gif"
        };
      }
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
          backgroundColor : "background",
          paddingRight    : 4,
          paddingLeft     : 4
          // marginRight     : 10
        };
      }
    },

    "group-box-frame" :
    {
      style : function(states)
      {
        return {
          padding : [ 12, 9 ],
          decorator  : "groove"
        };
      }
    },

    "check-box-group-box-legend" :
    {
      include : "check-box",

      style : function(states)
      {
        return {
          backgroundColor : "background",
          paddingRight    : 3,
          paddingLeft     : 3
        };
      }
    },

    "radio-button-group-box-legend" :
    {
      include : "radio-button",

      style : function(states)
      {
        return {
          backgroundColor : "background",
          paddingRight    : 3,
          paddingLeft     : 3
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
          // top    : 2,
          // left   : 3,
          // bottom : 2,
          // width  : 4,
          decorator : "outset-thin"
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
          // top    : 2,
          // left   : 3,
          // width  : "auto",
          // bottom : 2,
          decorator : "divider-horizontal"
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
          // spacing : 4,
          // width           : "auto",
          decorator       : border,
          padding         : padding,
          // verticalChildrenAlign : "middle",
          backgroundColor       : states.abandoned ? "button-abandoned" : states.checked ? "#F3F0F5" : "button"
          //backgroundImage       : states.checked && !states.over ? "static/image/dotted_white.gif" : null
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
          // spacing : -1
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
          decorator : new qx.ui.decoration.Single(1, "solid", "tab-view-border"),
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
        var backgroundColor, decorator;

        marginTop = 0;
        marginBottom = 0;
        decorator = new qx.ui.decoration.Single(1, "solid", "tab-view-border");

        if (states.checked)
        {
          paddingTop = 2;
          paddingBottom = 4;
          paddingLeft = 7;
          paddingRight = 8;
          // marginRight = -1;
          // marginLeft = -2;
          backgroundColor = "tab-view-button-checked";

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
              // marginLeft = 0;
            }
          }
          else
          {
            if (states.lastChild)
            {
              paddingLeft = 8;
              paddingRight = 5;
              // marginRight = 0;
            }
          }
        }
        else
        {
          paddingTop = 2;
          paddingBottom = 2;
          paddingLeft = 5;
          paddingRight = 6;
          // marginRight = 1;
          // marginLeft = 0;
          backgroundColor = states.over ? "tab-view-button-hover" : "tab-view-button";

          if (states.barTop)
          {
            decorator.setWidthBottom(0);
            // marginTop = 3;
            // marginBottom = 1;
          }
          else
          {
            decorator.setWidthTop(0);
            // marginTop = 1;
            // marginBottom = 3;
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
              // marginRight = 0;
            }
          }
        }

        return {
          padding : [ paddingTop, paddingRight, paddingBottom, paddingLeft ],
          // margin : [ marginTop, marginRight, marginBottom, marginLeft ],
          decorator : decorator,
          backgroundColor : backgroundColor
        }
      }
    },





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

        };
      }
    },

    "scroll-pane-corner" :
    {

    },

    "scrollbar-slider" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#F3F0F5"
        }
      }
    },

    "scrollbar-button" :
    {
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
          backgroundColor : "background"
        }
      }
    },

    "slider-knob" :
    {
      include : "button",

      style : function(states)
      {
        return {
          width: 10,
          height: 10
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
          source : states.opened
            ? "decoration/tree/minus.gif"
            : "decoration/tree/plus.gif"
        }
      }
    },


    "tree-folder" :
    {
      style : function(states)
      {
        return {
          padding : [2, 3, 2, 0],
          //backgroundColor : states.selected ? "selected" : "undefined",
          //textColor : states.selected ? "text-selected" : "undefined",
          icon : "icon/16/places/folder-open.png",
          iconOpened : "icon/16/places/folder.png"
        }
      }
    },


    "tree-folder-icon" : {
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 0]
        }
      }
    },


    "tree-folder-label" :
    {
      style : function(states)
      {
        return {
          padding : [ 1, 2 ],
          backgroundColor : states.selected ? "selected" : "undefined",
          textColor : states.selected ? "text-selected" : "undefined"
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


    "tree-file-icon" : {
      include : "tree-folder-icon"
    },


    "tree-file-label" : {
      include : "tree-folder-label"
    },


    "tree" :
    {
      include : "list",

      style : function(states)
      {
        return {
          contentPadding : [4, 4, 4, 4]
        }
      }
    }
  }
});
