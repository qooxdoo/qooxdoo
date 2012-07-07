/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Data model for a feed folder.
 */
qx.Class.define("feedreader.model.FeedFolder",
{
  extend : qx.core.Object,

  /**
   * @param title {String} The name of the folder.
   */
  construct : function(title)
  {
    this.base(arguments);

    this.setTitle(title);
    this.setFeeds(new qx.data.Array());
  },

  properties :
  {
    /** Title / Name of the item */
    title :
    {
      check : "String",
      event : "changeTitle",
      init: "Folder"
    },


    /** The feed category */
    category :
    {
      check : "String",
      init : "",
      event : "dataModified"
    },


    /** Array of feeds. This could contain another feed folder or a feed. */
    feeds :
    {
      check : "qx.data.Array",
      event: "changeFeeds"
    },


    /** Array of articles. This is needed for the data binding. */
    articles :
    {
      check : "qx.data.Array",
      event : "changeArticles",
      init: new qx.data.Array()
    },


    /** The loading state of the folder. Needed for data binding. */
    state :
    {
      check : ["new", "loading", "loaded", "error"],
      init : "null",
      event : "stateModified"
    }
  }
});
