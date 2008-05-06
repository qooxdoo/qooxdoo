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

qx.Class.define("feedreader.view.List",
{
  extend : qx.ui.form.List,

  construct : function(controller)
  {
    this.base(arguments);
    // Establish controller link
    this._controller = controller;
    
    this.setSelectionMode("single");
    this.setDecorator(null);
    this.setMinHeight(100);

    l = this;
    // Add selection listener
    // this.getSelectionModel().addListener("changeSelection", this._onChangeSelection, this);
  },

  members :
  {
    
    test : function() {
      var feed = this._controller.getSelectedFeed();
      // var itemId = feed.items[0];
      // feed.selected = itemId;
      this._controller.setSelectedArticle(feed.items[1]);
    },
    
    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onChangeSelection : function(e)
    {
      var selectedEntry = this.getSelectionModel().getAnchorSelectionIndex();
      var feed = this._controller.getSelectedFeed();

      if (selectedEntry >= 0)
      {
        var itemData = this.getTableModel().getRowData(selectedEntry);

        // If this is undefined, the data is not yet ready...
        if (itemData)
        {
          var itemId = itemData[2];

          feed.selected = itemId;
          this._controller.setSelectedArticle(feed.items[itemId]);
        }
      }
    }
  }
});
