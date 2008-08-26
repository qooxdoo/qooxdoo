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
 * Date data model for a news feed
 */
qx.Class.define("feedreader.model.Feed",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param title {String} feed title
   * @param url {String} feed url
   * @param category {String?""} feed category
   */
  construct: function(title, url, category)
  {
    this.base(arguments);

    this.set({
      url: url,
      title: title,
      category : category || ""
    });

    // {Array} Internal article list
    this.__articles = [];
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** fired when a new article was added */
    "add" : "qx.event.type.DataEvent",

    /** fired when an articles was removed */
    "remove" : "qx.event.type.DataEvent"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The selected article */
    selected :
    {
      check : "feedreader.model.Article",
      nullable : true,
      init : null,
      event : "change"
    },


    /** The feed URL */
    url :
    {
      check : "String",
      event : "dataModified"
    },


    /** The feed title */
    title :
    {
      check : "String",
      event : "dataModified"
    },


    /** The feed category */
    category :
    {
      check : "String",
      init : "",
      event : "dataModified"
    },


    /** The current loading state */
    state :
    {
      check : ["new", "loading", "loaded", "error"],
      init : "new",
      event : "stateModified"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** 
     * Clear all articles
     */
    clearArticles : function()
    {
      var list = this.__articles;
      for (var i=0, l=list.length; i<l; i++) 
      {
        this.fireDataEvent("remove", list[i]);
        list[i].dispose();
      }
      
      // Clear array
      list.length = 0;
      
      // Clear selection
      this.resetSelected();
    },
    
    
    /**
     * Remove the article to the feed
     *
     * @param article {feedreader.model.Article} article to remove
     */
    removeArticles : function(article)
    {
      qx.lang.Array.remove(this.__articles, article);
      this.fireDataEvent("remove", article);
    },
    
    
    /**
     * Add an article to the feed
     *
     * @param article {feedreader.model.Article} article to add
     */
    addArticle : function(article)
    {
      this.__articles.push(article);
      this.fireDataEvent("add", article);
    },


    /**
     * Get all articles
     *
     * @return {feedreader.model.Article[]} a list of all articles in the feed
     */
    getArticles : function() {
      return this.__articles;
    }
  },
  
  
  
  /*
   *****************************************************************************
      DESTRUCTOR
   *****************************************************************************
   */
  
  destruct : function()
  {
    this._disposeArray("__articles");
  }
});