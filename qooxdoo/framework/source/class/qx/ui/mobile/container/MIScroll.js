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

#asset(qx/mobile/js/iscroll.js)
#ignore(iScroll)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
qx.Mixin.define("qx.ui.mobile.container.MIScroll",
{

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.__initScroller();
    this.__registerEventListeners();
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __scroller : null,
    __onDomSubtreeModified : null,

    // Mixin method
    _createScrollerElement : function()
    {
      var scroller = qx.bom.Element.create("div");
      return scroller;
    },


    // Mixin method
    _getScrollerContentElement : function()
    {
      return this.getContainerElement().childNodes[0];
    },


    /**
     * @lint ignoreUndefined(iScroll)
     */
    __initScroller : function()
    {
      var scroller = null;
      if (!window.iScroll)
      {
        var path = qx.util.ResourceManager.getInstance().toUri("qx/mobile/js/iscroll.js");
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          path += "?" + new Date().getTime();
        }
        var loader = new qx.io.ScriptLoader();
        loader.load(path, this.__onScrollerLoaded, this);
      } else {
        this._setScroller(this.__createScrollerInstance());
      }
    },


    __createScrollerInstance : function()
    {
      var desktopCompatibility = qx.core.Environment.get("qx.mobile.emulatetouch");
      var scroller = new iScroll(this.getContentElement(), {desktopCompatibility:desktopCompatibility});
      return scroller;
    },


    __registerEventListeners : function()
    {
      qx.event.Registration.addListener(window, "orientationchange", this._refresh, this);
      // TODO: only add this event for desktop browsers
      qx.event.Registration.addListener(window, "resize", this._refresh, this);
      this.addListener("domupdated", this._refresh, this);
    },


    __unregisterEventListeners : function()
    {
      qx.event.Registration.removeListener(window, "orientationchange", this._refresh, this);
      qx.event.Registration.removeListener(window, "resize", this._refresh, this);
      this.removeListener("domupdated", this._refresh, this);
    },


    __onScrollerLoaded : function(status)
    {
      if (status == "success")
      {
        this._setScroller(this.__createScrollerInstance());
      } else {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          this.error("Could not load iScroll");
        }
      }
    },


    _setScroller : function(scroller)
    {
      this.__scroller = scroller;
    },


    _refresh : function(evt)
    {
      if (this.__scroller) {
        this.__scroller.refresh();
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
    if (this.__scroller) {
      this.__scroller.destroy();
    }
    this.__scroller = this.__onDomSubtreeModified = null;
  }
});
