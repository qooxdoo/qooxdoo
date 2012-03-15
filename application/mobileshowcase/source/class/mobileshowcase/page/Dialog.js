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
    // overridden
    _initialize : function()
    {
      this.base(arguments);
      
      // EXAMPLE WIDGETS
      var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait");
      var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Data connection...");
      var busyPopup = new qx.ui.mobile.dialog.Popup(busyIndicator);
      busyPopup.setTitle("Loading...");
      
      var closePopupButton = new qx.ui.mobile.form.Button("Close Popup");
      closePopupButton.addListener("tap", function(e) {
        popup.hide();
      }, this);
      
      var closeDialogButton = new qx.ui.mobile.form.Button("Close Dialog");
      closeDialogButton.addListener("tap", function(e) {
        dialogpopup.hide();
      }, this);
      
      // DEFAULT POPUP
      var popup = new qx.ui.mobile.dialog.Popup(closePopupButton);
      popup.setTitle("A Popup");
      
      // DIALOG POPUP
      var dialogpopup = new qx.ui.mobile.dialog.Dialog(closeDialogButton);
      dialogpopup.setTitle("A Dialog");
      
      // MENU
      var showDialogButton = new qx.ui.mobile.form.Button("Show Dialog");
      showDialogButton.addListener("tap", function(e) {
        dialogpopup.show();
      }, this);
      
      var showPopupButton = new qx.ui.mobile.form.Button("Show Popup");
      showPopupButton.addListener("tap", function(e) {
          popup.show();
      }, this);
      
      var i = 0;
      var busyIndicatorButton = new qx.ui.mobile.form.Button("Show/Hide Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        if((i++%2)===1){
          busyPopup.show();
        } else {
          busyPopup.hide();
        }
      }, this); 
      
      
      
      
      this.getContent().add(new qx.ui.mobile.form.Title("Dialog Widget Menu"));
      this.getContent().add(showDialogButton);
      this.getContent().add(showPopupButton);
      this.getContent().add(busyIndicatorButton);
      this.getContent().add(busyPopup);
      
    },


    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});