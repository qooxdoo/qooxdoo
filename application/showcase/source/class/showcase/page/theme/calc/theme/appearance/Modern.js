/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Theme.define("showcase.page.theme.calc.theme.appearance.Modern",
{
  appearances :
  {
    "modern-calculator" : "window",
    "modern-calculator-button" : "button",

    "modern-display" :
    {
      style : function(states)
      {
        return {
          decorator: "main",
          height : 40,
          padding: 3,
          marginBottom: 10
        }
      }
    },

    "modern-display/label" :
    {
      style : function(states)
      {
        return {
          font : "bold",
          marginLeft: 5
        }
      }
    },

    "modern-display/memory" : {
      style : function(states) {
        return {
          marginLeft: 5
        }
      }
    },

    "modern-display/operation" : {
      style : function(states) {
        return {
          marginLeft: 50
        }
      }
    },

    "modern-calculator/display" : "modern-display"
  }
});