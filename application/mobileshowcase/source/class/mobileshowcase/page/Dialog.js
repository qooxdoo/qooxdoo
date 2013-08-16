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
    __pickerDaySlotData : null,
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
      var showAnchorButton = new qx.ui.mobile.form.Button("Anchor Popup");
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
      var showPickerButton = new qx.ui.mobile.form.Button("Picker");
      showPickerButton.addListener("tap", function(e) {
          this._stop();
          this.__picker.show();
      }, this);

      this.__picker = this._createPicker(showPickerButton);

      // ANCHORED MENU POPUP
      var showAnchorMenuButton = new qx.ui.mobile.form.Button("Anchor Menu");
      showAnchorMenuButton.addListener("tap", function(e) {
          this._stop();
          this.__anchorMenu.show();
      }, this);

      var anchorMenuModel = new qx.data.Array(["Red", "Green", "Blue"]);
      this.__anchorMenu = new qx.ui.mobile.dialog.Menu(anchorMenuModel, showAnchorMenuButton);
      this.__anchorMenu.setTitle("Colors");

      // BUTTONS
      var showModalDialogButton = new qx.ui.mobile.form.Button("Modal Popup");
      showModalDialogButton.addListener("tap", function(e) {
          this._stop();
          this.__modalDialogPopup.show();
      }, this);

      var showPopupButton = new qx.ui.mobile.form.Button("Popup");
      showPopupButton.addListener("tap", function(e) {
          this._stop();
          this.__popup.show();
      }, this);

      var busyIndicatorButton = new qx.ui.mobile.form.Button("Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        this.__busyPopup.toggleVisibility();
        qx.lang.Function.delay(this.__busyPopup.hide, 3000, this.__busyPopup);
      }, this);

      var showMenuButton = new qx.ui.mobile.form.Button("Menu");
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
    * Creates the date picker dialog.
    * @param anchor {qx.ui.mobile.core.Widget} the anchor of the popup.
    * @return {qx.ui.mobile.dialog.Picker} the date picker. 
    */
    _createPicker : function(anchor) {
      var picker = new qx.ui.mobile.dialog.Picker(anchor);
      picker.setTitle("Picker");
      
      this.__pickerDaySlotData = this._createDayPickerSlot(1, new Date().getFullYear());

      picker.addSlot(this.__pickerDaySlotData);
      picker.addSlot(this._createMonthPickerSlot());
      picker.addSlot(this._createYearPickerSlot());

      picker.addListener("changeSelection", this.__onPickerChangeSelection,this);
      picker.addListener("confirmSelection", this.__onPickerConfirmSelection,this);
      return picker;
    },


    /**
     * Creates the picker slot data for days in month.
     * @param month {Integer} current month.
     * @param year {Integer} current year.
     */
    _createDayPickerSlot : function(month, year) {
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      var slotData = [];
      for (var i = 1; i <= daysInMonth; i++) {
        slotData.push("" + i);
      };
      return new qx.data.Array(slotData);
    },


    /**
     * Creates the picker slot data for month names, based on current locale settings.
     */
    _createMonthPickerSlot : function() {
      var names = qx.locale.Date.getMonthNames("wide", qx.locale.Manager.getInstance().getLocale());
      var slotData = [];
      for (var i = 0; i < names.length; i++) {
        slotData.push("" + names[i]);
      };
      return new qx.data.Array(slotData);
    },


    /**
     * Creates the picker slot data from 1950 till current year.
     */
    _createYearPickerSlot : function() {
      var slotData = [];
      for (var i = new Date().getFullYear(); i > 1950; i--) {
        slotData.push("" + i);
      };
      return new qx.data.Array(slotData);
    },


    /**
     * Reacts on "changeSelection" event on picker, and displays the values on resultsLabel.
     */
    __onPickerChangeSelection : function(e) {
      if (e.getData().slot > 0) {
        this._updatePickerDaySlot();
      }
      this.__resultsLabel.setValue("Received <b>changeSelection</b> from Picker Dialog. [slot: "+ e.getData().slot+ "] [item: "+ e.getData().item+"]");
    },


    /**
    * Updates the shown days in the picker slot.
    */
    _updatePickerDaySlot : function() {
      var dayIndex = this.__picker.getSelectedIndex(0);
      var monthIndex = this.__picker.getSelectedIndex(1);
      var yearIndex = this.__picker.getSelectedIndex(2);
      var slotData = this._createDayPickerSlot(monthIndex, new Date().getFullYear() - yearIndex);
      this.__pickerDaySlotData.removeAll();
      this.__pickerDaySlotData.append(slotData);

      this.__picker.setSelectedIndex(0, dayIndex, false);
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

      return new qx.ui.mobile.dialog.Popup(popupWidget, anchor);
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