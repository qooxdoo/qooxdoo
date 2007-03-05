/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

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
qx.Class.define("apiviewer.InfoView",
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
    this.setPadding(10);
    this.setEdge(0);
    this.setHtmlProperty("id", "ClassViewer");
    
    this.addEventListener("appear", this._showHtml, this);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members : 
  {
		_showHtml : function()
		{
			var TreeUtil = apiviewer.TreeUtil;
			var legend = [
				{
					icon: TreeUtil.ICON_PACKAGE,
					desc: "<h3>Package</h3>"
				},
				{
					icon: TreeUtil.ICON_CLASS,
					desc: "<h3>Class</h3>"
				},
				{
					icon: TreeUtil.ICON_CLASS_STATIC,
					desc: "<h3>Static Class</h3>"					
				},
				{
					icon: TreeUtil.ICON_CLASS_ABSTRACT,
					desc: "<h3>Abstract Class</h3>"
				},
				{
					icon: TreeUtil.ICON_CLASS_SINGLETON,
					desc: "<h3>Singleton Class</h3>"
				},
				{
					icon: TreeUtil.ICON_INTERFACE,
					desc: "<h3>Interface</h3>"
				},
				{
					icon: TreeUtil.ICON_MIXIN,
					desc: "<h3>Mixin</h3>"
				},
				{
					icon: TreeUtil.ICON_METHOD_PUB,
					desc: "<h3>Public Method</h3>"
				},
				{
					icon: TreeUtil.ICON_METHOD_PROT,
					desc: "<h3>Protected Method</h3>"
				},							
				{
					icon: TreeUtil.ICON_PROPERTY,
					desc: "<h3>Property</h3>"
				},
				{
					icon: TreeUtil.ICON_EVENT,
					desc: "<h3>Event</h3>"
				},
				{
					icon: TreeUtil.ICON_CONSTANT,
					desc: "<h3>Constant</h3>"
				},
				
				
				{
					icon: TreeUtil.OVERLAY_WARN,
					desc: "Package/Class/Mixin/Interface is not fully documented"
				},
				{
					icon: TreeUtil.OVERLAY_ERROR,
					desc: "Method/Property/Event is not fully documented"
				},
				{
					icon: TreeUtil.OVERLAY_MIXIN,
					desc: "Method/Property is included from a mixin"
				},
				{
					icon: TreeUtil.OVERLAY_INHERITED,
					desc: "Method/Property/Event is inherited from one of the super classes"
				},
				{
					icon: TreeUtil.OVERLAY_OVERRIDDEN,
					desc: "Method/Property overwrites the Method/Property of the super class"
				}
				
			]

			var html = new qx.util.StringBuilder();
			html.add("<table id='DetailFrame' class='info'><tr><td class='icon'>");
			
			for (var i=0; i<legend.length; i++) {
				var entry = legend[i];
				html.add(apiviewer.ClassViewer.createImageHtml(entry.icon));
				html.add("</td><td class='text'>");
				html.add(entry.desc);
				html.add("</td></tr>");
				
				// if not last iteration
				if (i != legend.length -1) {
					html.add("<tr><td class='icon'>");
				}
			}
			
			html.add("</table>");
			
			this.setHtml(html.toString());
		}
  }
  
});