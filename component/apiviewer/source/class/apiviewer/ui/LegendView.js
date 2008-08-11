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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Shows the info pane.
 */
qx.Class.define("apiviewer.ui.LegendView",
{
  extend : qx.ui.container.Scroll,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.setAppearance("legend");

    var layout = new qx.ui.layout.Grid(10, 10);
    layout.setColumnWidth(1, 150);
    layout.setColumnFlex(1, 1);

    var content = new qx.ui.container.Composite(layout);

    var length = this.__legend.length;
    var entry, imageUrl;

    for(var i=0; i<length; i++)
    {
      entry = this.__legend[i];

      imageUrl = apiviewer.TreeUtil.iconNameToIconPath(entry.icon);

      // TODO
      if (typeof(imageUrl) != "string") {
        imageUrl = imageUrl[0];
      }

      content.add(new qx.ui.basic.Image(imageUrl).set({
        alignX : "center",
        alignY : "middle"
      }), {row: i, column: 0});


      content.add(new qx.ui.basic.Label(entry.desc).set({
        rich : true,
        appearance : (i<17) ? "legendview-label-important" : "legendview-label"
      }), {row: i, column: 1});
    }

    this.add(content)
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __legend : [
     {
       icon: "ICON_PACKAGE",
       desc: "Package"
     },
     {
       icon: "ICON_CLASS",
       desc: "Class"
     },
     {
       icon: "ICON_CLASS_STATIC",
       desc: "Static Class"
     },
     {
       icon: "ICON_CLASS_ABSTRACT",
       desc: "Abstract Class"
     },
     {
       icon: "ICON_CLASS_SINGLETON",
       desc: "Singleton Class"
     },
     {
       icon: "ICON_INTERFACE",
       desc: "Interface"
     },
     {
       icon: "ICON_MIXIN",
       desc: "Mixin"
     },
     {
       icon: "ICON_METHOD_PUB",
       desc: "Public Method"
     },
     {
       icon: "ICON_METHOD_PROT",
       desc: "Protected Method"
     },
     {
       icon: "ICON_METHOD_PRIV",
       desc: "Private Method"
     },
     {
       icon: "ICON_PROPERTY_PUB",
       desc: "Public Property"
     },
     {
       icon: "ICON_PROPERTY_PROT",
       desc: "Protected Property"
     },
     {
       icon: "ICON_PROPERTY_PRIV",
       desc: "Private Property"
     },
     {
       icon: "ICON_PROPERTY_PUB_THEMEABLE",
       desc: "Themeable Property"
     },
     {
       icon: "ICON_EVENT",
       desc: "Event"
     },
     {
       icon: "ICON_CONSTANT",
       desc: "Constant"
     },
     {
       icon: "ICON_BLANK",
       desc: 'deprecated'
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

  }
});
