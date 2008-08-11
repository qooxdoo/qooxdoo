/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Rass (jonathan_rass)

************************************************************************* */

/**
 * Mixin for the default qooxdoo appearance theme.
 */
qx.Theme.define("apiviewer.Appearance",
{
  title: "Theme for APIViewer",
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "api-tabview" :
    {
      include : "tabview",
      alias : "tabview",

      style : function(states)
      {
        return {
          width: 270
        };
      }
    },

    "detail-frame" :
    {
      style : function(states)
      {
        return {
          decorator: "pane",
          padding: 2
        };
      }
    },

    "main-splitpane" :
    {
      extend : "splitpane",
      alias : "splitpane",

      style : function(states)
      {
        return {
          margin : [2, 0, 0, 2]
        };
      }
    },

    "legend" :
    {
      extend : "scrollarea",
      alias : "scrollarea",

      style : function(states)
      {
        return {
          contentPadding: [5, 5, 5, 5]
        };
      }
    },

    "package-page" : "tabview-page",
    "info-page" : "tabview-page",
    "search-page" :
    {
      extend : "tabview-page",
      alias : "tabview-page",

      style : function(states)
      {
        return {
          padding: [5, 5, 5, 5]
        };
      }
    },


    "legendview-label-important" :
    {
      style : function(states)
      {
        return {
          font : new qx.bom.Font(16, [ "Segoe UI", "Lucida Grande", "Candara", "Liberation Sans", "Arial" ]),
          textColor: "#134275"
        };
      }
    },

    "legendview-label" :
    {
      style : function(states)
      {
        return {
          textColor: "#134275"
        };
      }
    },

    "splitpane/splitter" :
    {
      style : function(states)
      {
        return {
          paddingRight : 1,
          backgroundColor : "#dfdfdf"
        };
      }
    }
  }
});
