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
      ICON
    ---------------------------------------------------------------------------
    */

    "icon" :
    {
      style : function(states)
      {
        return {
          opacity : states.disabled ? 0.3 : 1
        }
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
          padding         : [ 1, 3 ],
          textColor       : states.disabled ? "text-disabled" : "undefined",
          backgroundColor : "field"
        };
      }
    },

    "text-area" : {
      include : "text-field"
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
          icon : qx.core.Setting.get("qx.resourceUri") + "/decoration/Windows/arrows/up_small.gif"
        }
      }
    },

    "spinner-button-down" :
    {
      include : "spinner-button",

      style : function(states)
      {
        return {
          icon : qx.core.Setting.get("qx.resourceUri") + "/decoration/Windows/arrows/down_small.gif"
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
