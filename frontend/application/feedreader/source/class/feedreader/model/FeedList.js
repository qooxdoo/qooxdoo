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
 * Date data model for a news feed list
 */
qx.Class.define("feedreader.model.FeedList",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    this.__feeds = [];
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** fired on data changes in the feed model */
    "change" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The selected feed */
    selected :
    {
      check : "feedreader.model.Feed",
      nullable : true,
      init : null,
      event : "changeSelected"
    }
  },

  members :
  {
    /**
     * Get all feeds from the list
     *
     * @return {feedreader.model.Feed[]} a list of all feeds.
     */
    getFeeds : function() {
      return qx.lang.Object.getValues(this.__feeds);
    },


    /**
     * Add a feed to the list
     *
     * @param feed {feedreader.model.Feed} feed to add
     */
    addFeed : function(feed)
    {
      this.__feeds.push(feed);
      this.fireEvent("change");
    },


    /**
     * Remove a feed from the list
     *
     * @param feed {feedreader.model.Feed} feed to remove
     */
    removeFeed : function(feed)
    {
      qx.lang.Array.remove(this.__feeds, feed);

      if (this.getSelected() == feed) {
        this.setSelected(null);
      }
      this.fireEvent("change");
    }
  }
})