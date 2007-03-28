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
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Shows the package details.
 */
qx.Class.define("apiviewer.ui.PackageViewer",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.ui.embed.HtmlEmbed.call(this);

    this.setOverflow("auto");
    this.setPadding(20);
    this.setEdge(0);
    this.setHtmlProperty("id", "PackageViewer");
    this.setVisibility(false);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Shows information about a package
     *
     * @type member
     * @param classNode {apiviewer.dao.Package} package to display
     */
    showInfo : function(classNode)
    {
      var vHtml = "";

      // Title
      vHtml += '<h1>';
      vHtml += '<div class="pkgtitle">package</div>';
      vHtml += classNode.getFullName();
      vHtml += '</h1>';

      // TODO: Overview of classes in this package
      // Apply HTML
      this.setHtml(vHtml);
    }
  }
});
