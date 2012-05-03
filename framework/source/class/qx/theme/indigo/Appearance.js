/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/icon/Tango/16/apps/office-calendar.png)
#asset(qx/icon/Tango/16/places/folder-open.png)
#asset(qx/icon/Tango/16/places/folder.png)
#asset(qx/icon/Tango/16/mimetypes/text-plain.png)
#asset(qx/icon/Tango/16/actions/view-refresh.png)
#asset(qx/icon/Tango/16/actions/window-close.png)
#asset(qx/icon/Tango/16/actions/dialog-cancel.png)
#asset(qx/icon/Tango/16/actions/dialog-ok.png)

************************************************************************* */

/**
 * The simple qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.indigo.Appearance",
{
  extend : qx.theme.simple.Appearance,

  appearances :
  {
    "colorselector/input-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 0
        }
      }
    },

    "colorselector/preview-field-set" : {
      include : "groupbox",
      alias : "groupbox",
      style : function() {
        return {
          paddingTop: 0
        }
      }
    },


    "toolbar" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "light-background",
          padding : [4, 0]
        };
      }
    },


    "splitpane/splitter/knob" :
    {
      style : function(states)
      {
        return {
          source : qx.theme.simple.Image.URLS[
            "knob-" + (states.horizontal ? "horizontal" : "vertical")
          ],
          padding : 3
        };
      }
    },


    "window" :
    {
      style : function(states)
      {
        return {
          contentPadding : [ 10, 10, 10, 10 ],
          backgroundColor: states.maximized ? "background" : undefined,
          decorator : states.maximized ? undefined : states.active ? "window-active" : "window"
        };
      }
    },


    "window/captionbar" :
    {
      style : function(states)
      {
        var active = states.active && !states.disabled;
        return {
          padding : [3, 8, active ? 1 : 3, 8],
          textColor: active ? "highlight" : "font",
          decorator: active ? "window-caption-active" : "window-caption"
        };
      }
    },


    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "default",
          marginRight : 20,
          alignY: "middle"
        };
      }
    },


    "virtual-tree" :
    {
      include : "tree",
      alias : "tree",

      style : function(states)
      {
        return {
          itemHeight : 27
        };
      }
    },


    "app-header" :
    {
      style : function(states)
      {
        return {
          font : "headline",
          textColor : "text-selected",
          decorator: "app-header",
          padding : 10
        };
      }
    },

    "app-header-label" :
    {
      style : function(states)
      {
        return {
          paddingTop : 5
        }
      }
    },

    "app-splitpane" : {
      alias : "splitpane",
      style : function(states) {
        return {
          padding: [0, 10, 10, 10],
          backgroundColor: "light-background"
        }
      }
    }
  }
});