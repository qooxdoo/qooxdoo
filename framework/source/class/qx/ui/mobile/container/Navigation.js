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
 * The navigation controller includes already a {@link qx.ui.mobile.navigationbar.NavigationBar}
 * and a {@link qx.ui.mobile.container.Composite} container with a {@link qx.ui.mobile.layout.Card} layout.
 * All widgets that implement the {@link qx.ui.mobile.container.INavigation}
 * interface can be added to the container. The added widget provide the title
 * widget and the left/right container, which will be automatically merged into
 * navigation bar.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var container = new qx.ui.mobile.container.Navigation();
 *   this.getRoot(container);
 *   var page = new qx.ui.mobile.page.NavigationPage();
 *   container.add(page);
 *   page.show();
 * </pre>
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
    this._add(this.__content, {flex:1});
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "navigation"
    }
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  events :
  {
    /** Fired when the navigation bar gets updated */
    "update" : "qx.event.type.Data"
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
    __layout : null,


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
        this.assertInterface(widget, qx.ui.mobile.container.INavigation);
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
     * Returns the assigned card layout.
     * @return {qx.ui.mobile.layout.Card} assigned Card Layout.
     */
    getLayout : function(){
      return this.__layout;
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


    /**
     * Creates the content container.
     *
     * @return {qx.ui.mobile.container.Composite} The created content container
     */
    _createContent : function()
    {
      this.__layout = new qx.ui.mobile.layout.Card();
      var content = new qx.ui.mobile.container.Composite(this.__layout);
      this.__layout.addListener("updateLayout", this._onUpdateLayout, this);
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
        this._update(widget);
      }
    },


    /**
     * Updates the navigation bar depending on the set widget.
     *
     * @param widget {qx.ui.mobile.core.Widget} The widget that should be merged into the navigation bar.
     */
    _update : function(widget) {
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

      this.fireDataEvent("update", widget);
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
    this._disposeObjects("__navigationBar", "__content","__layout");
    this.__navigationBar = this.__content = this.__layout = null;
  }
});
