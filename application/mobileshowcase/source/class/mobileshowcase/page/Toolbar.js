/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Gabriel Munteanu (gabios)

************************************************************************ */

/* ************************************************************************


************************************************************************ */
/**
 * Mobile page responsible for showing the different showcases.
 *
 * @asset(mobileshowcase/icon/camera.png)
 */
qx.Class.define("mobileshowcase.page.Toolbar",
{
  extend : mobileshowcase.page.Abstract,


  statics : {
    __toolbarButtonImages: ["mobileshowcase/icon/arrowleft.png","mobileshowcase/icon/camera.png"]
  },


  construct : function()
  {
    this.base(arguments,false);
    this.setTitle("Toolbar");
  },


  events :
  {
    /** The page to show */
    "show" : "qx.event.type.Data"
  },


  members :
  {

    /**
     * The toolbar
     */
    __toolbar : null,
    __searchPopup: null,
    __busyIndicator: null,
    __areYouSurePopup: null,
    __searchDialog: null,
    __deleteDialog: null,
    __goBackBtn: null,
    __loadButton: null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var label = new qx.ui.mobile.form.Title("Search");
      this.getContent().add(label);

      var toolbar = this.__toolbar = new qx.ui.mobile.toolbar.ToolBar();
      this.add(toolbar);

      var searchBtn = new qx.ui.mobile.toolbar.Button("Search");
      searchBtn.addListener("tap", function() {
        var searchDialog = this.__createSearchDialog();
        searchDialog.show();
      }, this);

      this.__goBackBtn = new qx.ui.mobile.toolbar.Button(
        null, mobileshowcase.page.Toolbar.__toolbarButtonImages[0]
      );
      this.__goBackBtn.setShow("icon");

       this.__goBackBtn.addListener("tap", function(){
        var popup = this.__createAreYouSurePopup( this.__goBackBtn);
        popup.show();
      }, this);

      this.__loadButton = new qx.ui.mobile.toolbar.Button(
        null, mobileshowcase.page.Toolbar.__toolbarButtonImages[1]
      );
      this.__loadButton.setShow("icon");

      this.__loadButton.addListener("tap", function(){
        var popup = this.__createSearchPopup();
        popup.show();
        qx.lang.Function.delay(popup.hide, 3000, popup);
      }, this);


      var deleteButton = new qx.ui.mobile.toolbar.Button("Delete");
      deleteButton.addListener("tap", function(){
        this.__deleteDialog = qx.ui.mobile.dialog.Manager.getInstance().warning('Deleting', 'Are you sure?', this.__processDelete, this, ["Yes", "No"]);
      }, this);

      toolbar.add(searchBtn);
      toolbar.add(this.__goBackBtn);
      toolbar.add(this.__loadButton);
      toolbar.add(deleteButton);
    },


    __processDelete : function(index)
    {
      if(index==0) {
        this.__deleteDialog.destroy();
      } else {
        this.__deleteDialog.destroy();
      }
    },


    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createAreYouSurePopup : function(anchor)
    {
      if(this.__areYouSurePopup) {
        return this.__areYouSurePopup;
      }
      var buttonsWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());

      var okButton = new qx.ui.mobile.form.Button("Yes");
      var cancelButton = new qx.ui.mobile.form.Button("No");

      buttonsWidget.add(okButton, {flex:1});
      buttonsWidget.add(cancelButton, {flex:1});

      okButton.addListener("tap", function(){
        this.__areYouSurePopup.hide();
      }, this);

      cancelButton.addListener("tap", function(){
        this.__areYouSurePopup.hide();
      }, this);

      this.__areYouSurePopup = new qx.ui.mobile.dialog.Popup(buttonsWidget, anchor);
      this.__areYouSurePopup.setTitle("Are you sure?");
      return this.__areYouSurePopup;
    },

    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createSearchPopup : function(attachedToWidget)
    {
      if(this.__searchPopup) {
        return this.__searchPopup;
      }
      var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Data connection...");
      this.__searchPopup = new qx.ui.mobile.dialog.Popup(busyIndicator, attachedToWidget);
      this.__searchPopup.setTitle("Loading...");
      return this.__searchPopup;
    },

    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createSearchDialog : function()
    {
      if(this.__searchDialog) {
        return this.__searchDialog;
      }
      var popupWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());

      var searchField = new qx.ui.mobile.form.TextField();
      searchField.addListener("keydown", function(evt) {
        if (evt.getKeyIdentifier() == "Enter") {
          this.__searchDialog.hide();
          searchField.blur();
        }
      }.bind(this));

      var searchButton = new qx.ui.mobile.form.Button("Search");
      searchButton.addListener("tap", function(){
        this.__searchDialog.hide();
      }, this);

      popupWidget.add(searchField);
      popupWidget.add(searchButton);

      this.__searchDialog = new qx.ui.mobile.dialog.Popup(popupWidget);
      this.__searchDialog.setHideOnBlockerTap(true);
      this.__searchDialog.setModal(true);
      this.__searchDialog.setTitle('Search ...');
      return this.__searchDialog;
    },


    // overridden
    _stop : function() {
      if (this.__deleteDialog) {
        this.__deleteDialog.hide();
      }
      if (this.__areYouSurePopup) {
        this.__areYouSurePopup.hide();
      }
      if (this.__searchPopup) {
        this.__searchPopup.hide();
      }
      if (this.__searchDialog) {
        this.__searchDialog.hide();
      }
    }
  }
});
