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

************************************************************************ */

/**
 * Helper class to convert JSON feed data to an application
 * useable JavaScript array.
 */
qx.Class.define("feedreader.io.FeedParser",
{
  statics :
  {
    /** {qx.util.format.DateFormat} 1st RSS data format standard */
    _rssDate1 : new qx.util.format.DateFormat("EEE, d MMM yyyy HH:mm:ss Z", "en_US"),

    /** {qx.util.format.DateFormat} 2nd RSS data format standard */
    _rssDate2 : new qx.util.format.DateFormat("EEE, d MMM yyyy HH:mm:ss z", "en_US"),

    /** {qx.util.format.DateFormat} 1st Atom data format standard */
    _atomDate1 : new qx.util.format.DateFormat("yyyy-MM-d'T'HH:mm:ss'Z'", "en_US"),

    /** {qx.util.format.DateFormat} 2nd Atom data format standard */
    _atomDate2 : new qx.util.format.DateFormat("yyyy-MM-d'T'HH:mm:ssZ", "en_US"),


    /**
     * Parses a json converted feed into an normalized easily
     * useable list of posts.
     *
     * Automatically detects Atom and RSS feeds.
     *
     * @param json {Object} Incoming json data
     * @return {Map[]} List of posts
     */
    parseFeed : function(json)
    {
      var items = [];

      if (json)
      {
        if (json.channel) {
          items = this._normalizeRssFeed(json);
        } else if (json.entry) {
          items = this._normalizeAtomFeed(json);
        } else {
          throw new Error("Unknown feed format!");
        }
      }
      else
      {
        throw new Error("Invalid json: " + json);
      }

      return items;
    },


    /**
     * Converts json RSS channel list to JavaScript array.
     * Also parses date of RSS feed to a JavaScript date object.
     *
     * @param json {Object} Incoming json data
     * @return {Map[]} List of posts
     */
    _normalizeRssFeed : function(json)
    {
      var articles = [];

      for (var i=0, a=json.channel.item, l=a.length; i<l; i++)
      {
        var entry = a[i];
        var date = entry.pubDate;

        try {
          date = this._rssDate1.parse(date);
        }
        catch(ex)
        {
          try {
            date = this._rssDate2.parse(date);
          }
          catch(ex1) {}
        }

        // Handle parse problems
        if (!(date instanceof Date))
        {
          throw new Error("RSS Date Error: " + date);
          date = null;
        }

        var article = new feedreader.model.Article();
        article.set({
          title : entry.title || null,
          author : "",
          date : date,
          content : entry.description || null,
          link : entry.link || null
        });
        articles.push(article)
      }

      return articles;
    },


    /**
     * Converts json atom entry list to JavaScript array.
     * Also parses date of atom feed to a JavaScript date object.
     *
     * @param json {Object} Incoming json data
     * @return {Map[]} List of posts
     */
    _normalizeAtomFeed : function(json)
    {
      var articles = [];

      for (var i=0, a=json.entry, l=a.length; i<l; i++)
      {
        var entry = a[i];
        var date = entry.updated || entry.published || entry.created;

        try {
          date = this._atomDate1.parse(date);
        }
        catch(ex)
        {
          try {
            date = this._atomDate2.parse(date);
          } catch(ex2) {}
        }

        // Handle parse problems
        if (!(date instanceof Date))
        {
          throw new Error("Atom Date Error: " + date);
          date = null;
        }

        var article = new feedreader.model.Article();
        article.set({
          title : entry.title || entry.summary || null,
          author : entry.author ? entry.author.name || null : null,
          date : date,
          content : entry.content || entry.summary || null,
          link : entry.link["@attributes"] ? entry.link["@attributes"].href || null : null
        });

        articles.push(article);
      }

      return articles;
    }
  }
});
