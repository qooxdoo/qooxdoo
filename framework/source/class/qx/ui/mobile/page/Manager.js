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
   * @param isTablet {boolean} flags which indicates whether the manager runs in a tablet environment or not.
   * @param root {qx.ui.mobile.core.Widget?} widget which should be used as root for this manager. 
   */
  construct : function(isTablet, root)
  {
    this.base(arguments);

    root = root || qx.core.Init.getApplication().getRoot();
    
    this.__isTablet = (isTablet != null) ? isTablet : (qx.core.Environment.get("device.type") == "tablet");
    
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
    
    
    /**
     * Adds an array of NavigationPages to masterContainer, if __isTablet is true. Otherwise it will be added to detailContainer.
     * @param pages {qx.ui.mobile.page.NavigationPage[]|qx.ui.mobile.page.NavigationPage} Array of NavigationPages or single NavigationPage.
     */
    addMaster : function(pages) {
      if (this.__isTablet) {
        this._add(pages, this.__masterContainer);
        
        // First page title is  default of MasterButton caption and popup title.
        var masterPage = pages[0];
        if(masterPage){
          this.setMasterTitle(masterPage.getTitle());
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

        target.add(page);
      }
    },
    
    
    /**
     * Called when detailContainer is updated.
     * @param evt {qx.event.type.Data} source event.
     */
    _onDetailContainerUpdate : function(evt) {
      var widget = evt.getData();
      var navigationBar = this.__detailContainer.getNavigationBar();
      //TODO: Remove this. The Navigation Page might implement some magic to remove the back button.
      if (this.__isTablet) {
        if (widget.getLeftContainer()) {
          navigationBar.remove(widget.getLeftContainer());  
        }
      }
      // TODO: END
      navigationBar.addAt(this.__masterButton,0);
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
      }
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
    this._disposeObjects("__detailContainer", "__masterContainer", "__masterDetailContainer",
      "__portraitMasterContainer", "__masterButton");
  }
});
