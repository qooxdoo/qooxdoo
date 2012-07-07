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

#asset(mobileshowcase/icon/camera.png)

************************************************************************ */
/**
 * Mobile page responsible for showing the different showcases.
 */
qx.Class.define("mobileshowcase.page.Toolbar",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Toolbar");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
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

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var label = new qx.ui.mobile.form.Title("Search");
      this.getContent().add(label);

      var toolbar = this.__toolbar = new qx.ui.mobile.toolbar.ToolBar();
      this.add(toolbar); // getContent()
      var searchBtn = new qx.ui.mobile.toolbar.Button("Search");
      toolbar.add(searchBtn);
      searchBtn.addListener("tap", function(){

      var searchDialog = this.__createSearchDialog();
      searchDialog.show();
      }, this);
      toolbar.add(new qx.ui.mobile.toolbar.Separator());
      var goBackBtn = new qx.ui.mobile.toolbar.Button(null,"mobileshowcase/icon/arrowleft.png");
      toolbar.add(goBackBtn);
      goBackBtn.addListener("tap", function(){
        var popup = this.__createAreYouSurePopup(goBackBtn);
        popup.show();
      }, this);
      toolbar.add(new qx.ui.mobile.toolbar.Separator());

      var loadButton = new qx.ui.mobile.toolbar.Button("Take a new picture","mobileshowcase/icon/camera.png");
      loadButton.setIconPosition("top");
      loadButton.setGap(0);
      toolbar.add(loadButton);

      loadButton.addListener("tap", function(){
        var popup = this.__createSearchPopup();
        popup.show();
        qx.lang.Function.delay(popup.hide, 3000, popup);
      }, this);

      toolbar.add(new qx.ui.mobile.toolbar.Separator());
      var deleteButton = new qx.ui.mobile.toolbar.Button("Delete");
      toolbar.add(deleteButton);

      deleteButton.addListener("tap", function(){
        this.__deleteDialog = qx.ui.mobile.dialog.Manager.getInstance().warning('Deleting', 'Are you sure?', this.__processDelete, this, ["Yes", "No"]);
      }, this);
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
      var popupWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      popupWidget.add(new qx.ui.mobile.basic.Label("Are you sure?"));
      var buttonsWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      var okButton = new qx.ui.mobile.form.Button("Yes");
      var cancelButton = new qx.ui.mobile.form.Button("No");
      buttonsWidget.add(okButton, {flex:1});
      buttonsWidget.add(cancelButton, {flex:1});
      popupWidget.add(buttonsWidget);
      okButton.addListener("tap", function(){
        this.__areYouSurePopup.hide();
      }, this);
      cancelButton.addListener("tap", function(){
        this.__areYouSurePopup.hide();
      }, this);
      this.__areYouSurePopup = new qx.ui.mobile.dialog.Popup(popupWidget, anchor);
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
      popupWidget.add(new qx.ui.mobile.form.TextField());
      var searchButton = new qx.ui.mobile.form.Button("Search");
      popupWidget.add(searchButton);
      searchButton.addListener("tap", function(){
        this.__searchDialog.hide();
      }, this);
      this.__searchDialog = new qx.ui.mobile.dialog.Dialog(popupWidget);
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
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});