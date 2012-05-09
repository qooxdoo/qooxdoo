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
    this.__isTablet = isTablet || qx.core.Environment.get("device.name") == "ipad" || qx.core.Environment.get("device.name") == "pc";
    this.__detailContainer = this._createDetailContainer();
 
    if (this.__isTablet) {
      this.__masterContainer = this._createMasterContainer();
      this.__splitPane = new this._createSplitPane();
      this.__splitPane.addListener("layoutChange", this._onLayoutChange, this);

      this.__masterButton = this._createMasterButton();
      this.__detailContainer.setSyncNavigationBarDelegate(qx.lang.Function.bind(this.__syncNavigationBarDelegate, this));

      this.__masterButton.addListener("tap", this._onTap, this);

      this.__portraitMasterContainer = this._createPortraitMasterContainer(this.__masterButton);
      // TODO: ADD Delegate to Navigation Container to add Master Button
      this.__splitPane.setPortraitMasterContainer(this.__portraitMasterContainer);

      root.add(this.__splitPane, {flex:1});

      this.__splitPane.getMaster().add(this.__masterContainer);
      this.__splitPane.getDetail().add(this.__detailContainer);

      this.__toggleMasterButtonVisibility();
    } else {
      root.add(this.__detailContainer);
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
    __splitPane : null,
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


    _add : function(pages, target) {
      // TODO ASSERTIONS
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        target.add(page);
      }
    },


    __syncNavigationBarDelegate : function(navigationBar, widget) {
      navigationBar.addAt(this.__masterButton,0);
    },


    _createMasterButton : function() {
      return new qx.ui.mobile.navigationbar.Button("M");
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


    _createSplitPane : function() {
      return new qx.ui.mobile.container.SplitPane();
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
    this._disposeObjects("__detailContainer", "__masterContainer", "__splitPane",
      "__portraitMasterContainer", "__masterButton");
  }
});
