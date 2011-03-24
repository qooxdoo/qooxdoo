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
    action : "qx.event.type.Event"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    title :
    {
      check : "String",
      init : "",
      apply : "_applyTitle"
    },


    backButtonText :
    {
      check : "String",
      init : "",
      apply : "_applyBackButtonText"
    },


    buttonText :
    {
      check : "String",
      init : "",
      apply : "_applyButtonText"
    },


    showBackButton:
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowBackButton"
    },


    showButton:
    {
      check : "Boolean",
      init : false,
      apply : "_applyShowButton"
    },


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
    __navigationBar : null,
    __title : null,
    __backButton : null,
    __button : null,
    __content : null,
    __scrollContainer : null,


    getContent : function()
    {
      return this.__content;
    },


    _getTitle : function()
    {
      return this.__title;
    },


    _getNavigationBar : function()
    {
      return this.__navigationBar();
    },


    _getBackButton : function()
    {
      return this.__backButton;
    },


    _getButton : function()
    {
      return this.__button;
    },


    _getScrollContainer : function()
    {
      return this.__scrollContainer;
    },


    // property apply
    _applyTitle : function(value, old)
    {
      if (this.__title) {
        this.__title.setValue(value);
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


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      this.__navigationBar = this._createNavigationBar();
      if (this.__navigationBar) {
        this.add(this.__navigationBar);
      }
      this.__scrollContainer = this._createScrollContainer();
      this.__content = this._createContent();
      if (this.__content) {
        this.__scrollContainer.add(this.__content);
      }
      if (this.__scrollContainer) {
        this.add(this.__scrollContainer, {flex:1});
      }
    },

    _createScrollContainer : function()
    {
      return new qx.ui.mobile.container.Scroll();
    },


    _createContent : function()
    {
      var content = new qx.ui.mobile.container.Composite();
      content.setDefaultCssClass(this.getContentCssClass());
      return content;
    },


    _createNavigationBar : function()
    {
      var bar = new qx.ui.mobile.navigationbar.NavigationBar();

      this.__backButton = this._createBackButton();
      if (this.__backButton)
      {
        this.__backButton.addListener("tap", this._onBackButtonTap, this);
        this.__backButton.setValue(this.getBackButtonText());
        this._showBackButton()
        bar.add(this.__backButton);
      }
      

      this.__title = this._createTitle();
      if (this.__title) {
        bar.add(this.__title, {flex:1});
      }

      this.__button = this._createButton();
      if (this.__button)
      {
        this.__button.addListener("tap", this._onButtonTap, this);
        this.__button.setValue(this.getButtonText());
        this._showButton()
        bar.add(this.__button);
      }

      return bar; 
    },


    _createTitle : function()
    {
      return new qx.ui.mobile.navigationbar.Title(this.getTitle());
    },


    _createBackButton : function() {
      return new qx.ui.mobile.navigationbar.BackButton();
    },


    _createButton : function() {
      return new qx.ui.mobile.navigationbar.Button();
    },


    _onBackButtonTap : function(evt)
    {
      this.back();
    },


    _onButtonTap : function(evt)
    {
      this.fireEvent("action");
    }
  },


  destruct : function()
  {
    this.__navigationBar = this.__title = this.__backButton = this.__button = this.__content = this.__scrollContainer = null;
  }
});
