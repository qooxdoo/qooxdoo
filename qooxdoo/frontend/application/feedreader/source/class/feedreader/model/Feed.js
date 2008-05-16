qx.Class.define("feedreader.model.Feed",
{
  extend : qx.core.Object,

  construct: function(title, url, category)
  {
    this.base(arguments);
    this.set({
      url: url,
      title: title,
      category : category || ""
    });

    this.__articles = [];
  },

  events : {
    "change" : "qx.event.type.Event"
  },

  properties :
  {
    selected :
    {
      check : "feedreader.model.Article",
      nullable : true,
      init : null,
      event : "changeSelected"
    },

    url :
    {
      check : "String",
      event : "change"
    },

    title :
    {
      check : "String",
      event : "change"
    },

    category :
    {
      check : "String",
      init : "",
      event : "change"
    },

    status :
    {
      check : ["new", "loading", "loaded", "error"],
      init : "new",
      event : "changeStatus"
    }
  },


  members :
  {
    addArticle : function(article)
    {
      this.__articles.push(article);
      this.fireEvent("change");
    },

    getArticles : function() {
      return this.__articles;
    }
  }
});