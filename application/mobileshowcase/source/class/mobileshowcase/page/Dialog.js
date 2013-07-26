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
    __anchorPopup : null,
    __popup : null,
    __dialogpopup : null,
    __busyPopup : null,
    __menu : null,
    __picker : null,
    __anchorMenu : null,
    __modalDialogPopup : null,
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
      this.__busyPopup = new qx.ui.mobile.dialog.Popup(busyIndicator);
      this.__busyPopup.setTitle("Loading...");

      // DEFAULT POPUP
      this.__popup = new qx.ui.mobile.dialog.Popup(closeDialogButton1);
      this.__popup.setTitle("A Popup");

      // MODAL DIALOG
      this.__modalDialogPopup = new qx.ui.mobile.dialog.Popup(closeDialogButton2);
      this.__modalDialogPopup.setModal(true);
      this.__modalDialogPopup.setTitle("A Modal Popup");

      // ANCHOR POPUP
      var showAnchorButton = new qx.ui.mobile.form.Button("Show Anchor Popup");
      showAnchorButton.addListener("tap", function(e) {
          this._stop();
          this.__anchorPopup.show();
      }, this);

      this.__anchorPopup = this.__createAnchorPopup(showAnchorButton);

      // MENU DIALOG
      var menuModel = new qx.data.Array();
      for (var i = 0; i < 50; i++) {
        menuModel.push("Action "+i);
      };

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
      var pickerSlot2 = new qx.data.Array(["1.5.1", "1.6.1", "2.0.4", "2.1.2", "3.0"]);

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
          this.__modalDialogPopup.show();
      }, this);

      var showPopupButton = new qx.ui.mobile.form.Button("Show Popup");
      showPopupButton.addListener("tap", function(e) {
          this._stop();
          this.__popup.show();
      }, this);

      var busyIndicatorButton = new qx.ui.mobile.form.Button("Show Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        this.__busyPopup.toggleVisibility();
        qx.lang.Function.delay(this.__busyPopup.hide, 3000, this.__busyPopup);
      }, this);

      var showMenuButton = new qx.ui.mobile.form.Button("Show Menu");
      showMenuButton.addListener("tap", function(e) {
          this._stop();
          this.__menu.show();
      }, this);

      var popupGroup = new qx.ui.mobile.form.Group([],false);
      popupGroup.add(this._createGroupTitle("Popup"));
      popupGroup.add(showPopupButton,{flex:1});
      popupGroup.add(showAnchorButton,{flex:1});

      var menuGroup = new qx.ui.mobile.form.Group([],false);
      menuGroup.add(this._createGroupTitle("Menu"));
      menuGroup.add(showMenuButton,{flex:1});
      menuGroup.add(showAnchorMenuButton,{flex:1});

      var otherGroup = new qx.ui.mobile.form.Group([],false);
      otherGroup.add(this._createGroupTitle("Other"));
      otherGroup.add(busyIndicatorButton,{flex:1});
      otherGroup.add(showPickerButton,{flex:1});

      var groupContainer = new qx.ui.mobile.container.Composite();
      groupContainer.setLayout(new qx.ui.mobile.layout.HBox());
      groupContainer.add(popupGroup, {flex:1});
      groupContainer.add(menuGroup, {flex:1});
      groupContainer.add(otherGroup, {flex:1});

      this.getContent().add(groupContainer);
      this.getContent().add(resultsGroup);
    },


    /**
    * Creates a group title for the dialow showcase.
    * @return {qx.ui.mobile.form.Label} the group title label.
    */
    _createGroupTitle : function(value) {
      var titleLabel = new qx.ui.mobile.form.Label(value);
      titleLabel.addCssClass("dialog-group-title");
      return titleLabel;
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
      if(this.__anchorPopup) {
        return this.__anchorPopup;
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
        this.__anchorPopup.hide();
      }, this);
      cancelButton.addListener("tap", function(){
        this.__anchorPopup.hide();
      }, this);

      this.__anchorPopup = new qx.ui.mobile.dialog.Popup(popupWidget, anchor);
      return this.__anchorpopup;
    },


    // overridden
    _stop : function() {
      if (!this.__popup) {
        return
      }

      this.__popup.hide();
      this.__anchorPopup.hide();
      this.__modalDialogPopup.hide();
      this.__busyPopup.hide();
      this.__menu.hide();
      this.__anchorMenu.hide();
      this.__picker.hide();
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    }
  }
});