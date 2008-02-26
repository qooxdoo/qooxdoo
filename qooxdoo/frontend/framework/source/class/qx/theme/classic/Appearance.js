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

#ignore(auto-use)

************************************************************************* */

/**
 * The classic qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.classic.Appearance",
{
  title : "Classic",

  appearances :
  {
    widget : {},

    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      style : function(states)
      {
        if (states.pressed || states.checked || states.abandoned) {
          var decorator = "inset";
        } else {
          var decorator = "outset";
        }

        if (states.pressed || states.abandoned) {
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
    }
  }
});
