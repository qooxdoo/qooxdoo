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
 * The simple page manager displays the next page without animation. It calls
 * the lifecycle methods of a page.
 * Is used automatically when no transform3d is available.
 *
 */
qx.Class.define("qx.ui.mobile.page.manager.Simple",
{
  extend : qx.core.Object,


 /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param root {qx.ui.mobile.core.Widget?null} Optional. The root widget to use.
   *    If no root is set, the root widget of the application is used.
   *
   */
  construct : function(root)
  {
    this.base(arguments);
    this.__pages = {};
    this._setRoot(root);

    this.__registerEventListeners();
  },




 /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /**
     * Fired when a new page was added to the manager.
     */
    add : "qx.event.type.Data",

    /**
     * Fired when a page was removed from the manager.
     */
    remove : "qx.event.type.Data"
  },



 /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    __pages : null,
    __currentPage : null,
    __root : null,
    __backButtonHandler : null,
    __menuButtonHandler : null,


    /**
     * Registers all needed event listener.
     */
    __registerEventListeners : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        this.__backButtonHandler = qx.lang.Function.bind(this._onBackButton, this);
        this.__menuButtonHandler = qx.lang.Function.bind(this._onMenuButton, this);
        qx.bom.Event.addNativeListener(document, "backbutton", this.__backButtonHandler);
        qx.bom.Event.addNativeListener(document, "menubutton", this.__menuButtonHandler);
      }
    },


    /**
     * Unregisters all needed event listener.
     */
    __unregisteEventListeners : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        qx.bom.Event.removeNativeListener(document, "backbutton", this.__backButtonHandler);
        qx.bom.Event.removeNativeListener(document, "menubutton", this.__menuButtonHandler);
      }
    },


    /**
     * Event handler. Called when the back button of the device was pressed.
     */
    _onBackButton : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        var exit = true;
        if (this.__currentPage) {
          exit = this.__currentPage.back();
        }
        if (exit) {
          navigator.app.exitApp();
        }
      }
    },


    /**
     * Event handler. Called when the menu button of the device was pressed.
     */
    _onMenuButton : function()
    {
      if (qx.core.Environment.get("phonegap") && qx.core.Environment.get("os.name") == "android")
      {
        if (this.__currentPage) {
          this.__currentPage.menu();
        }
      }
    },


    /**
     * Adds a page to the manager.
     *
     * @param page {qx.ui.mobile.page.Page} The page to add
     */
    add : function(page)
    {
      this.__pages[page.getId()] = page;
      this.fireDataEvent("add", page);
    },


    /**
     * Removes a page by its ID.
     *
     * @param id {String} The ID of the page that should be removed
     */
    remove : function(id)
    {
      var page = this.getPage(id);
      delete this.__pages[id];
      this.fireDataEvent("remove", page);
    },


    /**
     * Shows a certain registered page.
     *
     * @param page {qx.ui.mobile.page.Page} The page to show
     */
    show : function(page)
    {
      var currentPage = this.__currentPage;
      if (currentPage == page) {
        return;
      }

      if (qx.core.Environment.get("qx.mobile.nativescroll"))
      {
        // Scroll the page up
        scrollTo(0,0);
      }

      page.initialize();
      page.start();
      this._getRoot().add(page);


      if (currentPage)
      {
        currentPage.stop();
        this.__removeFocusFromInputFields();
        this._removeCurrentPage();
      }

      this._setCurrentPage(page);
    },


    /**
     * Removes the current page from the DOM.
     */
    _removeCurrentPage : function()
    {
      this._getRoot().remove(this.__currentPage);
    },


    /**
     * Returns the root widget. If no root is set, the root of the application
     * is returned.
     *
     * @return {qx.ui.mobile.core.Widget} The used root widget
     */
    _getRoot : function()
    {
      if (this.__root == null) {
        this._setRoot(qx.core.Init.getApplication().getRoot());
      }
      return this.__root;
    },


    /**
     * Sets the root widget.
     *
     * @param root {qx.ui.mobile.core.Widget} The root widget to use
     */
    _setRoot : function(root)
    {
      this.__root = root;
    },


    /**
     * Returns the currently shown page.
     *
     * @return page {qx.ui.mobile.page.Page} The currently shown page
     */
    getCurrentPage : function()
    {
      return this.__currentPage;
    },


    /**
     * Sets the current page. Does not do any logic. Use the {@link #show} method
     * instead.
     *
     * @param page {qx.ui.mobile.page.Page} The currently shown page
     */
    _setCurrentPage : function(page)
    {
      this.__currentPage = page;
    },


    /**
     * Returns a page by its ID.
     *
     * @param id {String} The ID of the page to return
     * @return page {qx.ui.mobile.page.Page} The page with the given ID
     */
    getPage : function(id) {
      return this.__pages[id];
    },


    /**
     * Removes the focus from all input fields in the DOM. Used as on some devices
     * the mouse cursor is still shown, even when the input field is hidden.
     */
    __removeFocusFromInputFields : function()
    {
      // Remove focus from input elements, so that the keyboard and the mouse cursor is hidden
      var elements = document.getElementsByTagName("input");
      for (var i=0, length = elements.length; i < length; i++) {
       elements[i].blur();
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
    this.__unregisteEventListeners();
    this.__history = this.__pages = this.__currentPage = this.__root = null;
  }
});