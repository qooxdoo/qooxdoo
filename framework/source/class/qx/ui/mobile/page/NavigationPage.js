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
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Specialiced page. This page includes already a {@link qx.ui.mobile.navigationbar.NavigationBar}
 * and a {@link qx.ui.mobile.container.Scroll} container.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *  var page = new qx.ui.mobile.page.NavigationPage();
 *  page.setTitle("Page Title");
 *  page.setShowBackButton(true);
 *  page.setBackButtonText("Back")
 *  page.addListener("initialize", function()
 *  {
 *    var button = new qx.ui.mobile.form.Button("Next Page");
 *    page.getContent().add(button);
 *  },this);
 *
 *  page.addListener("back", function()
 *  {
 *    otherPage.show({animation:"cube", reverse:true});
 *  },this);
 *
 *  page.show();
 * </pre>
 *
 * This example creates a NavigationPage with a title and a back button. In the
 * <code>initialize</code> lifecycle method a button is added.
 */
qx.Class.define("qx.ui.mobile.page.NavigationPage",
{
  extend : qx.ui.mobile.page.Page,


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the user tapped on the navigation button */
    action : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The back button text */
    backButtonText :
    {
      check : "String",
      init : "",
      apply : "_applyBackButtonText"
    },


    /** The action button text */
    buttonText :
    {
      check : "String",
      init : "",
      apply : "_applyButtonText"
    },


    /**
     * Whether to show the back button.
     */
    showBackButton:
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowBackButton"
    },


    /**
     * Whether to show the action button.
     */
    showButton:
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowButton"
    }
  },


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __backButton : null,
    __button : null,
    __leftContainer : null,
    __rightContainer : null,


    // overridden
    getLeftContainer : function() {
      if (!this.__leftContainer) {
        this.__leftContainer = this._createLeftContainer();
      }
      return this.__leftContainer;
    },


    // overridden
    getRightContainer : function() {
      if (!this.__rightContainer) {
        this.__rightContainer = this._createRightContainer();
      }
      return this.__rightContainer;
    },


    _createLeftContainer : function() {
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.__backButton = this._createBackButton();
      this.__backButton.addListener("tap", this._onBackButtonTap, this);
      this._showBackButton();
      container.add(this.__backButton);
      return container;
    },


    _createRightContainer : function() {
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
      this.__button = this._createButton();
      this.__button.addListener("tap", this._onButtonTap, this);
      this._showButton();
      container.add(this.__button);
      return container;
    },


    /**
     * Returns the back button widget.
     *
     * @return {qx.ui.mobile.navigationbar.BackButton} The back button widget
     */
    _getBackButton : function()
    {
      return this.__backButton;
    },


    /**
     * Returns the action button widget.
     *
     * @return {qx.ui.mobile.navigationbar.Button} The action button widget
     */
    _getButton : function()
    {
      return this.__button;
    },


    // property apply
    _applyBackButtonText : function(value, old)
    {
      if (this.__backButton) {
        this.__backButton.setValue(value);
      }
    },


    // property apply
    _applyButtonText : function(value, old)
    {
      if (this.__button) {
        this.__button.setValue(value);
      }
    },


    // property apply
    _applyShowBackButton : function(value, old)
    {
      this._showBackButton();
    },


    // property apply
    _applyShowButton : function(value, old)
    {
      this._showButton();
    },


    /**
     * Helper method to show the back button.
     */
    _showBackButton : function()
    {
      if (this.__backButton)
      {
        if (this.getShowBackButton()) {
            this.__backButton.show();
        } else {
          this.__backButton.hide();
        }
      }
    },


    /**
     * Helper method to show the button.
     */
    _showButton : function()
    {
      if (this.__button)
      {
        if (this.getShowButton()) {
          this.__button.show();
        } else {
          this.__button.hide();
        }
      }
    },


    /**
     * Creates the navigation bar back button.
     *
     * @return {qx.ui.mobile.navigationbar.BackButton} The created back button widget
     */
    _createBackButton : function() {
      return new qx.ui.mobile.navigationbar.BackButton(this.getBackButtonText());
    },


    /**
     * Creates the navigation bar button.
     *
     * @return {qx.ui.mobile.navigationbar.Button} The created button widget
     */
    _createButton : function() {
      return new qx.ui.mobile.navigationbar.Button(this.getButtonText());
    },


    /**
     * Event handler. Called when the tap event occurs on the back button.
     *
     * @param evt {qx.event.type.Tap} The tap event
     */
    _onBackButtonTap : function(evt)
    {
      this.back();
    },


    /**
     * Event handler. Called when the tap event occurs on the button.
     *
     * @param evt {qx.event.type.Tap} The tap event
     */
    _onButtonTap : function(evt)
    {
      this.fireEvent("action");
    }
  },


  destruct : function()
  {
    this._disposeObjects("__leftContainer", "__rightContainer", "__backButton", "__button");
    this.__leftContainer = this.__rightContainer = this.__backButton = this.__button = null;
  }
});
