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
     * Sebastian Werner (wpbasti)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This widgets displays a feed article
 */
qx.Class.define("feedreader.view.desktop.Article",
{
  extend : qx.ui.embed.Html,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Include CSS file
    if (!feedreader.view.desktop.Article.__styleSheetIncluded)
    {
      feedreader.view.desktop.Article.__styleSheetIncluded = true;
      var uri = qx.util.ResourceManager.getInstance().toUri("feedreader/css/reader.css");
      qx.bom.Stylesheet.includeFile(uri);
    }

    // Configure
    this.setCssClass("blogEntry");
    this.setOverflowY("auto");
    this.setBackgroundColor("white")
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The current article.
     */
    article :
    {
      apply    : "_applyArticle",
      nullable : true,
      check    : "Object"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property apply
    _applyArticle : function(value, old)
    {
      // set the given article to html
      var html = feedreader.ArticleBuilder.createHtml(this.getArticle(), true);
      this.setHtml(html);

      // flush all elements (needed to access the content of the dom element)
      qx.html.Element.flush();

      // get the dom element containing the html of the article
      var element = this.getContentElement().getDomElement();

      // get all links
      var links = element.getElementsByTagName("a");

      // set the targets of all links to _blank
      for (var i = 0; i < links.length; i++) {
        links[i].target = "_blank";
      }
    }
  }
});
