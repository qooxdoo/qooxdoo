/*
#module(api)
*/

/**
 * Shows the class details.
 */
qx.OO.defineClass("api.InfoViewer", qx.ui.embed.HtmlEmbed,
function() {
  qx.ui.embed.HtmlEmbed.call(this);

  this.setOverflow("auto");
  this.setPadding(20);
  this.setEdge(0);
  this.setHtmlProperty("id", "InfoViewer");
  this.setVisibility(false);

  api.InfoViewer.instance = this;
});

qx.Proto.showInfo = function(classNode)
{
  this.setHtml("TEST: " + classNode.attributes.fullName);
}
