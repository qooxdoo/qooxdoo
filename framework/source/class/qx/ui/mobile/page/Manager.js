/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The page manager decides automatically whether the added pages should be
 * displayed in a master/detail view (for tablet) or as a plain card layout (for
 * smartphones).
 *
 * *Example*
 *
 * Here is a little example of how to use the manager.
 *
 * <pre class='javascript'>
 *  var manager = new qx.ui.mobile.page.Manager();
 *  var page1 = new qx.ui.mobile.page.NavigationPage();
 *  var page2 = new qx.ui.mobile.page.NavigationPage();
 *  var page3 = new qx.ui.mobile.page.NavigationPage();
 *  manager.addMaster(page1);
 *  manager.addDetail([page2,page3]);
 *
 *  page1.show();
 * </pre>
 *
 *
 */
qx.Class.define("qx.ui.mobile.page.Manager",
{
  extend : qx.core.Object,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param isTablet {Boolean?} flag which triggers the manager to layout for tablet (or big screens/displays) or mobile devices. If parameter is null,
   * qx.core.Environment.get("device.type") is called for decision.
   * @param root {qx.ui.mobile.core.Widget?} widget which should be used as root for this manager.
   */
  construct : function(isTablet, root)
  {
    this.base(arguments);

    root = root || qx.core.Init.getApplication().getRoot();

    if (typeof isTablet !== "undefined" && isTablet !== null) {
      this.__isTablet = isTablet;
    } else {
      // If isTablet is undefined, call environment variable "device.type".
      // When "tablet" or "desktop" type >> do tablet layouting.
      this.__isTablet =
      qx.core.Environment.get("device.type") == "desktop" ||
      qx.core.Environment.get("device.type") == "tablet";
    }

    this.__detailNavigation = this._createDetailNavigation();
    this.__detailNavigation.getNavigationBar().hide();

    if (this.__isTablet) {
      this.__masterNavigation = this._createMasterNavigation();
      this.__masterNavigation.getNavigationBar().hide();

      this.__masterContainer = this._createMasterContainer();
      this.__detailContainer = this._createDetailContainer();

      this.__masterButton = this._createMasterButton();
      this.__masterButton.addListener("tap", this._onMasterButtonTap, this);

      this.__hideMasterButton = this._createHideMasterButton();
      this.__hideMasterButton.addListener("tap", this._onHideMasterButtonTap, this);

      this.__masterNavigation.addListener("update", this._onMasterContainerUpdate, this);
      this.__detailNavigation.addListener("update", this._onDetailContainerUpdate, this);

      root.add(this.__detailContainer, {flex:1});
      this.__masterContainer.add(this.__masterNavigation, {flex:1});
      this.__detailContainer.add(this.__detailNavigation, {flex:1});

      qx.event.Registration.addListener(window, "orientationchange", this._onLayoutChange, this);
      this.__masterContainer.addListener("resize", this._onLayoutChange, this);

      // On Tablet Mode, no Animation should be shown by default.
      this.__masterNavigation.getLayout().setShowAnimation(false);
      this.__detailNavigation.getLayout().setShowAnimation(false);

      this.__masterContainer.forceHide();

      setTimeout(function() {
        if (qx.bom.Viewport.isLandscape()) {
          this.__masterContainer.show();
        }
      }.bind(this), 300);
    } else {
      root.add(this.__detailNavigation, {flex:1});
    }
  },


  properties : {

    /**
     * The caption/label of the Master Button and Popup Title.
     */
    masterTitle : {
      init : "Master",
      check : "String",
      apply : "_applyMasterTitle"
    },


    /**
     * The caption/label of the Hide Master Button.
     */
    hideMasterButtonCaption : {
      init : "Hide",
      check : "String",
      apply : "_applyHideMasterButtonCaption"
    },


    /**
     * This flag controls whether the MasterContainer can be hidden on Landscape.
     */
    allowMasterHideOnLandscape : {
      init : true,
      check : "Boolean"
    },


    /**
     *  This flag controls whether the MasterContainer hides on portrait view,
     *  when a Detail Page fires the lifecycle event "start".
     */
    hideMasterOnDetailStart : {
      init : true,
      check : "Boolean"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __isTablet : null,
    __detailNavigation : null,
    __masterNavigation : null,
    __masterButton : null,
    __hideMasterButton : null,
    __masterPages : null,
    __detailPages : null,
    __masterContainer : null,
    __detailContainer : null,


    /**
     * Creates the master container.
     *
     * @return {qx.ui.mobile.container.Composite} The created container
     */
    _createMasterContainer : function() {
      var masterContainer = new qx.ui.mobile.container.Drawer(null, new qx.ui.mobile.layout.HBox()).set({
        hideOnParentTap : false,
        hideOnBack : false
      });
      masterContainer.addCssClass("master-detail-master");
      masterContainer.addListener("changeVisibility", this._onMasterChangeVisibility, this);
      return masterContainer;
    },


    /**
     * Creates the detail container.
     *
     * @return {qx.ui.mobile.container.Composite} The created container
     */
    _createDetailContainer : function() {
      var detailContainer = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.VBox());
      detailContainer.setDefaultCssClass("master-detail-detail");
      return detailContainer;
    },


    /**
     * Getter for the Master Container
     * @return {qx.ui.mobile.container.Drawer} The Master Container.
     */
    getMasterContainer : function() {
      return this.__masterContainer;
    },


    /**
     * Getter for the Detail Container
     * @return {qx.ui.mobile.container.Composite} The Detail Container.
     */
    getDetailContainer : function() {
      return this.__detailContainer;
    },


    /**
     * Returns the button for showing/hiding the masterContainer.
     * @return {qx.ui.mobile.navigationbar.Button}
     */
    getMasterButton : function() {
      return this.__masterButton;
    },


    /**
     * Returns the masterNavigation.
     * @return {qx.ui.mobile.container.Navigation}
     */
    getMasterNavigation : function() {
      return this.__masterNavigation;
    },


    /**
     * Returns the detailNavigation.
     * @return {qx.ui.mobile.container.Navigation}
     */
    getDetailNavigation : function() {
      return this.__detailNavigation;
    },


     /**
     * Factory method for the master button, which is responsible for showing/hiding masterContainer.
     * @return {qx.ui.mobile.navigationbar.Button}
     */
    _createMasterButton : function() {
      return new qx.ui.mobile.navigationbar.Button(this.getMasterTitle());
    },


    /**
     * Factory method for the hide master button, which is responsible for hiding masterContainer on Landscape view.
     * @return {qx.ui.mobile.navigationbar.Button}
     */
    _createHideMasterButton : function() {
      return new qx.ui.mobile.navigationbar.Button("Hide");
    },


    /**
    * Factory method for masterNavigation.
    * @return {qx.ui.mobile.container.Navigation}
    */
    _createMasterNavigation : function() {
      return new qx.ui.mobile.container.Navigation();
    },


    /**
     * Factory method for detailNavigation.
     * @return {qx.ui.mobile.container.Navigation}
     */
    _createDetailNavigation : function() {
      return new qx.ui.mobile.container.Navigation();
    },


    /**
     * Adds an array of NavigationPages to masterContainer, if __isTablet is true. Otherwise it will be added to detailContainer.
     * @param pages {qx.ui.mobile.page.NavigationPage[]|qx.ui.mobile.page.NavigationPage} Array of NavigationPages or single NavigationPage.
     */
    addMaster : function(pages) {
      if (this.__isTablet) {
        if(pages) {
          if(!qx.lang.Type.isArray(pages)) {
            pages = [pages];
          }

          for(var i = 0; i < pages.length; i++) {
            var masterPage = pages[i];
            masterPage.addListener("start", this._onMasterPageStart, this);
          }

          if(this.__masterPages) {
            this.__masterPages.concat(pages);
          } else {
            this.__masterPages = pages;
          }

          this._add(pages, this.__masterNavigation);
        }
      } else {
        this.addDetail(pages);
      }
    },


    /**
     * Adds an array of NavigationPage to the detailContainer.
     * @param pages {qx.ui.mobile.page.NavigationPage[]|qx.ui.mobile.page.NavigationPage} Array of NavigationPages or single NavigationPage.
     */
    addDetail : function(pages) {
      this._add(pages, this.__detailNavigation);

      if(pages && this.__isTablet) {
        if (!qx.lang.Type.isArray(pages)) {
          pages = [pages];
        }

        for(var i = 0; i < pages.length; i++) {
          var detailPage = pages[i];
          detailPage.addListener("start", this._onDetailPageStart, this);
        }

        if(this.__detailPages) {
          this.__detailPages.concat(pages);
        } else {
          this.__detailPages = pages;
        }
      }
    },


    /**
     * Called when a detailPage reaches lifecycle state "start".
     * @param evt {qx.event.type.Event} source event.
     */
    _onDetailPageStart : function(evt) {
      if(qx.bom.Viewport.isPortrait() && this.isHideMasterOnDetailStart()) {
        this.__masterContainer.hide();
      }
    },


    /**
     * Called when a masterPage reaches lifecycle state "start". Then property masterTitle will be update with masterPage's title.
     * @param evt {qx.event.type.Event} source event.
     */
    _onMasterPageStart : function(evt) {
      var masterPage = evt.getTarget();
      var masterPageTitle = masterPage.getTitle();
      this.setMasterTitle(masterPageTitle);
    },


    /**
     * Adds an array of NavigationPage to the target container.
     * @param pages {qx.ui.mobile.page.NavigationPage[]|qx.ui.mobile.page.NavigationPage} Array of NavigationPages, or NavigationPage.
     * @param target {qx.ui.mobile.container.Navigation} target navigation container.
     */
    _add : function(pages, target) {
      if (!qx.lang.Type.isArray(pages)) {
        pages = [pages];
      }

      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];

        if (qx.core.Environment.get("qx.debug"))
        {
          this.assertInstance(page, qx.ui.mobile.page.NavigationPage);
        }

        if(this.__isTablet && !page.getShowBackButtonOnTablet()) {
          page.setShowBackButton(false);
        }

        page.setIsTablet(this.__isTablet);
        target.add(page);
      }
    },


    /**
     * Called when masterContainer is updated.
     * @param evt {qx.event.type.Data} source event.
     */
    _onMasterContainerUpdate : function(evt) {
      var widget = evt.getData();
      widget.getRightContainer().remove(this.__hideMasterButton);
      widget.getRightContainer().add(this.__hideMasterButton);
    },


    /**
     * Called when detailContainer is updated.
     * @param evt {qx.event.type.Data} source event.
     */
    _onDetailContainerUpdate : function(evt) {
      var widget = evt.getData();
      widget.getLeftContainer().remove(this.__masterButton);
      widget.getLeftContainer().add(this.__masterButton);
    },


    /**
    * Called when user taps on masterButton.
    */
    _onMasterButtonTap : function() {
      this.__masterContainer.show();
    },


    /**
    * Called when user taps on hideMasterButton.
    */
    _onHideMasterButtonTap : function() {
      this._removeDetailContainerGap();
      this.__masterContainer.hide();
    },


    /**
    * Event handler for <code>changeVisibility</code> event on master container.
    * @param evt {qx.event.type.Data} the change event.
    */
    _onMasterChangeVisibility: function(evt) {
      var isMasterVisible = ("visible" === evt.getData());

      if (qx.bom.Viewport.isLandscape()) {
        if (this.isAllowMasterHideOnLandscape()) {
          if (isMasterVisible) {
            this._createDetailContainerGap();
            this.__masterButton.exclude();
            this.__hideMasterButton.show();
          } else {
            this.__masterButton.show();
            this.__hideMasterButton.show();
          }
        } else {
          this.__masterButton.exclude();
          this.__hideMasterButton.exclude();
        }
      } else {
        this._removeDetailContainerGap();
        this.__masterButton.show();
        this.__hideMasterButton.show();
      }
    },


    /**
    * Called when layout of masterDetailContainer changes.
    */
    _onLayoutChange : function() {
      if (this.__isTablet) {
        if (qx.bom.Viewport.isLandscape()) {
          this.__masterContainer.setHideOnParentTap(false);
          if (this.__masterContainer.isHidden()) {
            this.__masterContainer.show();
          } else {
            this._removeDetailContainerGap();
            this.__masterContainer.hide();
          }
        } else {
          this._removeDetailContainerGap();
          this.__masterContainer.setHideOnParentTap(true);
          this.__masterContainer.hide();
        }
      }
    },


    /**
    * Returns the corresponding CSS property key which fits to the drawer's orientation.
    * @return {String} the CSS property key.
    */
    _getGapPropertyKey : function() {
      return "padding"+ qx.lang.String.capitalize(this.__masterContainer.getOrientation());
    },


    /**
     * Moves detailContainer to the right edge of MasterContainer.
     * Creates spaces for aligning master and detail container aside each other.
     */
    _createDetailContainerGap : function() {
      qx.bom.element.Style.set(this.__detailContainer.getContainerElement(), this._getGapPropertyKey(), this.__masterContainer.getSize() / 16 + "rem");
      qx.event.Registration.fireEvent(window, "resize");
    },


    /**
     * Moves detailContainer to the left edge of viewport.
     */
    _removeDetailContainerGap : function() {
      qx.bom.element.Style.set(this.__detailContainer.getContainerElement(), this._getGapPropertyKey(), null);
      qx.event.Registration.fireEvent(window, "resize");
    },


    /**
    * Called on property changes of hideMasterButtonCaption.
    * @param value {String} new caption
    * @param old {String} previous caption
    */
    _applyHideMasterButtonCaption : function(value, old) {
      if(this.__isTablet) {
        this.__hideMasterButton.setLabel(value);
      }
    },


    /**
    * Called on property changes of masterTitle.
    * @param value {String} new title
    * @param old {String} previous title
    */
    _applyMasterTitle : function(value, old) {
      if(this.__isTablet) {
        this.__masterButton.setLabel(value);
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if(this.__masterPages) {
      for(var i = 0; i < this.__masterPages.length; i++) {
        var masterPage = this.__masterPages[i];

        masterPage.removeListener("start", this._onMasterPageStart, this);
      }
    }
    if(this.___detailPages) {
      for(var j = 0; j < this.___detailPages.length; j++) {
        var detailPage = this.___detailPages[j];

        detailPage.removeListener("start", this._onDetailPageStart, this);
      }
    }

    if(this.__isTablet) {
      this.__masterContainer.removeListener("changeVisibility", this._onMasterChangeVisibility, this);
      this.__masterContainer.removeListener("resize", this._onLayoutChange, this);
      qx.event.Registration.removeListener(window, "orientationchange", this._onLayoutChange, this);
    }

    this.__masterPages = this.__detailPages =  null;

    this._disposeObjects("__detailNavigation", "__masterNavigation", "__masterButton");
  }
});
