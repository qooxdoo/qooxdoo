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
    this.base(arguments, this.tr("Add a feed"), "icon/16/actions/document-new.png");

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
      this.setLayout(new qx.ui.layout.VBox(10));
      
      var contentContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      contentContainer.set({
        appearance : "window-pane-content",
        padding    : 8
      });
      this.add(contentContainer);
      
      var groupBox = new qx.ui.groupbox.GroupBox(this.tr("Feed Information"));
      contentContainer.add(groupBox);

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);
      groupBox.setLayout(layout);

      var titleLabel = new qx.ui.basic.Label(this.tr("Title:"));
      var titleTextfield = this._titleTextfield = new qx.ui.form.TextField();

      var urlLabel = new qx.ui.basic.Label(this.tr("URL:"));
      var urlTextField = this._urlTextfield = new qx.ui.form.TextField();

      groupBox.add(titleLabel, {row: 0, column: 0});
      groupBox.add(titleTextfield, {row: 0, column: 1});
      groupBox.add(urlLabel, {row: 1, column: 0});
      groupBox.add(urlTextField, {row: 1, column: 1});

      // Increase width
      urlTextField.setWidth(200);

      // Right aligned button
      var addButton = new qx.ui.form.Button("Add", "icon/16/actions/dialog-apply.png");
      addButton.set({
        alignX     : "right",
        allowGrowX : false
      });

      this.add(addButton);
      addButton.addListener("execute", this._addFeed, this);
    },


    /**
     * Handles button clicks on 'Add' button
     *
     * @param e {qx.event.type.Event} Execute event
     */
    _addFeed : function(e)
    {
      // break if no title is given
      var title = this._titleTextfield.getValue();
      if (title == "")
      {
        alert(this.tr("Please enter a title."));
        return;
      }

      // break if no url is given
      var url = this._urlTextfield.getValue();
      if (url == "")
      {
        alert(this.tr("Please enter a url."));
        return;
      }

      this._controller.addFeed(title, url);
      this.close();
    }
  }
});
