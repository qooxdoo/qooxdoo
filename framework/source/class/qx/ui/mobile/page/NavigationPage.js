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
 * Specialized page. This page includes already a {@link qx.ui.mobile.navigationbar.NavigationBar}
 * and and a {@link qx.ui.mobile.container.Scroll} container.
 * The NavigationPage can only be used with a page manager {@link qx.ui.mobile.page.Manager}.

 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *
 *  var manager = new qx.ui.mobile.page.Manager();
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
 *  manager.addDetail(page);
 *  page.show();
 * </pre>
 *
 * This example creates a NavigationPage with a title and a back button. In the
 * <code>initialize</code> lifecycle method a button is added.
 */
qx.Class.define("qx.ui.mobile.page.NavigationPage",
{
  extend : qx.ui.mobile.page.Page,
  implement : qx.ui.mobile.container.INavigation,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param wrapContentByGroup {Boolean} Defines whether a group box should wrap the content. This can be used for defining a page margin.
   * @param layout {qx.ui.mobile.layout.Abstract} The layout of this page.
   */
  construct : function(wrapContentByGroup, layout)
  {
    this.base(arguments);

    if(wrapContentByGroup != null) {
      this._wrapContentByGroup = wrapContentByGroup;
    }
  },

  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the user tapped on the navigation button */
    action : "qx.event.type.Event",

    /** Fired when parent portrait container should hide. **/
    hidePortraitContainer : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The title of the page */
    title :
    {
      check : "String",
      init : "",
      event : "changeTitle",
      apply : "_applyTitle"
    },


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
     * Indicates whether the back button should be shown on tablet.
     */
    showBackButtonOnTablet:
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether to show the action button.
     */
    showButton:
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowButton"
    },


    /**
     * Toggles visibility of NavigationBar in
     * wrapping container {@link qx.ui.mobile.container.Navigation}
     */
    navigationBarHidden:
    {
      check : "Boolean",
      init : false
    },


    /**
     * Sets the transition duration (in seconds) for the effect when hiding/showing
     * the NavigationBar through boolean property navigationBarHidden.
     */
    navigationBarToggleDuration:
    {
      check : "Number",
      init : 0.8
    },


    /**
     * The CSS class to add to the content per default.
     */
    contentCssClass :
    {
      check : "String",
      init : "content",
      nullable : true,
      apply : "_applyContentCssClass"
    }
  },


 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _isTablet : false,
    _wrapContentByGroup : true,
    __backButton : null,
    __button : null,
    __content : null,
    __scrollContainer : null,
    __title : null,
    __leftContainer : null,
    __rightContainer : null,


    // interface implementation
    getTitleWidget : function() {
      if (!this.__title) {
        this.__title = this._createTitleWidget();
      }
      return this.__title;
    },


    /**
     * Creates the navigation bar title.
     *
     * @return {qx.ui.mobile.navigationbar.Title} The created title widget
     */
    _createTitleWidget : function()
    {
      return new qx.ui.mobile.navigationbar.Title(this.getTitle());
    },


    // property apply
    _applyTitle : function(value, old) {
      if (this.__title) {
        this.__title.setValue(value);
      }
    },


    // interface implementation
    getLeftContainer : function() {
      if (!this.__leftContainer) {
        this.__leftContainer = this._createLeftContainer();
      }
      return this.__leftContainer;
    },


    // interface implementation
    getRightContainer : function() {
      if (!this.__rightContainer) {
        this.__rightContainer = this._createRightContainer();
      }
      return this.__rightContainer;
    },


    /**
     * Creates the left container for the navigation bar.
     *
     * @return {qx.ui.mobile.container.Composite} Creates the left container for the navigation bar.
     */
    _createLeftContainer : function() {
      var layout =new qx.ui.mobile.layout.HBox();
      var container = new qx.ui.mobile.container.Composite(layout);
      container.addCssClass("left-container");
      this.__backButton = this._createBackButton();
      this.__backButton.addListener("tap", this._onBackButtonTap, this);
      this._showBackButton();
      container.add(this.__backButton);
      return container;
    },


    /**
     * Creates the right container for the navigation bar.
     *
     * @return {qx.ui.mobile.container.Composite} Creates the right container for the navigation bar.
     */
    _createRightContainer : function() {
      var layout = new qx.ui.mobile.layout.HBox();
      var container = new qx.ui.mobile.container.Composite(layout);
      container.addCssClass("right-container");
      this.__button = this._createButton();
      this.__button.addListener("tap", this._onButtonTap, this);
      this._showButton();
      container.add(this.__button);
      return container;
    },


    /**
      * Creates the navigation bar back button.
      * Creates the scroll container.
      *
      * @return {qx.ui.mobile.navigationbar.BackButton} The created back button widget
      * @return {qx.ui.mobile.container.Scroll} The created scroll container
      */
    _createBackButton : function() {
      return new qx.ui.mobile.navigationbar.BackButton(this.getBackButtonText());
    },



    /**
      * Creates the navigation bar button.
      * Creates the content container.
      *
      * @return {qx.ui.mobile.navigationbar.Button} The created button widget
      * @return {qx.ui.mobile.container.Composite} The created content container
      */
    _createButton : function() {
     return new qx.ui.mobile.navigationbar.Button(this.getButtonText());
    },


    /**
    * Scrolls the wrapper contents to the x/y coordinates in a given
    * period.
    *
    * @param x {Integer} X coordinate to scroll to.
    * @param y {Integer} Y coordinate to scroll to.
    * @param time {Integer} Time slice in which scrolling should
    *              be done.
    *
    */
    scrollTo : function(x, y, time)
    {
      this.__scrollContainer.scrollTo(x, y, time);
    },


    /**
    * Scrolls the wrapper contents to the widgets coordinates in a given
    * period.
    *
    * @param widget {qx.ui.mobile.core.Widget} the widget, the scroll container should scroll to.
    * @param time {Integer} Time slice in which scrolling should
    *              be done.
    *
    */
    scrollToWidget : function(widget, time)
    {
      if(widget) {
        var widgetId = "#"+widget.getId();
        this.__scrollContainer.scrollToElement(widgetId, time);
      }
    },


    /**
     * Returns the content container. Add all your widgets to this container.
     *
     * @return {qx.ui.mobile.container.Composite} The content container
     */
    getContent : function()
    {
      return this.__content;
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


    /**
     * Sets the isTablet flag.
     * @param isTablet {Boolean} value of the isTablet flag.
     */
    setIsTablet : function (isTablet) {
      this._isTablet = isTablet
    },


    /**
     * Returns the isTablet flag.
     * @return {Boolean} the isTablet flag of this page.
     */
    isTablet : function() {
      return this._isTablet;
    },


    /**
     * Returns the scroll container.
     *
     * @return {qx.ui.mobile.container.Scroll} The scroll container
     */
    _getScrollContainer : function()
    {
      return this.__scrollContainer;
    },


    /**
     * Adds a widget, below the NavigationBar.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget to add, after NavigationBar.
     */
    addAfterNavigationBar : function(widget) {
      if(widget && this.__scrollContainer) {
        this.addBefore(widget, this.__scrollContainer);
      }
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


    // property apply
    _applyContentCssClass : function(value, old)
    {
      if (this.__content) {
        this.__content.setDefaultCssClass(value);
      }
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
          this.__backButton.exclude();
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
          this.__button.exclude();
        }
      }
    },


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.__scrollContainer = this._createScrollContainer();
      this.__content = this._createContent();

      if (this.__content) {
        this.__scrollContainer.add(this.__content, {flex :1});
      }
      if (this.__scrollContainer) {
        this.add(this.__scrollContainer, {flex:1});
      }
    },


    /**
     * Creates the scroll container.
     *
     * @return {qx.ui.mobile.container.Scroll} The created scroll container
     */
    _createScrollContainer : function()
    {
      // If OS < Android 4.1,
      // quirks mode for Android should be active.
      // This means that iScroll does not use transform3d, because
      // this causes layout problems with input fields.
      var osName = qx.core.Environment.get("os.name");
      var osVersion = qx.core.Environment.get("os.version");

      var osVersionParts = osVersion.split(".");

      // If OS is Android, and version is below 4.1 >> quirksmode active
      var isAndroidQuirksMode = (osName == "android")
        && ((parseInt(osVersionParts[0]) < 4) || (parseInt(osVersionParts[0]) == 4 && parseInt(osVersionParts[1]) < 1));

      if(isAndroidQuirksMode == true) {
        return new qx.ui.mobile.container.Scroll(false);
      } else {
        return new qx.ui.mobile.container.Scroll();
      }
    },


    /**
     * Creates the content container.
     *
     * @return {qx.ui.mobile.container.Composite} The created content container
     */
    _createContent : function()
    {
      var content = new qx.ui.mobile.container.Composite();
      content.setDefaultCssClass(this.getContentCssClass());

      if(this._wrapContentByGroup==true) {
        content.addCssClass("group");
      }

      return content;
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
    this._disposeObjects("__leftContainer", "__rightContainer", "__backButton",
      "__button", "__title");
    this.__leftContainer = this.__rightContainer = this.__backButton = this.__button = null;
    this.__title = this.__content = this.__scrollContainer = null;
    this._isTablet = null;
  }
});
