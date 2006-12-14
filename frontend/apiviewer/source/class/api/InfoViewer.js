/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(api)

************************************************************************ */

/**
 * Shows the class details.
 */
qx.OO.defineClass("apiviewer.InfoViewer", qx.ui.embed.HtmlEmbed,
function() {
  qx.ui.embed.HtmlEmbed.call(this);

  this.setOverflow("auto");
  this.setPadding(20);
  this.setEdge(0);
  this.setHtmlProperty("id", "InfoViewer");
  this.setVisibility(false);

  apiviewer.InfoViewer.instance = this;
});

qx.Proto.showInfo = function(classNode)
{
  var vHtml = "";

  // Title
  vHtml += '<h1>';
  vHtml += '<div class="pkgtitle">package</div>';
  vHtml += classNode.attributes.fullName;
  vHtml += '</h1>';

  // TODO: Overview of classes in this package

  // Apply HTML
  this.setHtml(vHtml);
}
