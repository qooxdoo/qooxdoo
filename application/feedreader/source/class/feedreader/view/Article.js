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
qx.Class.define("feedreader.view.Article",
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

    // Configure
    this.setCssClass("blogEntry");
    this.setOverflowY("auto");
    this.setBackgroundColor("#FFFDED");

    var font = new qx.bom.Font(14, [ "Candara", "Verdana", "sans-serif" ]);
    font.setLineHeight(1.8);
    this.setFont(font);
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
      var html = this.__getArticleHtml();
      this.setHtml(html);

      // flush all elements (neede to access the content of the dom element)
      qx.html.Element.flush();

      // get the dom element containing the html of the article
      var element = this.getContentElement().getDomElement();

      // get all links
      var links = element.getElementsByTagName("a");

      // set the targets of all links to _blank
      for (var i = 0; i < links.length; i++) {
        links[i].target = "_blank";
      }
    },


    /**
     * Helper method which uses the set article and builds
     * a html view of it. Ths string containing the html will
     * be returned.
     * If no article is set, an emptys string will be returned.
     *
     * @return {String} The formated article as a html string.
     */
    __getArticleHtml : function()
    {
      // get the article
      var article = this.getArticle();

      // return an empty string if no article is set
      if (!article) {
        return "";
      }

      // build the article html using a StringBuilder
      var html = new qx.util.StringBuilder();

      html.add("<div class='container'>");
      html.add("<h1 class='blog'>", article.getTitle(), "</h1>");
      html.add("<div class='date'>", article.getDate(), "</div>");
      html.add("<div class='description'>", article.getContent(), "</div>");
      html.add("<a target='_blank' href='", article.getLink(), "'>read more ...</a>");
      html.add("</div>");

      return html.get();
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    // Include CSS file
    qx.bom.Stylesheet.includeFile("feedreader/css/reader.css");
  }
});
