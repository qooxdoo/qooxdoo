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
 * - Popup
 * - Confirm dialogs
 * - Anchor dialogs
 */
qx.Class.define("mobileshowcase.page.Dialog",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments,false);
    this.setTitle("Dialog Widgets");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");
  },


  members :
  {
    __anchorpopup : null,
    __popup : null,
    __dialogpopup : null,
    __busypopup : null,
    __menu : null,
    __picker : null,
    __anchoredMenu : null,
    __anchorMenu : null,
    __modaldialogpopup : null,
    __resultsLabel : null,
    

    // overridden
    _initialize : function()
    {
      this.base(arguments);
      
      this.__resultsLabel = new qx.ui.mobile.basic.Label("No events received so far.");
      var resultsGroup = new qx.ui.mobile.form.Group([this.__resultsLabel]);
      
      // CLOSING BUTTONS
      var closeDialogButton1 = new qx.ui.mobile.form.Button("Close Popup");
      closeDialogButton1.addListener("tap", this._stop, this);

      var closeDialogButton2 = new qx.ui.mobile.form.Button("Close Popup");
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
      this.__modaldialogpopup.setTitle("A Modal Popup");

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
      
      this.__menu.addListener("changeSelection", this.__onMenuChangeSelection, this);

      // PICKER DIALOG
      var showPickerButton = new qx.ui.mobile.form.Button("Show Picker");
      showPickerButton.addListener("tap", function(e) {
          this._stop();
          this.__picker.show();
      }, this);

      var pickerSlot1 = new qx.data.Array(["qx.Desktop", "qx.Mobile", "qx.Website","qx.Server"]);
      var pickerSlot2 = new qx.data.Array(["1.8", "2.0", "2.0.1", "2.0.2", "2.1","2.2"]);

      this.__picker = new qx.ui.mobile.dialog.Picker(showPickerButton);
      this.__picker.setTitle("Picker");
      this.__picker.addSlot(pickerSlot1);
      this.__picker.addSlot(pickerSlot2);
      this.__picker.setSelectedIndex(0, 1);
      this.__picker.setSelectedIndex(1, 4);
      
      this.__picker.addListener("changeSelection", this.__onPickerChangeSelection,this);
      this.__picker.addListener("confirmSelection", this.__onPickerConfirmSelection,this);

      // ANCHORED MENU POPUP
      var showAnchorMenuButton = new qx.ui.mobile.form.Button("Show Anchor Menu");
      showAnchorMenuButton.addListener("tap", function(e) {
          this._stop();
          this.__anchorMenu.show();
      }, this);

      var anchorMenuModel = new qx.data.Array(["Red", "Green", "Blue"]);
      this.__anchorMenu = new qx.ui.mobile.dialog.Menu(anchorMenuModel, showAnchorMenuButton);
      this.__anchorMenu.setTitle("Colors");

      // BUTTONS
      var showModalDialogButton = new qx.ui.mobile.form.Button("Show Modal Popup");
      showModalDialogButton.addListener("tap", function(e) {
          this._stop();
          this.__modaldialogpopup.show();
      }, this);

      var showPopupButton = new qx.ui.mobile.form.Button("Show Popup");
      showPopupButton.addListener("tap", function(e) {
          this._stop();
          this.__popup.show();
      }, this);

      var busyIndicatorButton = new qx.ui.mobile.form.Button("Show Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        this.__busypopup.toggleVisibility();
        qx.lang.Function.delay(this.__busypopup.hide, 3000, this.__busypopup);
      }, this);

      var showMenuButton = new qx.ui.mobile.form.Button("Show Menu");
      showMenuButton.addListener("tap", function(e) {
          this._stop();
          this.__menu.show();
      }, this);

      this.getContent().add(new qx.ui.mobile.form.Title("Dialog Widget Menu"));
      
      var buttonsGroup = new qx.ui.mobile.form.Group([
        showModalDialogButton,
        showPopupButton,
        showAnchorButton,
        showMenuButton,
        showAnchorMenuButton,
        busyIndicatorButton,
        showPickerButton
      ]);
      
      this.getContent().add(resultsGroup);
      this.getContent().add(buttonsGroup);
    },
    
    
    /**
     * Reacts on "changeSelection" event on picker, and displays the values on resultsLabel.
     */
    __onPickerChangeSelection : function(e) {
      this.__resultsLabel.setValue("Received <b>changeSelection</b> from Picker Dialog. [slot: "+ e.getData().slot+ "] [item: "+ e.getData().item+"]");
    },
    
    
    /**
     * Reacts on "confirmSelection" event on picker, and displays the values on resultsLabel.
     */
    __onPickerConfirmSelection : function(e) {
      this.__resultsLabel.setValue("");

      for(var i =0; i<e.getData().length;i++) { 
        var data = e.getData()[i];
        this.__resultsLabel.setValue(this.__resultsLabel.getValue()+ " Received <b>confirmSelection</b> from Picker Dialog. [slot: "+ data.slot+ "] [item: "+ data.item+"] <br>");
      }
    },
    
    
    /**
     * Reacts on "changeSelection" event on Menu, and displays the values on resultsLabel.
     */
    __onMenuChangeSelection : function(e) {
       this.__resultsLabel.setValue("Received <b>changeSelection</b> from Menu Dialog. [index: "+ e.getData().index+ "] [item: "+ e.getData().item+"]");
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
      if (this.__anchoredMenu) {
        this.__anchoredMenu.hide();
      }
      if (this.__picker) {
        this.__picker.hide();
      }
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});