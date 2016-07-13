/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Tino Butz (tbtz)

************************************************************************ */
/**
 * Mobile page responsible for shoing a single article.
 * @require(qx.module.Attribute)
 */
qx.Class.define("feedreader.view.mobile.ArticlePage",
{
  extend : qx.ui.mobile.page.NavigationPage,


  construct : function()
  {
    this.base(arguments, false);
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
      var articleGroup = new qx.ui.mobile.form.Group([this.__article]);
      this.getContent().add(articleGroup);
    },


    // property apply
    _applyArticle : function(value, old)
    {
      if (value != null)
      {
        this.setTitle(value.getTitle());
        var html = feedreader.ArticleBuilder.createHtml(value);
        this.__article.setHtml(html);

        q("a").setAttribute("target", "_blank");
      }

    }
  }
});