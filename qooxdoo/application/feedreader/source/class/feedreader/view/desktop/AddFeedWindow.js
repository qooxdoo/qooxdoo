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

************************************************************************ */

/**
 * Add new feed window
 */
qx.Class.define("feedreader.view.desktop.AddFeedWindow",
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
    this.__controller = controller;

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
    // private members
    __urlTextfield : null,
    __titleTextfield : null,
    __controller : null,
    __form : null,

    /**
     * Adds the content of the window.
     */
    _addContent : function()
    {
      this.setLayout(new qx.ui.layout.VBox(10));

      // create a form
      this.__form = new qx.ui.form.Form();
      // set the headline of the form
      this.__form.addGroupHeader(this.tr("Feed Information"));

      // add the title textfield
      this.__titleTextfield = new qx.ui.form.TextField().set({
        required: true,
        width: 250
      });
      this.__form.add(this.__titleTextfield, this.tr("Title"));

      // add the url textfield
      this.__urlTextfield = new qx.ui.form.TextField().set({required: true});
      this.__form.add(this.__urlTextfield, this.tr("URL"), qx.util.Validate.checkUrl);

      // add the button
      var addButton = new qx.ui.form.Button(this.tr("Add"), "icon/16/actions/dialog-apply.png");
      addButton.set({
        alignX     : "right",
        allowGrowX : false
      });
      addButton.addListener("execute", this._addFeed, this);
      this.__form.addButton(addButton);

      //when pressing enter on textfields, try to add the feed
      this.addListener("keypress", function(e) {
        if (e.getTarget() instanceof qx.ui.form.TextField &&
            e.getKeyIdentifier() === "Enter") {
          this._addFeed();
        }
      });

      // use a placeholder rendere to render the form
      this.add(new qx.ui.form.renderer.SinglePlaceholder(this.__form));
    },


    /**
     * Handles button clicks on 'Add' button or/and
     * pressing enter key on textfields
     *
     * @param e {qx.event.type.Event} Execute event
     */
    _addFeed : function(e)
    {
      if (this.__form.validate()) {
        var title = this.__titleTextfield.getValue();
        var url = this.__urlTextfield.getValue();
        this.__controller.addFeed(title, url, "user");

        // clear the content of th window
        this.__titleTextfield.setValue("");
        this.__urlTextfield.setValue("");

        this.close();
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__commands = null;
    this._disposeObjects(
      "__controller", "__titleTextfield", "__urlTextfield", "this.__form"
    );
  }
});
