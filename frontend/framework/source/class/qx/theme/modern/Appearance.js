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

#use(qx.theme.modern.Sprites)

************************************************************************* */

/**
 * The modern appearance theme.
 */
qx.Theme.define("qx.theme.modern.Appearance",
{
  title : "Modern",
  extend : qx.theme.classic.Appearance,

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
          textColor : "label"
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
        var decorator;

        if (states.checked && states.focused) {
          decorator = "button-checked-focused";
        } else if (states.checked) {
          decorator = "button-checked";
        } else if (states.pressed) {
          decorator = "button-pressed";
        } else if (states.over) {
          decorator = "button-over";
        } else if (states.preselected && states.focused) {
          decorator = "button-preselected-focused";
        } else if (states.preselected) {
          decorator = "button-preselected";
        } else if (states.focused) {
          decorator = "button-focused";
        } else {
          decorator = "button";
        }

        return {
          align: "top",
          textColor: "black",
          font: "default",
          decorator: decorator
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
          decorator: states.focused ? "textfield-focused" : "textfield",
          padding: [ 1, 3 ],
          textColor: states.disabled ? "text-disabled" : "input-text",
          backgroundColor: "white"
        };
      }
    },


    "text-area" : {
      include : "text-field"
    }
  }
});
