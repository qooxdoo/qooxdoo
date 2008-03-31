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
          var decorator = "inset";
        } else {
          var decorator = "outset";
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
          decorator       : states.focused ? "focused" : "inset",
          backgroundColor : "white"
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
          padding         : [ 3, 5 ],
          backgroundColor : states.selected ? "selected" : "undefined",
          textColor       : states.selected ? "text-selected" : "undefined"
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
          decorator       : states.focused ? "focused" : "inset",
          padding         : [ 2, 3 ],
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : "field"
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
      SCROLLBAR
    ---------------------------------------------------------------------------
    */


    "scrollbar" :
    {
      style : function(states)
      {
        return {
          decorator: "dark"
        }
      }
    },

    "scrollbar-slider" :
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

    "scrollbar-slider-pane" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "background"
        }
      }
    },

    "scrollbar-button-start" :
    {
      include : "button",

      style : function(states)
      {
        return {
          icon : states.horizontal
            ? "decoration/arrows/left-small.gif"
            : "decoration/arrows/up-small.gif",
          align : states.horizontal ? "left" : "top"
        }
      }
    },

    "scrollbar-button-end" :
    {
      include : "scrollbar-button-start",

      style : function(states)
      {
        return {
          icon : states.horizontal
            ? "decoration/arrows/right-small.gif"
            : "decoration/arrows/down-small.gif"
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
          icon : states.opened
            ? "icon/16/places/folder-open.png"
            : "icon/16/places/folder.png"
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
      style : function(states)
      {
        return {
          padding : [0, 4, 0, 4]
        }
      }
    },


    "tree-file-label" : {
      include : "tree-folder-label"
    },


    "tree" :
    {
      style : function(states)
      {
        return {
          decorator : "black"
        }
      }
    }

  }
});
