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
     * Tino Butz (tbtz)

************************************************************************ */
/**
 * Mobile page responsible for shoing a single article.
 */
qx.Class.define("feedreader.view.mobile.ArticlePage",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments);
    this.setShowBackButton(true);
    this.setBackButtonText(this.tr("Back"));
  },


  properties : {
    /**
     * The article which should be shown.
     */
    article : {
      event : "changeArticle",
      init : null,
      nullable : true,
      apply : "_applyArticle"
    }
  },


  members :
  {
    __article : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // add the article embed
      this.__article = new qx.ui.mobile.embed.Html();
      this.__article.addCssClass("whitearea");
      this.getContent().add(this.__article);
    },


    // property apply
    _applyArticle : function(value, old)
    {
      if (value != null)
      {
        this.setTitle(value.getTitle());
        var html = feedreader.ArticleBuilder.createHtml(value);
        this.__article.setHtml(html);
      }
    }
  }
});