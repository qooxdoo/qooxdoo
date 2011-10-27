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
    __popup: null,

    // overridden
    _initialize : function()
    {
      this.base(arguments);

      var label = new qx.ui.mobile.form.Title("Search");
      this.getContent().add(label);

      var button = new qx.ui.mobile.form.Button("Toggle the toolbar");
      button.addListener("tap", this._onButtonTap, this);
      this.getContent().add(button);

        var busyIndicator = new qx.ui.mobile.dialog.BusyIndicator("We are searching...");
        this.add(busyIndicator);

      var toolbar = this.__toolbar = new qx.ui.mobile.toolbar.ToolBar();
      this.add(toolbar); // getContent()
      var searchBtn = new qx.ui.mobile.toolbar.Button("search");
      toolbar.add(searchBtn);
      searchBtn.addListener("tap", function(){
        busyIndicator.show();
        qx.lang.Function.delay(function(){
          this.hide();
        }, 2000, busyIndicator);
      }, this);
      toolbar.add(new qx.ui.mobile.toolbar.Separator());
      var goBackBtn = new qx.ui.mobile.toolbar.Button(null,"mobileshowcase/icon/arrowleft.png");
      toolbar.add(goBackBtn);
      goBackBtn.addListener("tap", function(){
        label.setValue("Go Back");
        var popup = this.__createPopup(label);
        popup.show();
      }, this);
      toolbar.add(new qx.ui.mobile.toolbar.Separator());
      var closeButton = new qx.ui.mobile.toolbar.Button("Take Picture","mobileshowcase/icon/camera.png");
      toolbar.add(closeButton);

      closeButton.addListener("tap", function(){
        label.setValue("Take a Picture");
      });
    },

    /**
     * Handler for the main button in the page
     */
    _onButtonTap : function()
    {
      this.__toolbar.toggle();
    },
    
    /**
     * Creates the popup widget to show when backButton is tapped
     */
    __createPopup : function(attachedToWidget)
    {
      if(this.__popup) {
        return this.__popup;
      }
      var popupWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      popupWidget.add(new qx.ui.mobile.form.Title("Are you sure?"));
      var buttonsWidget = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      var okButton = new qx.ui.mobile.form.Button("Yes");
      var cancelButton = new qx.ui.mobile.form.Button("No");
      popupWidget.add(okButton);
      popupWidget.add(cancelButton);
      popupWidget.add(buttonsWidget);
      okButton.addListener("tap", function(){
        this.__popup.hide();
      }, this);
      cancelButton.addListener("tap", function(){
        this.__popup.hide();
      }, this);
      //return new qx.ui.mobile.dialog.Popup(popupWidget, attachedToWidget);
      this.__popup = new qx.ui.mobile.dialog.Popup(popupWidget);
      return this.__popup;
    },

    // overridden
    _back : function()
    {
      qx.ui.mobile.navigation.Manager.getInstance().executeGet("/", {reverse:true});
    }
  }
});