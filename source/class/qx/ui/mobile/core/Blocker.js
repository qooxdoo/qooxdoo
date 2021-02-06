/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * This class blocks events and can be included into all widgets.
 *
 */
qx.Class.define("qx.ui.mobile.core.Blocker",
{

  extend : qx.ui.mobile.core.Widget,
  type : "singleton",


  statics:
  {
    ROOT : null
  },


  construct : function()
  {
    this.base(arguments);

    if(qx.ui.mobile.core.Blocker.ROOT == null) {
      qx.ui.mobile.core.Blocker.ROOT = qx.core.Init.getApplication().getRoot();
    }
    this.forceHide();
    qx.ui.mobile.core.Blocker.ROOT.add(this);
  },


  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "blocker"
    }
  },


  members :
  {
    __count : 0,


    /**
     * Shows the blocker. When the show method is called a counter is incremented.
     * The {@link #hide} method needs to be called as many times as the {@link #show}
     * method. This behavior is useful, when you want to show a loading indicator.
     */
    show : function()
    {
      if (this.__count == 0)
      {
        this._updateSize();
        this.__registerEventListener();
        this.base(arguments);
      }
      this.__count++;
    },


    /**
     * Hides the blocker. The blocker is only hidden when the hide method
     * is called as many times as the {@link #show} method.
     */
    hide : function()
    {
      this.__count--;
      if (this.__count <= 0)
      {
        this.__count = 0;
        this.__unregisterEventListener();
        this.exclude();
      }
    },


    /**
     * Force the blocker to hide, even when the show counter is larger than
     * zero.
     */
    forceHide : function()
    {
      this.__count = 0;
      this.hide();
    },


    /**
     * Whether the blocker is shown or not.
     * @return {Boolean} <code>true</code> if the blocker is shown
     */
    isShown : function()
    {
      return this.__count > 0;
    },


    /**
     * Event handler. Called whenever the size of the blocker should be updated.
     */
    _updateSize : function()
    {
      if(qx.ui.mobile.core.Blocker.ROOT == this.getLayoutParent())
      {
        this.getContainerElement().style.top = qx.bom.Viewport.getScrollTop() + "px";
        this.getContainerElement().style.left = qx.bom.Viewport.getScrollLeft() + "px";
        this.getContainerElement().style.width = qx.bom.Viewport.getWidth() + "px";
        this.getContainerElement().style.height = qx.bom.Viewport.getHeight()  + "px";
      }
      else if(this.getLayoutParent() != null)
      {
        var dimension = qx.bom.element.Dimension.getSize(this.getLayoutParent().getContainerElement());
        this.getContainerElement().style.width = dimension.width + "px";
        this.getContainerElement().style.height = dimension.height  + "px";
      }
    },


    /**
     * Event handler. Called when the scroll event occurs.
     *
     * @param evt {Event} The scroll event
     */
    _onScroll : function(evt)
    {
      this._updateSize();
    },


    /**
     * Registers all needed event listener.
     */
    __registerEventListener : function()
    {
      qx.event.Registration.addListener(window, "resize", this._updateSize, this);
      qx.event.Registration.addListener(window, "scroll", this._onScroll, this);
      this.addListener("pointerdown", qx.bom.Event.preventDefault, this);
      this.addListener("pointerup", qx.bom.Event.preventDefault, this);
    },


    /**
     * Unregisters all needed event listener.
     */
    __unregisterEventListener : function()
    {
      qx.event.Registration.removeListener(window, "resize", this._updateSize, this);
      qx.event.Registration.removeListener(window, "scroll", this._onScroll, this);
      this.removeListener("pointerdown", qx.bom.Event.preventDefault, this);
      this.removeListener("pointerup", qx.bom.Event.preventDefault, this);
    }
  },


  destruct : function()
  {
    qx.ui.mobile.core.Blocker.ROOT.remove(this);
    this.__unregisterEventListener();
  }
});
