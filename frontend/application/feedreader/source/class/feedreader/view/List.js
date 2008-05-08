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

qx.Class.define("feedreader.view.List",
{
  extend : qx.ui.form.List,


  construct : function(controller)
  {
    this.base(arguments);
    // Establish controller link
    this._controller = controller;
    
    // set the properties of the list
    this.setSelectionMode("single");
    this.setDecorator(null);
    this.setMinHeight(100);

    // Add selection listener
    this.addListener("change", this._onChangeSelection, this);
  },


  members :
  {    
    
    /**
     * Event handler for the change event of the selection.
     * 
     * @param e {qx.event.type.Data} The data event of the list managers change. 
     */
    _onChangeSelection : function(e)
    {
      // get the selected item
      var item = e.getData()[0];
      // get the selected feed
      var feed = this._controller.getSelectedFeed();

      // If this is undefined, the data is not yet ready...
      if (item)
      {
        // tell the controller to set the selected article
        var id = item.getUserData("id");
        this._controller.setSelectedArticle(feed.items[id]);
      }
    }
  }
});
