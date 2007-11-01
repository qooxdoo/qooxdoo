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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

qx.Class.define("feedreader.FeedParser",
{
  extend : qx.ui.basic.Terminator,

  statics :
  {
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

      if (json.channel) {
        items = this.normalizeRssFeed(json);
      } else if (json.entry) {
        items = this.normalizeAtomFeed(json);
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

        items.push(
        {
          title   : entry.title,
          author  : "",
          date    : entry.pubDate,
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

        items.push(
        {
          title   : entry.title,
          author  : entry.author.name,
          date    : entry.published || entry.created,
          content : entry.content,
          link    : entry.href,
          id      : i
        });
      }

      return items;
    }
  }
});
