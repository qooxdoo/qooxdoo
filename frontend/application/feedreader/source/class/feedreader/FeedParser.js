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

qx.Class.define("feedreader.FeedParser",
{
  statics :
  {
    _rssDate1 : new qx.util.format.DateFormat("EEE, d MMM yyyy HH:mm:ss Z", "en_US"),
    _rssDate2 : new qx.util.format.DateFormat("EEE, d MMM yyyy HH:mm:ss z", "en_US"),
    _atomDate1 : new qx.util.format.DateFormat("yyyy-MM-d'T'HH:mm:ss'Z'", "en_US"),
    _atomDate2 : new qx.util.format.DateFormat("yyyy-MM-d'T'HH:mm:ssZ", "en_US"),


    /**
     * TODOC
     *
     * @type static
     * @param json {var} TODOC
     * @return {var} TODOC
     */
    parseFeed : function(json)
    {
      var items = [];

      if (json)
      {
        if (json.channel) {
          items = this.normalizeRssFeed(json);
        } else if (json.entry) {
          items = this.normalizeAtomFeed(json);
        }
      }

      return items;
    },


    /**
     * TODOC
     *
     * @type static
     * @param json {var} TODOC
     * @return {var} TODOC
     */
    normalizeRssFeed : function(json)
    {
      var items = [];

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
          } catch(ex1) {}
        }

        // Handle parse problems
        if (!(date instanceof Date))
        {
          // console.debug("RSS Date Error: " + date);
          date = null;
        }

        items.push(
        {
          title   : entry.title,
          author  : "",
          date    : date,
          content : entry.description,
          link    : entry.link,
          id      : i
        });
      }

      return items;
    },


    /**
     * TODOC
     *
     * @type static
     * @param json {var} TODOC
     * @return {var} TODOC
     */
    normalizeAtomFeed : function(json)
    {
      var items = [];

      for (var i=0, a=json.entry, l=a.length; i<l; i++)
      {
        var entry = a[i];
        var date = entry.published || entry.created;

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
          // console.debug("ATOM Date Error: " + date);
          date = null;
        }

        items.push(
        {
          title   : entry.title,
          author  : entry.author.name,
          date    : date,
          content : entry.content,
          link    : entry.href,
          id      : i
        });
      }

      return items;
    }
  }
});
