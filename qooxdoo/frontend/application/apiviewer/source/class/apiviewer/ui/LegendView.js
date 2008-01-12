/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Shows the info pane.
 */
qx.Class.define("apiviewer.ui.LegendView",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setOverflow("auto");
    this.setWidth("100%");
    this.setHeight("100%");
    this.setBackgroundColor("white");
    this.setHtmlProperty("id", "legend");

    this.addEventListener("appear", this._showHtml, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Generate the HTML for the legend.
     */
    _showHtml : function()
    {
      if (this.getHtml() !== "") {
        return;
      }

      var TreeUtil = apiviewer.TreeUtil;
      var legend = [
        {
          icon: "ICON_PACKAGE",
          desc: "<h3>Package</h3>"
        },
        {
          icon: "ICON_CLASS",
          desc: "<h3>Class</h3>"
        },
        {
          icon: "ICON_CLASS_STATIC",
          desc: "<h3>Static Class</h3>"
        },
        {
          icon: "ICON_CLASS_ABSTRACT",
          desc: "<h3>Abstract Class</h3>"
        },
        {
          icon: "ICON_CLASS_SINGLETON",
          desc: "<h3>Singleton Class</h3>"
        },
        {
          icon: "ICON_INTERFACE",
          desc: "<h3>Interface</h3>"
        },
        {
          icon: "ICON_MIXIN",
          desc: "<h3>Mixin</h3>"
        },
        {
          icon: "ICON_METHOD_PUB",
          desc: "<h3>Public Method</h3>"
        },
        {
          icon: "ICON_METHOD_PROT",
          desc: "<h3>Protected Method</h3>"
        },
        {
          icon: "ICON_METHOD_PRIV",
          desc: "<h3>Private Method</h3>"
        },
        {
          icon: "ICON_PROPERTY_PUB",
          desc: "<h3>Public Property</h3>"
        },
        {
          icon: "ICON_PROPERTY_PROT",
          desc: "<h3>Protected Property</h3>"
        },
        {
          icon: "ICON_PROPERTY_PRIV",
          desc: "<h3>Private Property</h3>"
        },
        {
          icon: "ICON_PROPERTY_PUB_THEMEABLE",
          desc: "<h3>Themeable Property</h3>"
        },
        {
          icon: "ICON_EVENT",
          desc: "<h3>Event</h3>"
        },
        {
          icon: "ICON_CONSTANT",
          desc: "<h3>Constant</h3>"
        },
        {
          icon: "ICON_BLANK",
          desc: '<h3 style="text-decoration: line-through;color: #7193b9">deprecated</h3>'
        },


        {
          icon: "OVERLAY_WARN",
          desc: "Package/Class/Mixin/Interface is not fully documented"
        },
        {
          icon: "OVERLAY_ERROR",
          desc: "Method/Property/Event is not fully documented"
        },
        {
          icon: "OVERLAY_MIXIN",
          desc: "Method/Property is included from a mixin"
        },
        {
          icon: "OVERLAY_INHERITED",
          desc: "Method/Property/Event is inherited from one of the super classes"
        },
        {
          icon: "OVERLAY_OVERRIDDEN",
          desc: "Method/Property overrides the Method/Property of the super class"
        }

      ]

      var html = new qx.util.StringBuilder();
      html.add("<table cellpadding='0' cellspacing='0'>");

      for (var i=0; i<legend.length; i++)
      {
        var entry = legend[i];
        html.add("<tr><td class='icon'>");
        html.add(apiviewer.ui.ClassViewer.createImageHtml(
          apiviewer.TreeUtil.iconNameToIconPath(entry.icon)
        ));
        html.add("</td><td class='text'>", entry.desc, "</td></tr>");
      }

      html.add("</table>");

      this.setHtml(html.toString());
    }
  }
});
