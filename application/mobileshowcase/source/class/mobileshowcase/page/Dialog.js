/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Mobile page responsible for showing all dialog widgets available:
 * - Dialog
 * - Popup
 * - Confirm dialogs
 * - Anchor dialogs
 */
qx.Class.define("mobileshowcase.page.Dialog",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments);
    this.setTitle("Dialog Widgets");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    __anchorpopup: null,

    __popup: null,

    __dialogpopup: null,

    __busypopup: null,

    __menu: null,

    __modaldialogpopup: null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      // CLOSING BUTTONS
      var closeDialogButton1 = new qx.ui.mobile.form.Button("Close Dialog");
      closeDialogButton1.addListener("tap", this._stop, this);

      var closeDialogButton2 = new qx.ui.mobile.form.Button("Close Dialog");
      closeDialogButton2.addListener("tap", this._stop, this);

      // EXAMPLE WIDGETS
      var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait...");
      this.__busypopup = new qx.ui.mobile.dialog.Popup(busyIndicator);
      this.__busypopup.setTitle("Loading...");

      // DEFAULT POPUP
      this.__popup = new qx.ui.mobile.dialog.Popup(closeDialogButton1);
      this.__popup.setTitle("A Popup");

      // MODAL DIALOG
      this.__modaldialogpopup = new qx.ui.mobile.dialog.Dialog(closeDialogButton2);
      this.__modaldialogpopup.setTitle("A Modal Dialog");

      // ANCHOR POPUP
      var showAnchorButton = new qx.ui.mobile.form.Button("Show Anchor Popup");
      showAnchorButton.addListener("tap", function(e) {
          this._stop();
          this.__anchorpopup.show();
      }, this);

      this.__anchorpopup = this.__createAnchorPopup(showAnchorButton);

      // MENU DIALOG
      var menuModel = new qx.data.Array(["Action 1", "Action 2", "Action 3"]);
      this.__menu = new qx.ui.mobile.dialog.Menu(menuModel);
      this.__menu.setTitle("Menu");

      // MENU
      var showDialogButton = new qx.ui.mobile.form.Button("Show Dialog");
      showDialogButton.addListener("tap", function(e) {
          this._stop();
          this.__dialogpopup.show();
      }, this);

      // MODAL DIALOG
      var showModalDialogButton = new qx.ui.mobile.form.Button("Show Modal Dialog");
      showModalDialogButton.addListener("tap", function(e) {
          this._stop();
          this.__modaldialogpopup.show();
      }, this);

      var showPopupButton = new qx.ui.mobile.form.Button("Show Popup");
      showPopupButton.addListener("tap", function(e) {
          this._stop();
          this.__popup.show();
      }, this);



      var i = 0;
      var busyIndicatorButton = new qx.ui.mobile.form.Button("Show/Hide Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        this._stop();
        if((i++%2)==0){
          this.__busypopup.show();
        } else {
          this.__busypopup.hide();
        }
      }, this);

      var showMenuButton = new qx.ui.mobile.form.Button("Show Menu");
      showMenuButton.addListener("tap", function(e) {
          this._stop();
          this.__menu.show();
      }, this);

      this.getContent().add(new qx.ui.mobile.form.Title("Dialog Widget Menu"));
      this.getContent().add(showModalDialogButton);
      this.getContent().add(showPopupButton);
      this.getContent().add(showAnchorButton);
      this.getContent().add(showMenuButton);
      this.getContent().add(busyIndicatorButton);
    },


    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createAnchorPopup : function(anchor)
    {
      if(this.__anchorpopup) {
        return this.__anchorpopup;
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
        this.__anchorpopup.hide();
      }, this);
      cancelButton.addListener("tap", function(){
        this.__anchorpopup.hide();
      }, this);

      this.__anchorpopup = new qx.ui.mobile.dialog.Popup(popupWidget, anchor);
      return this.__anchorpopup;
    },


    // overridden
    _stop : function() {
      if (this.__popup) {
        this.__popup.hide();
      }
      if (this.__anchorpopup) {
        this.__anchorpopup.hide();
      }
      if (this.__modaldialogpopup) {
        this.__modaldialogpopup.hide();
      }
      if (this.__busypopup) {
        this.__busypopup.hide();
      }
      if (this.__menu) {
        this.__menu.hide();
      }
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this._disposeObjects("__anchorpopup", "__modaldialogpopup","__popup","__dialogpopup","__busypopup","__menu");
    }
  }
});