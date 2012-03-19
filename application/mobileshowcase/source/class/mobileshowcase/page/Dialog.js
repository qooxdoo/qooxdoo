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
  
    // overridden
    _initialize : function()
    {
      this.base(arguments);
      
      // EXAMPLE WIDGETS
      var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("Please wait...");
      this.__busypopup = new qx.ui.mobile.dialog.Popup(busyIndicator);
      this.__busypopup.setTitle("Loading...");
      
      var closePopupButton = new qx.ui.mobile.form.Button("Close Popup");
      closePopupButton.addListener("tap", function(e) {
        this.__popup.hide();
      }, this);
      
      var closeDialogButton = new qx.ui.mobile.form.Button("Close Dialog");
      closeDialogButton.addListener("tap", function(e) {
        this.__dialogpopup.hide();
      }, this);
      
      // DEFAULT POPUP
      this.__popup = new qx.ui.mobile.dialog.Popup(closePopupButton);
      this.__popup.setTitle("A Popup");
      
      // DIALOG POPUP
      this.__dialogpopup = new qx.ui.mobile.dialog.Dialog(closeDialogButton);
      this.__dialogpopup.setTitle("A Dialog");
      
      // Anchor POPUP
      this.__anchorpopup = this.__createAnchorPopup(this._getBackButton());
      
      // MENU
      var showDialogButton = new qx.ui.mobile.form.Button("Show Dialog");
        showDialogButton.addListener("tap", function(e) {
        this.__dialogpopup.show();
      }, this);
      
      var showPopupButton = new qx.ui.mobile.form.Button("Show Popup");
      showPopupButton.addListener("tap", function(e) {
          this.__popup.show();
      }, this);
      
      var showAnchorButton = new qx.ui.mobile.form.Button("Show Anchor Popup");
      showAnchorButton.addListener("tap", function(e) {
          this.__anchorpopup.show();
      }, this);
      
      var i = 0;
      var busyIndicatorButton = new qx.ui.mobile.form.Button("Show/Hide Busy Indicator");
      busyIndicatorButton.addListener("tap", function(e) {
        if((i++%2)==0){
          this.__busypopup.show();
        } else {
          this.__busypopup.hide();
        }
      }, this); 
      
      this.getContent().add(new qx.ui.mobile.form.Title("Dialog Widget Menu"));
      this.getContent().add(showDialogButton);
      this.getContent().add(showPopupButton);
      this.getContent().add(showAnchorButton);
      this.getContent().add(busyIndicatorButton);
      this.getContent().add(this.__busypopup);
    },
    
    
    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createAnchorPopup : function(attachedToWidget)
    {
      if(this.__anchorpopup) {
        return this.__anchorpopup;
      }
      
      var popupWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      popupWidget.add(new qx.ui.mobile.basic.Label("Are you sure?"));
      var buttonsWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      var okButton = new qx.ui.mobile.form.Button("Yes");
      var cancelButton = new qx.ui.mobile.form.Button("No");
      
      buttonsWidget.add(okButton);
      buttonsWidget.add(cancelButton);
      popupWidget.add(buttonsWidget);
      
      okButton.addListener("tap", function(){
        this.__anchorpopup.hide();
      }, this);
      cancelButton.addListener("tap", function(){
        this.__anchorpopup.hide();
      }, this);
      
      this.__anchorpopup = new qx.ui.mobile.dialog.Popup(popupWidget, attachedToWidget);
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
      if (this.__dialogPopup) {
        this.__dialogPopup.hide(); 
      }
      if (this.__busypopup) {
        this.__busypopup.hide();
      }
    },


    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    },
    
    
    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this.__unregisterEventListener();
      this._disposeObjects("__anchorpopup","__popup","__dialogpopup","__busypopup");
    }
  }
});