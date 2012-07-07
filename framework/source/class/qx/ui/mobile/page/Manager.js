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
   * @param isTablet {boolean?} flag which triggers the manager to layout for tablet (or big screens/displays) or mobile devices. If parameter is null,
   * qx.core.Environment.get("device.type") is called for decision.
   * @param root {qx.ui.mobile.core.Widget?} widget which should be used as root for this manager.
   */
  construct : function(isTablet, root)
  {
    this.base(arguments);

    root = root || qx.core.Init.getApplication().getRoot();

    if (isTablet != null) {
      this.__isTablet = isTablet;
    } else {
      // If isTablet is undefined, call environment variable "device.type".
      // When "tablet" or "desktop" type >> do tablet layouting.
      this.__isTablet =
      qx.core.Environment.get("device.type") == "desktop" ||
      qx.core.Environment.get("device.type") == "tablet";
    }

    this.__detailContainer = this._createDetailContainer();

    if (this.__isTablet) {
      this.__masterContainer = this._createMasterContainer();
      this.__masterDetailContainer = new this._createMasterDetail();
      this.__masterDetailContainer.addListener("layoutChange", this._onLayoutChange, this);

      this.__masterButton = this._createMasterButton();
      this.__masterButton.addListener("tap", this._onMasterButtonTap, this);

      this.__detailContainer.addListener("update", this._onDetailContainerUpdate, this);

      this.__portraitMasterContainer = this._createPortraitMasterContainer(this.__masterButton);
      this.__masterDetailContainer.setPortraitMasterContainer(this.__portraitMasterContainer);

      root.add(this.__masterDetailContainer, {flex:1});

      this.__masterDetailContainer.getMaster().add(this.__masterContainer, {flex:1});
      this.__masterDetailContainer.getDetail().add(this.__detailContainer, {flex:1});

      // On Tablet Mode, no Animation should be shown by default.
      this.__masterContainer.getLayout().setShowAnimation(false);
      this.__detailContainer.getLayout().setShowAnimation(false);

      this.__toggleMasterButtonVisibility();
    } else {
      root.add(this.__detailContainer, {flex:1});
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
     * The PortraitMasterContainer will have the height of displayed
     * MasterPage content + MasterPage Title + portraitMasterScrollOffset
     */
    portraitMasterScrollOffset : {
      init : 5,
      check : "Integer"
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
    __detailContainer : null,
    __masterContainer : null,
    __masterDetailContainer : null,
    __portraitMasterContainer : null,
    __masterButton : null,
    __masterPages : null,


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

          for(var i=0; i<pages.length; i++) {
            var masterPage = pages[i];
            qx.event.Registration.addListener(masterPage, "appear", this._onMasterPageAppear, this);
            qx.event.Registration.addListener(masterPage, "start", this._onMasterPageStart, this);
            qx.event.Registration.addListener(masterPage, "hidePortraitContainer", this._onHidePortraitContainer, this);
          }

          if(this.__masterPages) {
            this.__masterPages.concat(pages);
          } else {
            this.__masterPages = pages;
          }

          this._add(pages, this.__masterContainer);
        }
      } else {
        this.addDetail(pages);
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
     * Sizes the height of the portraitMasterContainer to the content of the masterPage.
     * @param evt {qx.event.type.Event} source event.
     */
    _onMasterPageAppear : function(evt) {
      var masterPage = evt.getTarget();
      var masterPageContentHeight = qx.bom.element.Dimension.getHeight(masterPage.getContent().getContentElement());
      var portraitMasterTitleHeight = 0;

      if(this.__portraitMasterContainer.getTitleWidget()) {
        portraitMasterTitleHeight = qx.bom.element.Dimension.getHeight(this.__portraitMasterContainer.getTitleWidget().getContentElement());
      }
      var maxHeight = masterPageContentHeight + portraitMasterTitleHeight + this.getPortraitMasterScrollOffset();

      qx.bom.element.Style.set(this.__portraitMasterContainer.getContentElement(), "max-height", maxHeight+"px");
    },


    /**
     * Reacts on MasterPage's tap event.
     */
    _onHidePortraitContainer : function() {
      if(this.__portraitMasterContainer) {
        this.__portraitMasterContainer.hide();
      }
    },


    /**
     * Adds an array of NavigationPage to the detailContainer.
     * @param pages {qx.ui.mobile.page.NavigationPage[]|qx.ui.mobile.page.NavigationPage} Array of NavigationPages or single NavigationPage.
     */
    addDetail : function(pages) {
      this._add(pages, this.__detailContainer);
    },


    /**
     * Returns the masterContainer for the portrait mode.
     * @return {qx.ui.mobile.dialog.Popup}
     */
    getPortraitMasterContainer : function() {
      return this.__portraitMasterContainer;
    },


    /**
     * Returns the button for showing/hiding the masterContainer.
     * @return {qx.ui.mobile.navigationbar.Button}
     */
    getMasterButton : function() {
      return this.__masterButton;
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
     * Called when detailContainer is updated.
     * @param evt {qx.event.type.Data} source event.
     */
    _onDetailContainerUpdate : function(evt) {
      var widget = evt.getData();
      widget.getLeftContainer().remove(this.__masterButton);
      widget.getLeftContainer().add(this.__masterButton);
    },


    /**
     * Factory method for the master button, which is responsible for showing/hiding masterContainer.
     * @return {qx.ui.mobile.navigationbar.Button}
     */
    _createMasterButton : function() {
      return new qx.ui.mobile.navigationbar.Button(this.getMasterTitle());
    },


     /**
     * Factory method for detailContainer.
     * @return {qx.ui.mobile.container.Navigation}
     */
    _createDetailContainer : function() {
      return new qx.ui.mobile.container.Navigation();
    },


    /**
    * Factory method for masterContainer.
    * @return {qx.ui.mobile.container.Navigation}
    */
    _createMasterContainer : function() {
      return new qx.ui.mobile.container.Navigation();
    },


    /**
    * Factory method for the masterDetailContainer.
    * @return {qx.ui.mobile.container.MasterDetail}
    */
    _createMasterDetail : function() {
      return new qx.ui.mobile.container.MasterDetail();
    },


    /**
    * Factory method for masterContainer, when browser/device is in portrait mode.
    * @param masterContainerAnchor {qx.ui.mobile.core.Widget} anchor of the portraitMasterContainer, expected: masterButton.
    * @return {qx.ui.mobile.dialog.Popup}
    */
    _createPortraitMasterContainer : function(masterContainerAnchor) {
      var portraitMasterContainer = new qx.ui.mobile.dialog.Popup();
      portraitMasterContainer.setAnchor(masterContainerAnchor);
      portraitMasterContainer.addCssClass("master-popup");
      return portraitMasterContainer;
    },


    /**
    * Called when user taps on masterButton.
    */
    _onMasterButtonTap : function() {
      if (this.__portraitMasterContainer.isVisible()) {
        this.__portraitMasterContainer.hide();
      } else {
        this.__portraitMasterContainer.show();
        qx.event.Registration.addListener(this.__detailContainer.getContent(), "tap", this._onDetailContainerTap, this);
      }
    },


    /**
     * Reacts on tap at __detailContainer.
     * Hides the __portraitMasterContainer and removes the listener.
     */
    _onDetailContainerTap : function(){
      this.__portraitMasterContainer.hide();

      // Listener should only be installed, as long as portraitMasterContainer is shown.
      qx.event.Registration.removeListener(this.__detailContainer.getContent(), "tap", this._onDetailContainerTap, this);
    },


    /**
    * Called when layout of masterDetailContainer changes.
    * @param evt {qx.event.type.Data} source event.
    */
    _onLayoutChange : function(evt) {
      this.__toggleMasterButtonVisibility();
    },


    /**
    * Called on property changes of masterTitle.
    * @param value {String} new title
    * @param old {String} previous title
    */
    _applyMasterTitle : function(value, old) {
      if(this.__isTablet){
        this.__masterButton.setLabel(value);
        this.__portraitMasterContainer.setTitle(value);
      }
    },


    /**
    * Show/hides master button.
    */
    __toggleMasterButtonVisibility : function()
    {
      if (qx.bom.Viewport.isPortrait()) {
        this.__masterButton.show();
      } else {
        this.__masterButton.exclude();
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
      for(var i=0; i<this.__masterPages.length;i++) {
          var masterPage = this.__masterPages[i];

          qx.event.Registration.removeListener(masterPage, "appear", this._onMasterPageAppear, this);
          qx.event.Registration.removeListener(masterPage, "start", this._onMasterPageStart, this);
      }
    }

    this.__masterPages = null;

    this._disposeObjects("__detailContainer", "__masterContainer", "__masterDetailContainer",
      "__portraitMasterContainer", "__masterButton");
  }
});
