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


/* ************************************************************************

#asset(qx/mobile/js/iscroll*.js)
#ignore(iScroll)

************************************************************************ */

/**
 * Mixin for the {@link Scroll} container. Used when the variant
 * <code>qx.mobile.nativescroll</code> is set to "off". Uses the iScroll script to simulate
 * the CSS position:fixed style. Position fixed is not available in iOS and
 * Android < 2.2.
 */
qx.Mixin.define("qx.ui.mobile.container.MIScroll",
{

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param useTransform {Boolean} Whether iScroll should use transforms or not. Set this to false
   *    when input fields are used inside the scroll container.
   */
  construct : function(useTransform)
  {
    this.__useTransform = useTransform !== false ?  true : false;
    this.__initScroll();
    this.__registerEventListeners();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __scroll : null,
    __useTransform : null,

    /**
     * Mixin method. Creates the scroll element.
     *
     * @return {Element} The scroll element
     */
    _createScrollElement : function()
    {
      var scroll = qx.dom.Element.create("div");
      qx.bom.element.Class.add(scroll,"iscroll");
      return scroll;
    },


    /**
     * Mixin method. Returns the scroll content element..
     *
     * @return {Element} The scroll content element
     */
    _getScrollContentElement : function()
    {
      return this.getContainerElement().childNodes[0];
    },


   /**
    * Scrolls the wrapper contents to the x/y coordinates in a given period.
    *
    * @param x {Integer} X coordinate to scroll to.
    * @param y {Integer} Y coordinate to scroll to.
    * @param time {Integer} Time slice in which scrolling should
    *              be done.
    */
    _scrollTo : function(x, y, time)
    {
      if (this.__scroll) {
        this.__scroll.scrollTo(x, y, time);
      }
    },


    /**
     * Loads and inits the iScroll instance.
     *
     * @lint ignoreUndefined(iScroll)
     */
    __initScroll : function()
    {
      if (!window.iScroll)
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          var resource = "qx/mobile/js/iscroll.js";
        } else {
          var resource = "qx/mobile/js/iscroll.min.js";
        }
        var path = qx.util.ResourceManager.getInstance().toUri(resource);
        if (qx.core.Environment.get("qx.debug"))
        {
          path += "?" + new Date().getTime();
        }
        var loader = new qx.bom.request.Script();
        loader.on("load", this.__onScrollLoaded, this);
        loader.open("GET", path);
        loader.send();
      } else {
        this._setScroll(this.__createScrollInstance());
      }
    },


    /**
     * Creates the iScroll instance.
     *
     * @return {iScroll} The iScroll instance
     * @lint ignoreUndefined(iScroll)
     */
    __createScrollInstance : function()
    {
      var scroll = new iScroll(this.getContainerElement(), {
        hideScrollbar:true,
        fadeScrollbar:true,
        hScrollbar : false,
        scrollbarClass:"scrollbar",
        useTransform: this.__useTransform,
        onBeforeScrollStart : function(e) {
          // QOOXDOO ENHANCEMENT: Do not prevent default for form elements
          /* When updating iScroll, please check out that doubleTapTimer is not active (commented out) 
           * in code. DoubleTapTimer creates a fake click event. Android 4.1. and newer  
           * is able to fire native events, which  create side effect with the fake event of iScroll. */
          var target = e.target;
          while (target.nodeType != 1) {
            target = target.parentNode;
          }
          
          if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA' && target.tagName != 'LABEL') {
            // Remove focus from input elements, so that the keyboard and the mouse cursor is hidden
            var elements = [];
            var inputElements = qx.lang.Array.toArray(document.getElementsByTagName("input"));
            var textAreaElements = qx.lang.Array.toArray(document.getElementsByTagName("textarea"));
            elements = elements.concat(inputElements);
            elements = elements.concat(textAreaElements);

            for (var i=0, length = elements.length; i < length; i++) {
              elements[i].blur();
            }

            e.preventDefault();
          }

          // we also want to alert interested parties that we are starting scrolling
          if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
          {
            var iScrollStartEvent = new qx.event.message.Message('iscrollstart');
            qx.event.message.Bus.getInstance().dispatch(iScrollStartEvent);
          }
        }
      });
      return scroll;
    },


    /**
     * Registers all needed event listener.
     */
    __registerEventListeners : function()
    {
      qx.event.Registration.addListener(window, "orientationchange", this._refresh, this);
      qx.event.Registration.addListener(window, "resize", this._refresh, this);
      this.addListener("domupdated", this._refresh, this);
    },


    /**
     * Unregisters all needed event listener.
     */
    __unregisterEventListeners : function()
    {
      qx.event.Registration.removeListener(window, "orientationchange", this._refresh, this);
      qx.event.Registration.removeListener(window, "resize", this._refresh, this);
      this.removeListener("domupdated", this._refresh, this);
    },


    /**
     * Load callback. Called when the iScroll script is loaded.
     *
     * @param request {qx.bom.request.Script} The Script request object
     */
    __onScrollLoaded : function(request)
    {
      if (request.status < 400)
      {
        this._setScroll(this.__createScrollInstance());
      } else {
        if (qx.core.Environment.get("qx.debug"))
        {
          this.error("Could not load iScroll");
        }
      }
    },


    /**
     * Setter for the scroll instance.
     *
     * @param scroll {iScroll} iScroll instance.
     */
    _setScroll : function(scroll)
    {
      this.__scroll = scroll;
    },


    /**
     * Calls the refresh function of iScroll. Needed to recalculate the
     * scrolling container.
     */
    _refresh : function()
    {
      if (this.__scroll) {
        this.__scroll.refresh();
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
    this.__unregisterEventListeners();

    // Cleanup iScroll
    if (this.__scroll) {
      this.__scroll.destroy();
    }
    this.__scroll;
  }
});
