/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * For a mobile application. Supports the mobile widget set.
 *
 * @require(qx.core.Init)
 * @asset(qx/mobile/css/*)
 */
qx.Class.define("qx.application.Mobile",
{
  extend : qx.core.Object,
  implement : [qx.application.IApplication],
  include : qx.locale.MTranslation,


  construct : function()
  {
    this.base(arguments);
  },


  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired when the lifecycle method {@link #start} of any {@link qx.ui.mobile.page.Page page} is called */
    "start" : "qx.event.type.Event",


    /** Fired when the lifecycle method {@link #stop} of any {@link qx.ui.mobile.page.Page page} is called */
    "stop" : "qx.event.type.Event",


    /**
     * Fired when the method {@link qx.ui.mobile.page.Page#back} is called. It is possible to prevent
     * the <code>back</code> event on {@link qx.ui.mobile.page.Page} by calling the
     * {@link qx.event.type.Event#preventDefault}. Data indicating whether the action
     * was triggered by a key event or not.
     */
    "back" : "qx.event.type.Data",


    /** Fired when a {@link qx.ui.mobile.dialog.Popup popup} appears on screen. */
    "popup" : "qx.event.type.Event"
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */


  members :
  {
    __root : null,
    __routing : null,


    // interface method
    main : function()
    {
      this.__root = this._createRootWidget();

      if (qx.core.Environment.get("qx.mobile.nativescroll") == false) {
        this.__root.setShowScrollbarY(false);
      }
    },


    /**
     * Returns the application's root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    getRoot : function() {
      return this.__root;
    },


    /**
     * Returns the application's routing.
     *
     * @return {qx.application.Routing} The application's routing.
     */
    getRouting : function() {
      if(!this.__routing) {
        this.__routing = new qx.application.Routing();
      }
      return this.__routing;
    },


    /**
     * Creates the application's root widget. Override this function to create
     * your own root widget.
     *
     * @return {qx.ui.mobile.core.Widget} The application's root widget.
     */
    _createRootWidget : function()
    {
      return new qx.ui.mobile.core.Root();
    },


    // interface method
    finalize : function()
    {
      // empty
    },


    // interface method
    close : function()
    {
      // empty
    },


    // interface method
    terminate : function()
    {
      // empty
    }
  }
});
