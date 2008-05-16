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

/* ************************************************************************

#asset(qx/icon/Tango/16/actions/document-new.png)
#asset(qx/icon/Tango/16/actions/dialog-apply.png)
#asset(qx/icon/Oxygen/16/actions/document-new.png)
#asset(qx/icon/Oxygen/16/actions/dialog-apply.png)

************************************************************************ */

/**
 * Add new feed window
 */
qx.Class.define("feedreader.view.AddFeedWindow",
{
  extend : qx.ui.window.Window,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param controller {feedreader.Application} The main application class
   */
  construct : function(controller)
  {
    this.base(arguments, "Add a feed", "icon/16/actions/document-new.png");

    // Establish controller link
    this._controller = controller;

    // set the properties of the window
    this.set(
    {
      modal         : true,
      showMinimize  : false,
      showMaximize  : false,
      allowMaximize : false
    });

    // set the paddings
    this.getChildrenContainer().setPadding(16);
    this.getChildrenContainer().setPaddingBottom(10);

    // Create the content with a helper
    this._addContent();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    /**
     * Adds the content of the window.
     */
    _addContent : function()
    {
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);
      this.setLayout(layout);

      var titleLabel = new qx.ui.basic.Label("Title:");
      var titleTextfield = this._titleTextfield = new qx.ui.form.TextField();
      var urlLabel = new qx.ui.basic.Label("URL:");
      var urlTextField = this._urlTextfield = new qx.ui.form.TextField();
      urlTextField.setWidth(250);

      this.add(titleLabel, {row: 0, column: 0});
      this.add(titleTextfield, {row: 0, column: 1});
      this.add(urlLabel, {row: 1, column: 0});
      this.add(urlTextField, {row: 1, column: 1});

      var addButton = new qx.ui.form.Button("Add", "icon/16/actions/dialog-apply.png");
      addButton.set({
        alignX     : "right",
        allowGrowX : false,
        minWidth   : 80
      });

      this.add(addButton, {row: 2, column: 0, colSpan: 2});
      addButton.addListener("execute", this._addFeed, this);
    },


    /**
     * Handles button clicks on 'Add' button
     *
     * @param e {qx.event.type.Event} Execute event
     */
    _addFeed : function(e)
    {
      var title = this._titleTextfield.getValue();
      var url = this._urlTextfield.getValue();

      // break if no title is given
      if (title == "")
      {
        alert("Please enter a title.");
        return;
      }

      // break if no url is given
      if (url == "")
      {
        alert("Please enter a url.");
        return;
      }

      this._controller.addFeed(title, url);
      this.close();
    }
  }
});
