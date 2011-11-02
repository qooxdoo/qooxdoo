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

************************************************************************ */
/**
 * This class is a static helper responsible for formating an loaded article
 * model to a HTML output.
 */
qx.Class.define("feedreader.ArticleBuilder",
{
  statics:
  {
    /**
     * Helper method which uses the set article and builds
     * a html view of it. Ths string containing the html will
     * be returned.
     * If no article is set, an emptys string will be returned.
     *
     * @param article {qx.core.Object} The article model.
     * @param withTitle {Boolean} <code>true</code> if the title should
     *   be included in the HTML.
     * @return {String} The formated article as a html string.
     */
    createHtml : function(article, withTitle) {
      // return an empty string if no article is set
      if (!article) {
        return "";
      }

      // build the article html using a StringBuilder
      var html = new qx.util.StringBuilder();

      // some of the values may be missing
      var date = (article.getPubDate && article.getPubDate()) || "";

      // normalize the content
      var description = "";
      if (article.getDescription) {
        description = article.getDescription();
      } else if (article.getContent) {
        description = article.getContent().getContent && article.getContent().getContent();
      }

      // link handling
      var link = article.getLink();
      if (link.getHref) {
        link = link.getHref();
      } else if (link instanceof qx.data.Array) {
        link = link.getItem(0).getHref();
      }

      html.add("<div class='container'>");
      if (withTitle) {
        html.add("<h1 class='blog'>", article.getTitle(), "</h1>");
      }
      html.add("<div class='date'>", date, "</div>");
      html.add("<div class='description'>", description, "</div>");
      html.add("<a target='_blank' href='", link, "'>read more ...</a>");
      html.add("</div>");

      return html.get();
    }
  }
});
