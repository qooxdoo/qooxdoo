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

 * </pre>
 *
 * This example creates a NavigationPage with a title and a back button. In the
 * <code>initialize</code> lifecycle method a button is added.
 */
qx.Class.define("qx.ui.mobile.container.Navigation",
{
  extend : qx.ui.mobile.container.Composite,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, new qx.ui.mobile.layout.VBox());

    this.__navigationBar = this._createNavigationBar();
    if (this.__navigationBar) {
      this._add(this.__navigationBar);
    }
    
    this.__content = this._createContent();
    this._add(this.__content);

    this._resize();
    qx.event.Registration.addListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.addListener(window, "resize", this._resize, this);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
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
    __navigationBar : null,
    __content : null,
    
    
   /**
     * Resizes the page to the innerHeight of the window.
     */
    _resize : function()
    {
      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        this._setStyle("minHeight", window.innerHeight + "px");
      } else {
        this._setStyle("height", window.innerHeight + "px");
        this.__content._setStyle("minHeight", window.innerHeight + "px");
      }
    },


    // overridden
    add : function(widget) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInterface(widget, qx.ui.mobile.container.INavigation);
      }
      this.getContent().add(widget);
    },


    // overridden
    remove : function(widget) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertInstance(widget, qx.ui.mobile.container.INavigation);
      }
      this.getContent().remove(widget);
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
     * Returns the navigation bar.
     *
     * @return {qx.ui.mobile.navigationbar.NavigationBar} The navigation bar.
     */
    getNavigationBar : function()
    {
      return this.__navigationBar;
    },


    // property apply
    _applyContentCssClass : function(value, old)
    {
      if (this.__content) {
        this.__content.setDefaultCssClass(value);
      }
    },


    /**
     * Creates the content container.
     *
     * @return {qx.ui.mobile.container.Composite} The created content container
     */
    _createContent : function()
    {
      var content = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      content.getLayout().addListener("updateLayout", this._onUpdateLayout, this);
      content.setDefaultCssClass(this.getContentCssClass());
      return content;
    },


    /**
     * Event handler. Called when the "updateLayout" event occurs.
     *
     * @param evt {qx.event.type.Data} The causing event
     */
    _onUpdateLayout : function(evt) {
      var data = evt.getData();
      var widget = data.widget;
      var action = data.action;
      if (action == "visible") {
        this._syncNavigationBarWithWidget(widget);
      }
    },


    _syncNavigationBarWithWidget : function(widget) {
      var navigationBar = this.getNavigationBar();
      navigationBar.removeAll();
      var leftContainer = widget.getLeftContainer();
      if (leftContainer) {
        navigationBar.add(leftContainer);
      }
      var title = widget.getTitleWidget();
      if (title) {
        navigationBar.add(title, {flex:1});
      }
      var rightContainer = widget.getRightContainer();
      if (rightContainer) {
        navigationBar.add(rightContainer);
      }
    },


    /**
     * Creates the navigation bar.
     *
     * @return {qx.ui.mobile.navigationbar.NavigationBar} The created navigation bar
     */
    _createNavigationBar : function()
    {
      return new qx.ui.mobile.navigationbar.NavigationBar();
    }
  },


  destruct : function()
  {
    qx.event.Registration.removeListener(window, "orientationchange", this._resize, this);
    qx.event.Registration.removeListener(window, "resize", this._resize, this);
    this._disposeObjects("__navigationBar", "__content");
    this.__navigationBar = this.__content = null;
  }
});
