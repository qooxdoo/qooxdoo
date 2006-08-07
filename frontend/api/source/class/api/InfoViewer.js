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
  this.setBorder(qx.renderer.border.BorderPresets.horizontalDivider);
  this.setBackgroundColor("white");
  this.setHtmlProperty("id", "InfoViewer");
  this.setVisibility(false);

  api.InfoViewer.instance = this;
});