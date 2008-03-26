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
        if (states.pressed) {
          var decorator = "inset";
        } else {
          var decorator = "outset";
        }

        if (states.pressed) {
          var padding = [ 4, 3, 2, 5 ];
        } else {
          var padding = [ 3, 4 ];
        }

        return {
          backgroundColor : states.abandoned ? "button-abandoned" : states.over ? "button-hover" : "button",
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
          decorator       : "inset-thin",
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
          decorator       : "inset",
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
        var base = qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/form/";

        var icon;
        if (states.checked && states.focus) {
          icon = "Checkbox-checked-focus";
        } else if (states.checked && states.disabled) {
          icon = "Checkbox-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "Checkbox-checked-pressed";
        } else if (states.checked && states.over) {
          icon = "Checkbox-checked-over";
        } else if (states.checked) {
          icon = "Checkbox-checked-normal";
        } else if (states.disabled) {
          icon = "Checkbox-unchecked-disabled";
        } else if (states.focus) {
          icon = "Checkbox-unchecked-focus";
        } else if (states.pressed) {
          icon = "Checkbox-unchecked-pressed";
        } else if (states.over) {
          icon = "Checkbox-unchecked-over";
        } else {
          icon = "Checkbox-unchecked-normal";
        }

        return {
          icon: base + icon + ".png",
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
        var base = qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Contemporary/form/";

        var icon;
        if (states.checked && states.focus) {
          icon = "Radio-checked-focus";
        } else if (states.checked && states.disabled) {
          icon = "Radio-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "Radio-checked-pressed";
        } else if (states.checked && states.over) {
          icon = "Radio-checked-over";
        } else if (states.checked) {
          icon = "Radio-checked-normal";
        } else if (states.disabled) {
          icon = "Radio-unchecked-disabled";
        } else if (states.focus) {
          icon = "Radio-unchecked-focus";
        } else if (states.pressed) {
          icon = "Radio-unchecked-pressed";
        } else if (states.over) {
          icon = "Radio-unchecked-over";
        } else {
          icon = "Radio-unchecked-normal";
        }

        return {
          icon: base + icon + ".png"
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
          icon : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/up_small.gif"
        }
      }
    },

    "spinner-button-down" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          icon : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/down_small.gif"
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
            ? qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/left_small.gif"
            : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/up_small.gif",
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
            ? qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/right_small.gif"
            : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Classic/arrows/down_small.gif"
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
    }

  }
});
