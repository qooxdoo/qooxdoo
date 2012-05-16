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
 *  manager.addMaster([page1]);
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

  construct : function(isTablet, root)
  {
    this.base(arguments);

    root = root || qx.core.Init.getApplication().getRoot();

    // TODO: Add env check isTablet, see Bug 6392
    this.__isTablet = (isTablet != null) ? isTablet : (qx.core.Environment.get("device.name") == "ipad" || qx.core.Environment.get("device.name") == "pc");
    this.__detailContainer = this._createDetailContainer();
 
    if (this.__isTablet) {
      this.__masterContainer = this._createMasterContainer();
      this.__masterDetailContainer = new this._createMasterDetail();
      this.__masterDetailContainer.addListener("layoutChange", this._onLayoutChange, this);

      this.__masterButton = this._createMasterButton();
      this.__detailContainer.addListener("update", this._onDetailContainerUpdate, this);

      this.__masterButton.addListener("tap", this._onTap, this);

      this.__portraitMasterContainer = this._createPortraitMasterContainer(this.__masterButton);
      this.__masterDetailContainer.setPortraitMasterContainer(this.__portraitMasterContainer);

      root.add(this.__masterDetailContainer, {flex:1});

      this.__masterDetailContainer.getMaster().add(this.__masterContainer, {flex:1});
      this.__masterDetailContainer.getDetail().add(this.__detailContainer, {flex:1});

      this.__toggleMasterButtonVisibility();
    } else {
      root.add(this.__detailContainer);
    }
  },
  
  
  properties : {
    /* The caption/label of the Master Button and Popup Title. */
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


    addMaster : function(pages) {
      if (this.__isTablet) {
        this._add(pages, this.__masterContainer);
      } else {
        this.addDetail(pages);
      }
    },
    
    
    addDetail : function(pages) {
      this._add(pages, this.__detailContainer);
    },


    getPortraitMasterContainer : function() {
      return this.__portraitMasterContainer;
    },
    
    
    getMasterButton : function() {
      return this.__masterButton;
    },


    _add : function(pages, target) {
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        if (qx.core.Environment.get("qx.debug"))
        {
          this.assertInstance(page, qx.ui.mobile.page.NavigationPage);
        }
        target.add(page);
      }
    },
    

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


    _createMasterButton : function() {
      return new qx.ui.mobile.navigationbar.Button(this.getMasterTitle());
    },
    
    
    _createDetailContainer : function() {
      return new qx.ui.mobile.container.Navigation();
    },
    
        
    _createMasterContainer : function() {
      return new qx.ui.mobile.container.Navigation();
    },
    
    
    _createPortraitMasterContainer : function(masterButton) {
      var portraitMasterContainer = new qx.ui.mobile.dialog.Popup();
      
      portraitMasterContainer.setAnchor(masterButton);
      portraitMasterContainer.addCssClass("master-popup");
      return portraitMasterContainer;
    },


    _createMasterDetail : function() {
      return new qx.ui.mobile.container.MasterDetail();
    },


    _onTap : function() {
      if (this.__portraitMasterContainer.isVisible()) {
        this.__portraitMasterContainer.hide();
      } else {
        this.__portraitMasterContainer.show();
      }
    },


    _onLayoutChange : function(evt) {
      this.__toggleMasterButtonVisibility();
    },
    
    
    _applyMasterTitle : function(value, old){
      this.__masterButton.setLabel(value);
      this.__portraitMasterContainer.setTitle(value);
    },
    

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
